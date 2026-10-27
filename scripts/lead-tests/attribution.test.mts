import assert from "node:assert/strict";
import test from "node:test";
import { attributionHistory, sourceTouch, sanitizeAttributionTags, ATTRIBUTION_TTL_MS } from "../../lib/attribution/history.ts";
import { applyAttributionConsent, captureAttribution, getLeadAttribution, getLeadPageContext, ATTRIBUTION_STORAGE_KEY } from "../../lib/attribution/browser.ts";
import { deliverStoredLeadMeasurement, type LeadMeasurementEvent, type LeadMeasurementState } from "../../lib/analytics/lead-measurement.ts";
import { validSubmissionId, submissionFingerprint } from "../../lib/leads/submission-identity.ts";
import { syncAnalyticsConsent } from "../../lib/consent/analytics.ts";

const now = Date.now();
const paid = sourceTouch("https://chinachild.ru/?utm_source=yandex&utm_medium=cpc&utm_campaign=118621798&yclid=123456789", "https://yandex.ru/search", now)!;

test("source evidence distinguishes paid, unclassified search, referral, direct, and internal traffic", () => {
  assert.equal(paid.kind, "paid");
  for (const host of ["yandex.ru", "www.google.com", "www.bing.com", "duckduckgo.com"]) {
    assert.equal(sourceTouch("https://chinachild.ru/free-trial", `https://${host}/search`, now)?.kind, "search_unclassified");
  }
  assert.equal(sourceTouch("https://chinachild.ru/", "https://school.example/", now)?.kind, "referral");
  assert.equal(sourceTouch("https://chinachild.ru/", "", now), null);
  assert.equal(sourceTouch("https://chinachild.ru/price?utm_source=bad", "https://my.chinachild.ru/", now), null);
  assert.equal(sourceTouch("https://chinachild.ru/?yclid=12&utm_source=google", "", now)?.kind, "conflicting");
  const named = sourceTouch("https://chinachild.ru/?utm_source=Телеграм%20Ads&utm_medium=cpc", "", now);
  assert.equal(attributionHistory(null, named, now).last?.source, "телеграм ads");
  assert.equal(sourceTouch("https://chinachild.ru/", "https://google.evil.com/", now)?.kind, "referral");
});


test("history retains first and last significant sources separately from last paid; direct never erases tags", () => {
  let h = attributionHistory(null, paid, now);
  h = attributionHistory(h, null, now + 1);
  assert.equal(h.last?.tags.yclid, "123456789");
  h = attributionHistory(h, sourceTouch("https://chinachild.ru/price", "https://www.google.com/search", now + 2), now + 2);
  assert.equal(h.first?.source, "yandex");
  assert.equal(h.last?.source, "google");
  assert.equal(h.lastPaid?.tags.utm_campaign, "118621798");
  assert.equal(h.history.length, 2);
  assert.deepEqual(attributionHistory(h, null, now + ATTRIBUTION_TTL_MS + 3).history, []);
});

test("duplicate arrivals, malformed values, unresolved macros, and oversized history are bounded", () => {
  let h = attributionHistory(null, paid, now);
  assert.equal(attributionHistory(h, paid, now).history.length, 1);
  assert.equal(attributionHistory(h, { ...paid, at: now + 100 }, now + 100).history.length, 1);
  assert.deepEqual(sanitizeAttributionTags({ yclid: "<script>", utm_source: "", ad_id: "{ad_id}", utm_content: "a@b.com", utm_term: "курсы китайского" }), { utm_term: "курсы китайского" });
  for (let i = 1; i <= 110; i++) h = attributionHistory(h, { ...paid, at: now + i, tags: { ...paid.tags, yclid: String(1000 + i) } }, now + i);
  assert.equal(h.history.length, 100);
  assert.equal(h.first?.at, now);
  assert.equal(h.truncated, true);
});

test("no consent means no optional storage or payload; grant captures, withdrawal clears only attribution", () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const values = new Map<string, string>([["essential", "keep"]]);
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { href: "https://chinachild.ru/?utm_source=yandex&utm_medium=cpc&yclid=42" },
    localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, v: string) => values.set(key, v), removeItem: (key: string) => values.delete(key) },
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { referrer: "https://yandex.ru/" } });
  try {
    applyAttributionConsent(false);
    assert.equal(captureAttribution(), undefined);
    assert.deepEqual(getLeadAttribution(), { analytics_consent: false, utm: {} });
    const context = getLeadPageContext("/free-trial?yclid=42", "/free-trial?utm_source=yandex");
    assert.equal(context.source_page, "/free-trial");
    assert.equal(context.page_path, "/free-trial");
    assert.equal(context.referrer, undefined);
    assert.equal(values.has(ATTRIBUTION_STORAGE_KEY), false);
    applyAttributionConsent(true, "v2", new Date().toISOString());
    assert.equal(getLeadAttribution().utm.yclid, "42");
    assert.equal(values.has(ATTRIBUTION_STORAGE_KEY), true);
    // Same document navigation doesn't add a source or erase the original one.
    assert.equal(captureAttribution()?.history.length, 1);
    applyAttributionConsent(false);
    assert.equal(values.has(ATTRIBUTION_STORAGE_KEY), false);
    assert.equal(values.get("essential"), "keep");
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow); else Reflect.deleteProperty(globalThis, "window");
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});

