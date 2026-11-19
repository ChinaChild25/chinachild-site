import "server-only";
import { getClient } from "@/lib/leads/store";
import { measurementStore } from "./lead-measurement-store";
import { deliverStoredLeadMeasurement, type LeadMeasurementEvent } from "./lead-measurement";


export async function sendStoredLeadMeasurement(leadId: string, event: LeadMeasurementEvent) {
  const client = getClient();
  if (!client) throw new Error("Measurement store unavailable");
  const state = await deliverStoredLeadMeasurement({ leadId, event, store: measurementStore(client), env: process.env });
  if (state !== "delivered" && state !== "not_claimed") console.error("[ym-server] lead measurement outcome", { leadId, state });
  return state;
}
