import assert from "node:assert/strict";
import test from "node:test";
import { applyAttributionConsent } from "../../lib/attribution/browser.ts";
import { prepareLeadMeasurement, withdrawLeadMeasurements, flushMeasurementWithdrawals } from "../../lib/analytics/measurement-withdrawal-browser.ts";

test("privacy cancellation capabilities survive offline, are bounded, do not contain advertising data and cannot be reused after withdrawal", async () => {
  const data: Record<string, string> = {};
  const storage = new Proxy({ getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; }, removeItem: (k: string) => { delete data[k]; } }, {
    ownKeys: () => Object.keys(data), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
  const listeners: Record<string, () => void> = {};
  Object.assign(globalThis, { window: { localStorage: storage, addEventListener: (key: string, fn: () => void) => { listeners[key] = fn; }, location: { href: "https://chinachild.ru/" }, performance: { getEntriesByType: () => [] } }, document: { referrer: "" } });
  const originalFetch = globalThis.fetch;
  let online = false;
  const calls: Array<{ count: number; body: string }> = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "/api/measurement-withdrawal");
    assert.equal(init?.keepalive, true);
    const body = String(init?.body); const events = JSON.parse(body).events;
    calls.push({ count: events.length, body });
    assert.ok(events.length <= 25);
    if (!online) throw new TypeError("offline");
    return Response.json({ ok: true });
  };
  try {
    applyAttributionConsent(false);
    assert.deepEqual(prepareLeadMeasurement(crypto.randomUUID()), {});
    data["cookie-consent-v2"] = JSON.stringify({ analytics: true, version: "v3" });
    applyAttributionConsent(true, "v3", new Date().toISOString());
    const id = crypto.randomUUID(); const credential = prepareLeadMeasurement(id);
    assert.match(credential.measurement_withdrawal_token!, /^[0-9a-f]{64}$/);
    assert.deepEqual(prepareLeadMeasurement(id), credential);
    for (let i=0; i<99; i++) prepareLeadMeasurement(crypto.randomUUID());
    assert.deepEqual(prepareLeadMeasurement(crypto.randomUUID()), {});
    withdrawLeadMeasurements();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(Object.keys(data).filter(k => k.startsWith("cc-measurement-withdrawal:")).length, 100);
    assert.ok(calls.every(v => !/clientId|yclid|utm_|phone|sourceUrl/.test(v.body)));
    assert.equal(calls.length, 1);
    data["cookie-consent-v2"] = JSON.stringify({ analytics: false, version: "v3" });
    assert.deepEqual(prepareLeadMeasurement(id), {});
    online = true;
    const before = calls.length;
    await flushMeasurementWithdrawals();
    assert.equal(calls.length - before, 4);
    assert.equal(Object.keys(data).filter(k => k.startsWith("cc-measurement-withdrawal:")).length, 0);
    assert.ok(data["cookie-consent-v2"]);
    assert.ok(listeners.online);
  } finally { globalThis.fetch = originalFetch; }
});
