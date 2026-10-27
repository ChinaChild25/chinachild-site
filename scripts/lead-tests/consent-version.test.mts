import assert from "node:assert/strict";
import test from "node:test";
import { readConsent, hasAnalyticsConsentEvidence } from "../../lib/consent/value.ts";
const state = { necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString(), version: "v3" };
test("renew every legacy analytics grant but preserve explicit legacy refusal", () => {
  assert.equal(readConsent(JSON.stringify({ ...state, version: "v2" })), null);
  assert.equal(readConsent(JSON.stringify({ ...state, version: "v2", analytics: false }))?.analytics, false);
  assert.equal(readConsent(JSON.stringify(state))?.analytics, true);
  assert.equal(readConsent(JSON.stringify({ ...state, timestamp: "bad" })), null);
  assert.equal(readConsent(JSON.stringify({ ...state, timestamp: new Date(Date.now()+3600000).toISOString() })), null);
  assert.equal(hasAnalyticsConsentEvidence({ analytics_consent: true, analytics_consent_version: "v2", analytics_consent_at: state.timestamp }), false);
});
