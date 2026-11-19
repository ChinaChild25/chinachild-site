import { createClient } from "@supabase/supabase-js";
import { deliverStoredLeadMeasurement, type LeadMeasurementEvent } from "../lib/analytics/lead-measurement.ts";
import { measurementStore } from "../lib/analytics/lead-measurement-store.ts";
import { validateYandexMeasurementConfig } from "../lib/analytics/yandex-metrika-measurement-request.ts";

// Manual recovery only. Default is read-only. Budget: one preflight, <=25 events,
// <=25 provider requests, <=100 state queries. No schedule, loops beyond this batch, or retries.
const apply = process.argv.includes("--apply");
const config = validateYandexMeasurementConfig(process.env);
if (!config.ok) throw new Error(config.error);
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("CRM configuration unavailable");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const result = await client.from("leads").select("id,metadata")
  .gte("created_at", new Date(Date.now() - 12 * 3600_000).toISOString())
  .in("metadata->leadMeasurement->>state", ["pending", "retryable"])
  .order("created_at", { ascending: true }).limit(25);
if (result.error) throw new Error(`Recovery preflight failed: ${result.error.code}`);
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", eligible: result.data.length, limit: 25 }));
if (apply) {
  const outcomes: Record<string, number> = {};
  for (const row of result.data) {
    const state = await deliverStoredLeadMeasurement({ leadId: row.id, event: row.metadata.leadMeasurement as LeadMeasurementEvent, store: measurementStore(client), env: process.env });
    outcomes[state] = (outcomes[state] ?? 0) + 1;
  }
  console.log(JSON.stringify({ outcomes }));
}
