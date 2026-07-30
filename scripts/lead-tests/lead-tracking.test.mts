import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { trackLeadSubmitted } from "../../lib/analytics.ts";
import {
  buildServerLeadMeasurementBody,
  extractYandexClientId,
  validateYandexMeasurementConfig,
  YANDEX_MEASUREMENT_ENDPOINT,
} from "../../lib/analytics/yandex-metrika-measurement-request.ts";
import { isSpamPayload } from "../../lib/leads/anti-abuse.ts";
import { isPersistedLeadResponse } from "../../lib/leads/contact-response.ts";
import {
  beginLeadSubmission,
  releaseLeadSubmission,
} from "../../lib/leads/submission-gate.ts";

test("contact responses distinguish persisted leads from spam decoys and legacy success shapes", () => {
  assert.equal(
    isPersistedLeadResponse({
      ok: true,
      accepted: true,
      persisted: true,
      id: "lead-123",
    }),
    true,
  );
  assert.equal(
    isPersistedLeadResponse({ ok: true, accepted: false, persisted: false }),
    false,
  );
  assert.equal(isPersistedLeadResponse({ ok: true, id: "lead-123" }), false);
});

test("form-age and honeypot checks use the form availability timestamp", () => {
  const now = 2_000;
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 1_000) }, now),
    false,
  );
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 100) }, now),
    true,
  );
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 1_000), company: "bot" }, now),
    true,
  );
});

test("submission gate blocks same-tick duplicates and allows a retry after rejection", () => {
  const gate = { current: false };
  assert.equal(beginLeadSubmission(gate), true);
  assert.equal(beginLeadSubmission(gate), false);
  releaseLeadSubmission(gate);
  assert.equal(beginLeadSubmission(gate), true);
});

test("accepted lead analytics emit provider-specific events once per stored lead", () => {
  const ymCalls: unknown[][] = [];
  const gtagCalls: unknown[][] = [];
  const dataLayer: unknown[] = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalCounterId = process.env.NEXT_PUBLIC_YM_ID;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ym: (...args: unknown[]) => ymCalls.push(args),
      gtag: (...args: unknown[]) => gtagCalls.push(args),
      dataLayer,
    },
  });
  process.env.NEXT_PUBLIC_YM_ID = "123";

  try {
    const input = {
      leadId: "stored-lead-dedup-test",
      course: "hsk-preparation",
      source: "hsk-result",
    };
    assert.equal(trackLeadSubmitted(input), true);
    assert.equal(trackLeadSubmitted(input), false);
    assert.equal(ymCalls.length, 1);
    assert.deepEqual(ymCalls[0]?.slice(0, 3), [
      123,
      "reachGoal",
      "lead_submitted",
    ]);
    assert.equal(gtagCalls.length, 1);
    assert.deepEqual(gtagCalls[0]?.slice(0, 2), ["event", "generate_lead"]);
    assert.equal(dataLayer.length, 1);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (originalCounterId === undefined) {
      delete process.env.NEXT_PUBLIC_YM_ID;
    } else {
      process.env.NEXT_PUBLIC_YM_ID = originalCounterId;
    }
  }
});

test("Yandex Measurement Protocol validates configuration and keeps its secret out of the URL", () => {
  const missing = validateYandexMeasurementConfig({
    NEXT_PUBLIC_YM_ID: "123",
  });
  assert.deepEqual(missing, {
    ok: false,
    error: "YANDEX_METRIKA_MEASUREMENT_TOKEN is not configured",
  });

  const valid = validateYandexMeasurementConfig({
    NEXT_PUBLIC_YM_ID: "123",
    YANDEX_METRIKA_MEASUREMENT_TOKEN: "measurement-secret",
    NEXT_PUBLIC_SITE_URL: "https://chinachild.ru/",
  });
  assert.equal(valid.ok, true);
  if (!valid.ok) return;

  const body = buildServerLeadMeasurementBody({
    config: valid.config,
    clientId: "1710232430899999999",
    sourceUrl: "https://chinachild.ru/chinese/hsk-test/result",
    eventTimeSeconds: 1_700_000_000,
  });
  assert.equal(YANDEX_MEASUREMENT_ENDPOINT, "https://mc.yandex.ru/collect");
  assert.equal(new URL(YANDEX_MEASUREMENT_ENDPOINT).search, "");
  assert.equal(body.get("tid"), "123");
  assert.equal(body.get("cid"), "1710232430899999999");
  assert.equal(body.get("t"), "pageview");
  assert.equal(body.get("dl"), "https://chinachild.ru/lead-success/server");
  assert.equal(body.get("ms"), "measurement-secret");
});

test("Yandex ClientID parsing rejects malformed or absent cookies", () => {
  assert.equal(
    extractYandexClientId("foo=bar; _ym_uid=1710232430899999999; baz=1"),
    "1710232430899999999",
  );
  assert.equal(extractYandexClientId("_ym_uid=not-a-client"), null);
  assert.equal(extractYandexClientId("_ym_uid=%E0%A4%A"), null);
  assert.equal(extractYandexClientId(null), null);
});

test("HSK lead source keeps mount-time age, persisted-response validation, and a separate details event", async () => {
  const root = process.cwd();
  const inline = await readFile(
    path.join(root, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );
  const resultPage = await readFile(
    path.join(root, "app/chinese/hsk-test/result/page.tsx"),
    "utf8",
  );
  assert.match(inline, /useState\(\(\) => Date\.now\(\)\)/);
  assert.match(inline, /form_started_at: String\(formStartedAt\)/);
  assert.doesNotMatch(inline, /form_started_at: String\(Date\.now\(\)\)/);
  assert.match(inline, /isPersistedLeadResponse\(data\)/);
  assert.doesNotMatch(inline, /HskTestGoals\.lead/);
  assert.match(resultPage, /HskTestGoals\.detailsClicked/);
  assert.doesNotMatch(resultPage, /HskTestGoals\.lead/);
});

test("both lead clients require persisted acceptance and the route awaits fallback work after the response lifecycle", async () => {
  const root = process.cwd();
  const sharedForm = await readFile(
    path.join(root, "components/forms/LeadForm.tsx"),
    "utf8",
  );
  const contactRoute = await readFile(
    path.join(root, "app/api/contact/route.ts"),
    "utf8",
  );
  assert.match(sharedForm, /isPersistedLeadResponse\(data\)/);
  assert.match(sharedForm, /beginLeadSubmission\(submissionGate\)/);
  assert.match(contactRoute, /accepted: false, persisted: false/);
  assert.match(contactRoute, /accepted: true,\s+persisted: true,/);
  assert.match(
    contactRoute,
    /after\(async \(\) => \{\s+const tracking = await trackServerLead/,
  );
  assert.doesNotMatch(contactRoute, /void trackServerLead/);
});
