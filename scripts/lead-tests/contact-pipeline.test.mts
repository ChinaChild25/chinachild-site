import assert from "node:assert/strict";
// @ts-expect-error Runtime is Node 24; this repository retains Node 20 type declarations.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import test from "node:test";
import type { LeadMeasurementEvent } from "../../lib/analytics/lead-measurement.ts";

// Real route + real Supabase client, with local in-memory HTTP responses.
// Never load production credentials or reach a network endpoint.
const afterTasks: Array<() => Promise<void>> = [];
let emailCount = 0;
type FixtureRow = Record<string, unknown> & { id: string; metadata: Record<string, unknown> & { leadMeasurement: LeadMeasurementEvent } };
const rows = new Map<string, FixtureRow>();
let failPersistence = false;
let providerStatus = 200;
let providerCalls = 0;
let failDispatch = false;
let failScheduling = false;
let mutateMetadataBeforePatch = false;
let failOutcomeWrite = false;
let raceLeadId: string | undefined;
let raceReads = 0;
let releaseReads: (() => void) | undefined;
let readBarrier: Promise<void> | undefined;
const harness = { afterTasks, after: (fn: () => Promise<void>) => {
  if (failScheduling) throw new Error("fixture scheduler unavailable");
  afterTasks.push(fn);
}, dispatch: () => {
  emailCount++;
  if (failDispatch) throw new Error("fixture email failure");
  return { delivered: [], attempted: 0 };
} };
Object.assign(globalThis, { __contactTestHarness: harness });
const stub = (source: string) => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({
  resolve(specifier: string, context: { parentURL?: string }, next: (specifier: string, context: { parentURL?: string }) => unknown) {
    if (specifier === "server-only") return { url: stub("export {};"), shortCircuit: true };
    if (specifier === "next/server") return { url: stub("export function after(fn){globalThis.__contactTestHarness.after(fn)}"), shortCircuit: true };
    if (specifier === "@/lib/legal/consent-copy") return { url: stub("export const PD_CONSENT_REQUIRED_MESSAGE = 'Consent required';"), shortCircuit: true };
    if (specifier === "@/lib/lead-dispatch") return { url: stub("export async function dispatchLead(){return globalThis.__contactTestHarness.dispatch()}"), shortCircuit: true };
    if (specifier === "@/lib/leads/rate-limit") return { url: stub("export function hashIp(){return 'test-hash'}; export async function checkRateLimit(){return {allowed:true}}"), shortCircuit: true };
    if (specifier.startsWith("@/")) {
      const file = path.join(process.cwd(), specifier.slice(2)) + ".ts";
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    if (specifier.startsWith(".") && !path.extname(specifier) && context.parentURL?.startsWith("file:")) {
      const file = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(file)) return { url: file.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
});
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://local-fixture.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "local-fixture-only";
process.env.NEXT_PUBLIC_YM_ID = "123";
process.env.YANDEX_METRIKA_MEASUREMENT_TOKEN = "local-test-only";
process.env.NEXT_PUBLIC_SITE_URL = "https://chinachild.ru";
delete process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  if (url.host === "mc.yandex.ru") { providerCalls++; return new Response("", { status: providerStatus }); }
  assert.equal(url.host, "local-fixture.invalid", "test attempted an external request");
  if (url.pathname.includes("/rpc/")) return Response.json(true);
  assert.equal(url.pathname, "/rest/v1/leads");
  const id = url.searchParams.get("id")?.slice(3);
  if (request.method === "POST") {
    if (failPersistence) return Response.json({ code: "XX000", message: "fixture store failure" }, { status: 500 });
    const row = await request.json();
    row.id ??= crypto.randomUUID();
    if (rows.has(row.id)) return Response.json({ code: "23505", message: "duplicate" }, { status: 409 });
    rows.set(row.id, row);
    return Response.json({ id: row.id });
  }
  const row = id ? rows.get(id) : undefined;
  if (request.method === "GET") {
    const snapshot = row ? structuredClone({ id, metadata: row.metadata }) : null;
    if (id === raceLeadId && raceReads < 2) {
      raceReads++;
      if (raceReads === 2) releaseReads?.();
      await readBarrier;
    }
    return Response.json(snapshot);
  }
  if (request.method === "PATCH") {
    const patch = await request.json();
    if (row && mutateMetadataBeforePatch) {
      mutateMetadataBeforePatch = false;
      row.metadata = { ...row.metadata, crmNote: "concurrent curator edit" };
    }
    if (failOutcomeWrite && patch.metadata?.leadMeasurement?.state === "delivered") {
      return Response.json({ code: "XX000", message: "fixture outcome failure" }, { status: 400 });
    }
    const expected = url.searchParams.get("metadata")?.slice(3);
    if (!row || (expected && JSON.stringify(row.metadata) !== expected)) return Response.json([]);
    Object.assign(row, patch);
    return Response.json([{ id, metadata: row.metadata }]);
  }
  throw new Error(`Unexpected fixture request ${request.method}`);
};
const { POST } = await import("../../app/api/contact/route.ts");
const base = { measurement_withdrawal_token: "a".repeat(64), measurement_created_at: Date.now(), name: "Fixture person", phone: "+79991234567", consent_pd: true, consent_marketing: false, form_started_at: String(Date.now() - 10_000), page_path: "/free-trial?yclid=42", source_page: "modal", utm: { utm_source: "yandex", utm_medium: "cpc", yclid: "42" }, yandex_client_id: "987654321" };
const submit = (body: object) => POST(new Request("https://chinachild.ru/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

test("persisted contact pipeline handles opt-out, failure, duplicate retry and recoverable delivery", async (t) => {
  try {
    let response = await submit({ ...base, consent_pd: false });
    assert.equal(response.status, 400); assert.equal(rows.size, 0); assert.equal(afterTasks.length, 0);
    failPersistence = true;
    response = await submit({ ...base, analytics_consent: true, analytics_consent_version: "v3", analytics_consent_at: new Date().toISOString() });
    assert.equal(response.status, 500); assert.equal(afterTasks.length, 0);
    failPersistence = false;
    const noTracking = await (await submit({ ...base, source_page: "/free-trial?yclid=42", analytics_consent: false })).json();
    assert.equal(noTracking.persisted, true);
    const untracked = rows.get(noTracking.id)!;
    assert.equal(untracked.yclid, undefined); assert.equal(untracked.metadata.yandex_client_id, undefined);
    assert.equal(untracked.source_page, "/free-trial");
    assert.equal(untracked.metadata.leadMeasurement, undefined); assert.equal(afterTasks.length, 0);
    const submission_id = crypto.randomUUID();
    const tracked = { ...base, submission_id, analytics_consent: true, analytics_consent_version: "v3", analytics_consent_at: new Date().toISOString() };
    const success = await (await submit(tracked)).json();
    assert.equal(success.id, submission_id); assert.equal(afterTasks.length, 1);
    const emailsBefore = emailCount;
    const duplicate = await (await submit(tracked)).json();
    assert.equal(duplicate.id, success.id); assert.equal(emailCount, emailsBefore);
    assert.equal(afterTasks.length, 1); assert.equal(rows.size, 2);
    providerStatus = 429;
    await afterTasks.shift()!();
    assert.equal(rows.get(success.id)!.metadata.leadMeasurement.state, "retryable");
    providerStatus = 200;
    const { sendStoredLeadMeasurement } = await import("../../lib/analytics/lead-measurement.server.ts");
    await sendStoredLeadMeasurement(success.id, rows.get(success.id)!.metadata.leadMeasurement);
    assert.equal(rows.get(success.id)!.metadata.leadMeasurement.state, "delivered");
    await sendStoredLeadMeasurement(success.id, rows.get(success.id)!.metadata.leadMeasurement);
    assert.equal(providerCalls, 2);
    await t.test("invalid analytics evidence preserves the lead but drops all advertising identifiers", async () => {
      for (const evidence of [
        { analytics_consent: "true", analytics_consent_version: "v3", analytics_consent_at: new Date().toISOString() },
        { analytics_consent: true, analytics_consent_version: "v1", analytics_consent_at: new Date().toISOString() },
        { analytics_consent: true, analytics_consent_version: "v3" },
        { analytics_consent: true, analytics_consent_version: "v3", analytics_consent_at: "invalid" },
        { analytics_consent: true, analytics_consent_version: "v3", analytics_consent_at: new Date(Date.now() + 3600_000).toISOString() },
      ]) {
        const result = await (await submit({ ...base, ...evidence, submission_id: crypto.randomUUID() })).json();
        assert.equal(result.persisted, true);
        const row = rows.get(result.id)!;
        assert.equal(row.metadata.analyticsConsent && (row.metadata.analyticsConsent as { allowed: boolean }).allowed, false);
        assert.equal(row.metadata.yandex_client_id, undefined);
        assert.equal(row.yclid, undefined);
        assert.equal(row.metadata.leadMeasurement, undefined);
      }
      assert.equal(afterTasks.length, 0);
    });
    await t.test("missing ClientID never becomes a fabricated identity or a conversion", async () => {
      const result = await (await submit({ ...tracked, submission_id: crypto.randomUUID(), yandex_client_id: "invalid" })).json();
      assert.equal(result.persisted, true);
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement, undefined);
      assert.equal(afterTasks.length, 0);
    });
    await t.test("concurrent POST retries create one row, one notification and one goal task", async () => {
      const input = { ...tracked, submission_id: crypto.randomUUID() };
      const previousRows = rows.size;
      const previousEmails = emailCount;
      const results = await Promise.all([submit(input), submit(input)]);
      assert.deepEqual(await Promise.all(results.map((r) => r.json().then((v) => v.id))), [input.submission_id, input.submission_id]);
      assert.equal(rows.size, previousRows + 1);
      assert.equal(emailCount, previousEmails + 1);
      assert.equal(afterTasks.length, 1);
      await afterTasks.shift()!();
    });
    await t.test("Supabase client CAS with mock HTTP serializes two delivery workers", async () => {
      const result = await (await submit({ ...tracked, submission_id: crypto.randomUUID() })).json();
      afterTasks.length = 0;
      raceLeadId = result.id; raceReads = 0;
      readBarrier = new Promise<void>((resolve) => { releaseReads = resolve; });
      const event = structuredClone(rows.get(result.id)!.metadata.leadMeasurement);
      const previousCalls = providerCalls;
      await Promise.all([sendStoredLeadMeasurement(result.id, event), sendStoredLeadMeasurement(result.id, event)]);
      assert.equal(providerCalls, previousCalls + 1);
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement.state, "delivered");
      raceLeadId = undefined;
    });
    await t.test("a competing CRM metadata write is preserved without sending an unclaimed event", async () => {
      const result = await (await submit({ ...tracked, submission_id: crypto.randomUUID() })).json();
      afterTasks.length = 0;
      mutateMetadataBeforePatch = true;
      const previousCalls = providerCalls;
      await sendStoredLeadMeasurement(result.id, rows.get(result.id)!.metadata.leadMeasurement);
      assert.equal(providerCalls, previousCalls);
      assert.equal(rows.get(result.id)!.metadata.crmNote, "concurrent curator edit");
      await sendStoredLeadMeasurement(result.id, rows.get(result.id)!.metadata.leadMeasurement);
      assert.equal(providerCalls, previousCalls + 1);
      assert.equal(rows.get(result.id)!.metadata.crmNote, "concurrent curator edit");
    });
    await t.test("an accepted provider request whose outcome cannot be saved is never replayed", async () => {
      const result = await (await submit({ ...tracked, submission_id: crypto.randomUUID() })).json();
      afterTasks.length = 0;
      failOutcomeWrite = true;
      const previousCalls = providerCalls;
      await assert.rejects(sendStoredLeadMeasurement(result.id, rows.get(result.id)!.metadata.leadMeasurement));
      failOutcomeWrite = false;
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement.state, "sending");
      await sendStoredLeadMeasurement(result.id, rows.get(result.id)!.metadata.leadMeasurement);
      assert.equal(providerCalls, previousCalls + 1);
    });
    await t.test("a scheduler failure leaves a durable pending event for controlled recovery", async () => {
      failScheduling = true;
      const result = await (await submit({ ...tracked, submission_id: crypto.randomUUID() })).json();
      failScheduling = false;
      assert.equal(result.persisted, true);
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement.state, "pending");
      await sendStoredLeadMeasurement(result.id, rows.get(result.id)!.metadata.leadMeasurement);
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement.state, "delivered");
    });
    await t.test("notification failures cannot turn a stored application into an apparent failure", async () => {
      failDispatch = true;
      const response = await submit({ ...tracked, submission_id: crypto.randomUUID() });
      failDispatch = false;
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.persisted, true);
      assert.equal(afterTasks.length, 1);
      await afterTasks.shift()!();
      assert.equal(rows.get(result.id)!.metadata.leadMeasurement.state, "delivered");
    });
  } finally { globalThis.fetch = originalFetch; }
});
