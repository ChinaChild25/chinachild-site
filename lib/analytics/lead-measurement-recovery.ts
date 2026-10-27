import type { LeadMeasurementEvent } from "./lead-measurement.ts";

export const MEASUREMENT_REVIEW_STATES = ["pending", "retryable", "sending", "unknown", "failed", "expired", "cancelled"];
export const MEASUREMENT_RECOVERY_LIMIT = 25;

/** Diagnostic output deliberately omits ClientID, source URLs, tokens and lead contact data. */
export function measurementRecoveryStatus(rows: Array<{ id: string; metadata: unknown }>, now = Date.now()) {
  return rows.map((row) => {
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
    const event = metadata.leadMeasurement as LeadMeasurementEvent | undefined;
    const validTime = event && Number.isSafeInteger(event.eventTimeSeconds) && event.eventTimeSeconds > 0;
    const ageSeconds = validTime ? Math.floor(now / 1000 - event.eventTimeSeconds) : null;
    const safeState = event?.state === "pending" || event?.state === "retryable";
    return {
      leadId: row.id,
      state: event?.state ?? "invalid",
      ageSeconds,
      action: safeState && ageSeconds !== null && ageSeconds >= 0 && ageSeconds < 43200
        ? "safe_recovery" : safeState && ageSeconds !== null && ageSeconds >= 43200
          ? "expire_without_send" : "review_without_resend",
    };
  });
}
