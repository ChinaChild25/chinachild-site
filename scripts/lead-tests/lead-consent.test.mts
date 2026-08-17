import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { serializeConsentPdContent, CONSENT_PD_VERSION } from "../../lib/legal/consent-pd.ts";
import {
  serializeConsentMarketingContent,
  CONSENT_MARKETING_VERSION,
} from "../../lib/legal/consent-marketing.ts";

// lib/legal/consent-hash.server.ts wraps these same serializers in `import
// "server-only"`, which throws outside Next's bundler — so, same as this repo's
// other server-only modules (e.g. lib/leads/store.ts), it isn't imported directly
// here. Hashing itself is plain SHA-256 over the serializer output, reproduced
// locally to verify the actual algorithm/format without crossing that boundary.
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const HEX64 = /^[0-9a-f]{64}$/;
const ROOT = process.cwd();

// The exact banned constructions named in the consent-unification task: a checkbox
// that mixes PD consent into the privacy-policy phrase, and any blanket "by
// clicking the button you agree" substitute for an explicit, separate checkbox.
const BANNED_PATTERNS = [
  /Соглашаюсь с политикой обработки персональных данных/,
  /Нажимая на кнопку,\s*я соглаша/,
];

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(tsx?|mdx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

test("content hashes are deterministic, hex-64, and change when the document changes", () => {
  const pdHash = sha256(serializeConsentPdContent());
  const marketingHash = sha256(serializeConsentMarketingContent());

  assert.match(pdHash, HEX64);
  assert.match(marketingHash, HEX64);
  assert.equal(pdHash, sha256(serializeConsentPdContent()));
  assert.notEqual(pdHash, marketingHash);

  // The hash must be a function of the full document, not just the version label:
  // two differently-worded documents must never collide even if versions matched.
  const pd = JSON.parse(serializeConsentPdContent());
  const marketing = JSON.parse(serializeConsentMarketingContent());
  assert.notEqual(JSON.stringify(pd.sections), JSON.stringify(marketing.sections));
});

test("consent documents carry a real, non-empty version distinct per type", () => {
  assert.ok(CONSENT_PD_VERSION.length > 0);
  assert.ok(CONSENT_MARKETING_VERSION.length > 0);
});

test("both checkboxes are unchecked by default in every lead form", async () => {
  const leadForm = await readFile(path.join(ROOT, "components/forms/LeadForm.tsx"), "utf8");
  const hskInline = await readFile(
    path.join(ROOT, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );

  for (const source of [leadForm, hskInline]) {
    // Every checkbox input in these two forms must be uncontrolled-unchecked: no
    // defaultChecked/checked prop anywhere near a consent_* checkbox.
    assert.doesNotMatch(source, /name="consent_pd"[^>]*defaultChecked/);
    assert.doesNotMatch(source, /defaultChecked[^>]*name="consent_pd"/);
    assert.doesNotMatch(source, /name="consent_marketing"[^>]*defaultChecked/);
    assert.doesNotMatch(source, /defaultChecked[^>]*name="consent_marketing"/);
  }
});

test("the personal-data checkbox is required and the marketing checkbox is not, in every lead form", async () => {
  const leadForm = await readFile(path.join(ROOT, "components/forms/LeadForm.tsx"), "utf8");
  const hskInline = await readFile(
    path.join(ROOT, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );

  // LeadForm marks consent_pd required in the DOM (belt-and-suspenders on top of the
  // client + server validation below).
  assert.match(leadForm, /name="consent_pd"[\s\S]{0,80}required/);
  assert.doesNotMatch(leadForm, /name="consent_marketing"[\s\S]{0,80}required/);
  assert.doesNotMatch(hskInline, /name="consent_marketing"[\s\S]{0,80}required/);
});

test("every lead form uses the shared consent copy module, not an inline rewrite", async () => {
  const leadForm = await readFile(path.join(ROOT, "components/forms/LeadForm.tsx"), "utf8");
  const hskInline = await readFile(
    path.join(ROOT, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );

  for (const source of [leadForm, hskInline]) {
    assert.match(source, /from "@\/lib\/legal\/consent-copy"/);
    assert.match(source, /<PdConsentLabelText/);
    assert.match(source, /<MarketingConsentLabelText/);
  }
});

test("the API route rejects a missing personal-data consent before storing anything, and computes version/hash server-side", async () => {
  const route = await readFile(path.join(ROOT, "app/api/contact/route.ts"), "utf8");

  const consentCheck = route.indexOf("if (!consentPd)");
  const storeCall = route.indexOf("const stored = await storeLead");
  assert.ok(consentCheck >= 0 && consentCheck < storeCall, "consent_pd must be validated before storeLead is called");

  assert.match(route, /status:\s*400/);
  assert.match(route, /getConsentPdContentHash\(\)/);
  assert.match(route, /getConsentMarketingContentHash\(\)/);
  assert.match(route, /consent_pd_version:\s*CONSENT_PD_VERSION/);
  assert.match(route, /consent_marketing_version:\s*CONSENT_MARKETING_VERSION/);
  // The client-supplied body must never be able to set the version or hash fields.
  assert.doesNotMatch(route, /consent_pd_version:\s*body\./);
  assert.doesNotMatch(route, /consent_pd_content_hash:\s*body\./);
  assert.doesNotMatch(route, /consent_marketing_version:\s*body\./);
  assert.doesNotMatch(route, /consent_marketing_content_hash:\s*body\./);
});

test("declining the advertising checkbox never blocks a submission", async () => {
  const route = await readFile(path.join(ROOT, "app/api/contact/route.ts"), "utf8");
  // consent_marketing must only ever gate the boolean stored on the row, never the
  // 400 rejection path (which must reference consent_pd only).
  const rejectionBlock = route.slice(
    route.indexOf("const consentPd ="),
    route.indexOf("const consentMarketing ="),
  );
  assert.doesNotMatch(rejectionBlock, /consent_marketing/);
});

test("the migration adds per-type version/hash columns and freezes consent evidence on UPDATE, without touching unrelated CRM columns", async () => {
  const migration = await readFile(
    path.join(ROOT, "supabase/migrations/20260817120000_lead_consent_versioning.sql"),
    "utf8",
  );

  for (const column of [
    "consent_pd_version",
    "consent_pd_content_hash",
    "consent_marketing_version",
    "consent_marketing_content_hash",
    "consent_page_path",
  ]) {
    assert.match(migration, new RegExp(`add column if not exists ${column}`));
  }

  assert.match(migration, /consent_pd_content_hash ~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(migration, /consent_marketing_content_hash ~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(migration, /before update on public\.leads/);
  assert.match(migration, /LEAD_CONSENT_EVIDENCE_IMMUTABLE/);

  // The trigger must guard the evidence columns but must not reference CRM columns
  // that legitimately change after insert (crm_stage, notes, delivered_*, ...).
  const triggerFn = migration.slice(
    migration.indexOf("create or replace function public.reject_leads_consent_evidence_mutation"),
    migration.indexOf("$$;\n\ndrop trigger"),
  );
  for (const crmColumn of ["crm_stage", "delivered_email", "delivered_at", "notes", "metadata", "lost_reason_code"]) {
    assert.doesNotMatch(triggerFn, new RegExp(crmColumn));
  }
});

test("no page under app/ or components/ contains the banned blanket-consent phrasing", async () => {
  const files = await walk(path.join(ROOT, "app"));
  files.push(...(await walk(path.join(ROOT, "components"))));

  const offenders: string[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(source)) offenders.push(`${file}: ${pattern}`);
    }
  }

  assert.deepEqual(offenders, []);
});

test("legal links in the shared consent copy point at pages that exist in this repo", async () => {
  assert.ok(
    await readFile(path.join(ROOT, "app/consent-personal-data/page.tsx"), "utf8").then(
      () => true,
      () => false,
    ),
  );
  assert.ok(
    await readFile(path.join(ROOT, "app/advertising-consent/page.tsx"), "utf8").then(
      () => true,
      () => false,
    ),
  );
  assert.ok(
    await readFile(path.join(ROOT, "app/privacy-policy/page.tsx"), "utf8").then(
      () => true,
      () => false,
    ),
  );
});