const event: LeadMeasurementEvent = { state: "pending", clientId: "12345", sourceUrl: "https://chinachild.ru/", eventTimeSeconds: Math.floor(now / 1000), consentVersion: "v2" };
function memoryStore(initial: LeadMeasurementState = "pending") {
  let state = initial;
  return { get state() { return state; }, async transition(_id: string, expected: LeadMeasurementState, next: LeadMeasurementState) {
    if (state !== expected) return false;
    state = next; return true;
  } };
}

test("concurrent delivery and duplicate worker attempts produce only one provider request", async () => {
  const store = memoryStore(); let requests = 0;
  const input = { leadId: "lead", event, store, env: {}, now, deliver: async () => { requests++; return { ok: true as const, status: 200 }; } };
  await Promise.all([deliverStoredLeadMeasurement(input), deliverStoredLeadMeasurement(input)]);
  assert.equal(requests, 1); assert.equal(store.state, "delivered");
  assert.equal(await deliverStoredLeadMeasurement(input), "not_claimed");
});

test("explicit rejection can recover; ambiguous transport failure is retained without replay", async () => {
  const store = memoryStore();
  assert.equal(await deliverStoredLeadMeasurement({ leadId: "lead", event, store, env: {}, now,
    deliver: async () => ({ ok: false, kind: "provider", status: 429, error: "rate limit" }) }), "retryable");
  assert.equal(await deliverStoredLeadMeasurement({ leadId: "lead", event: { ...event, state: "retryable" }, store, env: {}, now,
    deliver: async () => ({ ok: true, status: 200 }) }), "delivered");
  const ambiguous = memoryStore();
  assert.equal(await deliverStoredLeadMeasurement({ leadId: "lead", event, store: ambiguous, env: {}, now,
    deliver: async () => ({ ok: false, kind: "network", error: "timeout" }) }), "unknown");
  let replayed = false;
  await deliverStoredLeadMeasurement({ leadId: "lead", event: { ...event, state: "unknown" }, store: ambiguous, env: {}, now,
    deliver: async () => { replayed = true; return { ok: true, status: 200 }; } });
  assert.equal(replayed, false);
});

test("old events expire without artificial pageviews or historical conversions", async () => {
  let requests = 0; const store = memoryStore();
  assert.equal(await deliverStoredLeadMeasurement({ leadId: "lead", event, store, env: {}, now: now + 13 * 3600_000,
    deliver: async () => { requests++; return { ok: true, status: 200 }; } }), "expired");
  assert.equal(requests, 0);
});

test("the exact 30-day boundary expires all source slots without extending the lifetime", () => {
  const h = attributionHistory(null, paid, now);
  assert.equal(attributionHistory(h, null, now + ATTRIBUTION_TTL_MS - 1).lastPaid?.source, "yandex");
  const expired = attributionHistory(h, null, now + ATTRIBUTION_TTL_MS);
  assert.equal(expired.first, null);
  assert.equal(expired.last, null);
  assert.equal(expired.lastPaid, null);
  assert.deepEqual(expired.history, []);
});

test("recovery cannot send invalid consent evidence, identifiers or future event times", async () => {
  for (const invalid of [
    { ...event, consentVersion: "v1" }, { ...event, clientId: "invalid" },
    { ...event, eventTimeSeconds: Number.NaN },
    { ...event, eventTimeSeconds: Math.floor(now / 1000) + 3600 },
  ]) {
    const store = memoryStore(); let requests = 0;
    assert.equal(await deliverStoredLeadMeasurement({ leadId: "lead", event: invalid, store, env: {}, now,
      deliver: async () => { requests++; return { ok: true, status: 200 }; } }), "failed");
    assert.equal(requests, 0);
  }
});

test("submission identity survives retries but distinguishes changed contact content", () => {
  assert.equal(validSubmissionId("123e4567-e89b-42d3-a456-426614174000"), "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(validSubmissionId("not-a-uuid"), undefined);
  const lead = { name: "Test", phone: "+79990000000", course: "hsk" };
  assert.equal(submissionFingerprint(lead), submissionFingerprint({ ...lead }));
  assert.notEqual(submissionFingerprint(lead), submissionFingerprint({ ...lead, course: "individual" }));
  assert.notEqual(submissionFingerprint(lead), submissionFingerprint({ ...lead, call_time: "завтра" }));
});

test("withdrawal clears pending vendor commands, disables GA, and removes only analytics cookies", () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  process.env.NEXT_PUBLIC_GA_ID = "G-FIXTURE";
  const removed: string[] = [];
  const queue = [[123, "init"], [123, "hit"]];
  const vendor = Object.assign(() => {}, { a: queue });
  const fake = { location: { hostname: "chinachild.ru", href: "https://chinachild.ru/" },
    localStorage: { getItem: () => null, removeItem: () => {}, setItem: () => {} },
    ym: vendor, __ccYmLoaderPending: true };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fake });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    referrer: "", get cookie() { return "_ym_uid=123; _ga=456; cc_website_chat_visitor=keep"; },
    set cookie(value: string) { removed.push(value); },
  } });
  try {
    applyAttributionConsent(true);
    syncAnalyticsConsent(false);
    assert.equal(queue.length, 0);
    assert.equal((fake as unknown as Record<string, unknown>)["ga-disable-G-FIXTURE"], true);
    assert.equal(removed.length, 6);
    assert.equal(removed.some((v) => v.includes("cc_website_chat")), false);
  } finally {
    if (gaId === undefined) delete process.env.NEXT_PUBLIC_GA_ID; else process.env.NEXT_PUBLIC_GA_ID = gaId;
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow); else Reflect.deleteProperty(globalThis, "window");
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});
