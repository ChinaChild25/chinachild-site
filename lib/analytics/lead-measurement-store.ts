import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadMeasurementEvent, MeasurementStore } from "./lead-measurement.ts";

export function measurementStore(client: SupabaseClient): MeasurementStore { return {
  async transition(leadId, expected, next, detail) {
    const current = await client.from("leads").select("metadata").eq("id", leadId).single();
    if (current.error) throw new Error(`Measurement state read failed: ${current.error.code}`);
    const metadata = current.data.metadata as Record<string, unknown>;
    const event = metadata.leadMeasurement as LeadMeasurementEvent | undefined;
    if (event?.state !== expected) return false;
    // Compare the complete JSON snapshot: never overwrite a concurrent CRM update.
    const result = await client.from("leads").update({ metadata: {
      ...metadata, leadMeasurement: { ...event, state: next, detail: detail ?? null, updatedAt: new Date().toISOString() },
    } }).eq("id", leadId).eq("metadata", JSON.stringify(metadata)).select("id");
    if (result.error) throw new Error(`Measurement state write failed: ${result.error.code}`);
    return result.data.length === 1;
  },
}; }

