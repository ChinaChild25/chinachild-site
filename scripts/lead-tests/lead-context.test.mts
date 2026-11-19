import assert from "node:assert/strict";
import test from "node:test";
import { documentLeadContext, sanitizeLeadContext, summarizeLeadContext } from "../../lib/attribution/lead-context.ts";
import { applyAttributionConsent, getLeadPageContext } from "../../lib/attribution/browser.ts";

test("submission context distinguishes ads, search, referrals and absent evidence without a counter", () => {
  for (const [url, referrer, channel, source] of [
    ["https://chinachild.ru/course?yclid=42&utm_campaign=118621798", "https://yandex.ru/", "paid", "yandex"],
    ["https://chinachild.ru/course?gclid=GoogleClick", "", "paid", "google"],
    ["https://chinachild.ru/course?utm_source=google&utm_medium=organic", "", "organic", "google"],
    ["https://chinachild.ru/course", "https://yandex.ru/search?text=private", "search", "yandex"],
    ["https://chinachild.ru/course", "https://school.example/article?email=private", "referral", "school.example"],
    ["https://chinachild.ru/course?utm_source=telegram&utm_medium=messenger", "", "other", "telegram"],
    ["https://chinachild.ru/course", "", "unknown", undefined],
    ["https://chinachild.ru/course", "https://chinachild.ru/blog/x", "unknown", undefined],
    ["https://chinachild.ru/course?yclid=42&utm_source=google", "", "unknown", "unknown"],
  ]) {
    const context = sanitizeLeadContext(documentLeadContext(url!, referrer!))!;
    const result = summarizeLeadContext(context);
    assert.equal(result.channel, channel, url); assert.equal(result.source, source, url);
    assert.doesNotMatch(JSON.stringify(context), /text=private|email=private/);
  }
});

test("a full navigation recovers tags only from a same-origin landing URL", () => {
  const own = documentLeadContext("https://chinachild.ru/free-trial", "https://chinachild.ru/course?yclid=42&utm_campaign=123")!;
  assert.equal(own.landingPath, "/course"); assert.equal(own.tags.yclid, "42");
  assert.equal(summarizeLeadContext(own).channel, "paid");
  const external = documentLeadContext("https://chinachild.ru/free-trial", "https://other.example/?yclid=42")!;
  assert.deepEqual(external.tags, {}); assert.equal(summarizeLeadContext(external).channel, "referral");
  const preview = documentLeadContext("http://localhost:3199/free-trial", "http://localhost:3199/course")!;
  assert.equal(summarizeLeadContext(preview).channel, "unknown");
  assert.equal(summarizeLeadContext(preview).reason, "internal_referrer");
});

test("malformed context cannot inject URLs, arbitrary properties or credentials into a lead", () => {
  for (const value of [null, [], {}, { version: 1, basis: "form_submission", landingPath: "//evil.test" },
    { version: 1, basis: "form_submission", landingPath: "/x\\evil" }]) assert.equal(sanitizeLeadContext(value), undefined);
  const context = sanitizeLeadContext({ version: 1, basis: "form_submission", landingPath: "/course?email=secret#hash",
    referrerHost: "evil.test/path?q=private", clientId: "private", channel: "paid", tags: { yclid: "<script>", utm_source: "yandex", email: "private" } })!;
  assert.equal(context.landingPath, "/course"); assert.equal(context.referrerHost, undefined);
  assert.deepEqual(context.tags, { utm_source: "yandex" }); assert.doesNotMatch(JSON.stringify(context), /private|secret|script/);
});

test("form submission reads original document after SPA navigation with zero storage access without analytics", () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  let accesses = 0;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { href: "https://chinachild.ru/free-trial" },
    performance: { getEntriesByType: () => [{ name: "https://chinachild.ru/course?yclid=42&utm_campaign=123" }] },
    localStorage: { removeItem: () => {}, getItem: () => { accesses++; throw new Error("blocked"); }, setItem: () => { accesses++; throw new Error("blocked"); } },
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { referrer: "https://yandex.ru/search" } });
  try {
    for (const status of ["not_decided", "declined"]) {
      applyAttributionConsent(false, status === "declined" ? "v3" : undefined, status === "declined" ? new Date().toISOString() : undefined);
      const payload = getLeadPageContext("/free-trial", "/free-trial");
      assert.equal(payload.analytics_consent, false); assert.equal(payload.analytics_consent_status, status);
      assert.equal(payload.lead_context?.landingPath, "/course"); assert.equal(payload.lead_context?.tags.yclid, "42");
      assert.equal("attribution" in payload, false); assert.equal(accesses, 0);
    }
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow); else Reflect.deleteProperty(globalThis, "window");
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});
