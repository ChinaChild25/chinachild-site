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
const harness = { afterTasks, dispatch: () => { emailCount++; return { delivered: [], attempted: 0 }; } };
Object.assign(globalThis, { __contactTestHarness: harness });
const stub = (source: string) => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({
  resolve(specifier: string, context: { parentURL?: string }, next: (specifier: string, context: { parentURL?: string }) => unknown) {
    if (specifier === "server-only") return { url: stub("export {};"), shortCircuit: true };
    if (specifier === "next/server") return { url: stub("export function after(fn){globalThis.__contactTestHarness.afterTasks.push(fn)}"), shortCircuit: true };
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
  if (url.pathname.includes("/rpc/")) return Response.json(null);
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
  if (request.method === "GET") return Response.json(row ? { id, metadata: row.metadata } : null);
  if (request.method === "PATCH") {
    const expected = url.searchParams.get("metadata")?.slice(3);
    if (!row || (expected && JSON.stringify(row.metadata) !== expected)) return Response.json([]);
    Object.assign(row, await request.json());
    return Response.json([{ id }]);
  }
  throw new Error(`Unexpected fixture request ${request.method}`);
};
const { POST } = await import("../../app/api/contact/route.ts");
const base = { name: "Fixture person", phone: "+79991234567", consent_pd: true, consent_marketing: false, form_started_at: String(Date.now() - 10_000), page_path: "/free-trial?yclid=42", source_page: "modal", utm: { utm_source: "yandex", utm_medium: "cpc", yclid: "42" }, yandex_client_id: "987654321" };
const submit = (body: object) => POST(new Request("https://chinachild.ru/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

test("persisted contact pipeline handles opt-out, failure, duplicate retry and recoverable delivery", async () => {
  try {
    let response = await submit({ ...base, consent_pd: false });
    assert.equal(response.status, 400); assert.equal(rows.size, 0); assert.equal(afterTasks.length, 0);
    failPersistence = true;
    response = await submit({ ...base, analytics_consent: true, analytics_consent_version: "v2" });
    assert.equal(response.status, 500); assert.equal(afterTasks.length, 0);
    failPersistence = false;
    const noTracking = await (await submit({ ...base, source_page: "/free-trial?yclid=42", analytics_consent: false })).json();
    assert.equal(noTracking.persisted, true);
    const untracked = rows.get(noTracking.id)!;
    assert.equal(untracked.yclid, undefined); assert.equal(untracked.metadata.yandex_client_id, undefined);
    assert.equal(untracked.source_page, "/free-trial");
    assert.equal(untracked.metadata.leadMeasurement, undefined); assert.equal(afterTasks.length, 0);
    const submission_id = crypto.randomUUID();
    const tracked = { ...base, submission_id, analytics_consent: true, analytics_consent_version: "v2" };
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
  } finally { globalThis.fetch = originalFetch; }
});
