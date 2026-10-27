import { deliverYandexLeadEvent, type ServerLeadTrackingResult } from "./yandex-metrika-delivery.ts";
import type { YandexLeadDeliveryInput } from "./yandex-metrika-delivery.ts";
import { ANALYTICS_CONSENT_VERSION } from "../consent/value.ts";
import { validateYandexClientId } from "./yandex-client-id-value.ts";

export type LeadMeasurementState = "pending" | "sending" | "delivered" | "retryable" | "failed" | "unknown" | "expired";
export type LeadMeasurementEvent = {
  state: LeadMeasurementState;
  clientId: string;
  sourceUrl: string;
  eventTimeSeconds: number;
  consentVersion: string;
};

export type MeasurementStore = {
  transition(leadId: string, expected: LeadMeasurementState, next: LeadMeasurementState, detail?: string): Promise<boolean>;
};

/** One claim and at most one provider request. Never automatically replay an ambiguous send. */
export async function deliverStoredLeadMeasurement(input: {
  leadId: string;
  event: LeadMeasurementEvent;
  store: MeasurementStore;
  env: YandexLeadDeliveryInput["env"];
  now?: number;
  deliver?: typeof deliverYandexLeadEvent;
}): Promise<LeadMeasurementState | "not_claimed"> {
  const { event, store, leadId } = input;
  if (!["pending", "retryable"].includes(event.state)) return "not_claimed";
  if (event.consentVersion !== ANALYTICS_CONSENT_VERSION || !validateYandexClientId(event.clientId) ||
    !Number.isSafeInteger(event.eventTimeSeconds) || event.eventTimeSeconds <= 0 ||
    event.eventTimeSeconds > (input.now ?? Date.now()) / 1000 + 60) {
    await store.transition(leadId, event.state, "failed", "invalid_consent_or_event");
    return "failed";
  }
  if ((input.now ?? Date.now()) / 1000 - event.eventTimeSeconds >= 12 * 60 * 60) {
    await store.transition(leadId, event.state, "expired");
    return "expired";
  }
  if (!await store.transition(leadId, event.state, "sending")) return "not_claimed";
  let result: ServerLeadTrackingResult;
  try {
    result = await (input.deliver ?? deliverYandexLeadEvent)({
      env: input.env, explicitClientId: event.clientId, sourceUrl: event.sourceUrl,
      eventTimeSeconds: event.eventTimeSeconds,
    });
  } catch {
    result = { ok: false, kind: "network", error: "Unexpected measurement transport failure" };
  }
  // A timeout/5xx may have happened after acceptance. MP documents no event-id deduplication.
  const state: LeadMeasurementState = result.ok ? "delivered" :
    result.kind === "configuration" || result.status === 429 ? "retryable" :
    result.kind === "network" || (result.status ?? 0) >= 500 ? "unknown" : "failed";
  if (!await store.transition(leadId, "sending", state, result.ok ? undefined : result.kind)) {
    throw new Error(`Measurement outcome could not be persisted for lead ${leadId}`);
  }
  return state;
}
