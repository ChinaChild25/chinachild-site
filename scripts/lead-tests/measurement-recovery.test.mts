import assert from "node:assert/strict";
import test from "node:test";
import { measurementRecoveryStatus } from "../../lib/analytics/lead-measurement-recovery.ts";

test("recovery diagnostics expose delayed and ambiguous events without leaking identifiers or suggesting replays", () => {
  const now = 1_800_000_000_000;
  const states = ["pending", "retryable", "sending", "unknown", "failed", "expired", "cancelled"];
  const rows = states.map((state) => ({ id: state, metadata: { leadMeasurement: {
    state, eventTimeSeconds: now / 1000 - 60, clientId: "987654321", sourceUrl: "https://private.invalid/",
  } } }));
  const result = measurementRecoveryStatus(rows, now);
  assert.deepEqual(result.map((v) => v.action), ["safe_recovery", "safe_recovery", ...Array(5).fill("review_without_resend")]);
  assert.equal(JSON.stringify(result).includes("987654321"), false);
  assert.equal(JSON.stringify(result).includes("private.invalid"), false);
  assert.equal(measurementRecoveryStatus([{ id: "old", metadata: { leadMeasurement: { state: "pending", eventTimeSeconds: now / 1000 - 43200 } } }], now)[0].action, "expire_without_send");
  assert.equal(measurementRecoveryStatus([{ id: "invalid", metadata: {} }], now)[0].action, "review_without_resend");
});
