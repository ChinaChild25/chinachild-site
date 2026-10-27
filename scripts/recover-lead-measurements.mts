import { createClient } from "@supabase/supabase-js";
import { deliverStoredLeadMeasurement, type LeadMeasurementEvent } from "../lib/analytics/lead-measurement.ts";
import { measurementStore } from "../lib/analytics/lead-measurement-store.ts";
import { validateYandexMeasurementConfig } from "../lib/analytics/yandex-metrika-measurement-request.ts";
import { MEASUREMENT_RECOVERY_LIMIT, MEASUREMENT_REVIEW_STATES, measurementRecoveryStatus } from "../lib/analytics/lead-measurement-recovery.ts";

// Manual recovery only. Default is read-only. Budget: one preflight, <=25 events,
// <=25 provider requests, <=100 state queries. No schedule, loops beyond this batch, or retries.
const apply = process.argv.includes("--apply");
if (apply) {
  const config = validateYandexMeasurementConfig(process.env);
  if (!config.ok) throw new Error(config.error);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("CRM configuration unavailable");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const result = await client.from("leads").select("id,metadata")
  .in("metadata->leadMeasurement->>state", apply ? ["pending", "retryable"] : MEASUREMENT_REVIEW_STATES)
  .order("created_at", { ascending: true }).limit(MEASUREMENT_RECOVERY_LIMIT + 1);
if (result.error) throw new Error(`Recovery preflight failed: ${result.error.code}`);
const rows = result.data.slice(0, MEASUREMENT_RECOVERY_LIMIT);
console.log(JSON.stringify({ mode: apply ? "apply" : "status", limit: MEASUREMENT_RECOVERY_LIMIT,
  hasMore: result.data.length > MEASUREMENT_RECOVERY_LIMIT, events: measurementRecoveryStatus(rows) }));
if (apply) {
  const outcomes: Record<string, number> = {};
  for (const row of rows) {
    const state = await deliverStoredLeadMeasurement({ leadId: row.id, event: row.metadata.leadMeasurement as LeadMeasurementEvent, store: measurementStore(client), env: process.env });
    outcomes[state] = (outcomes[state] ?? 0) + 1;
  }
  console.log(JSON.stringify({ outcomes }));
}
