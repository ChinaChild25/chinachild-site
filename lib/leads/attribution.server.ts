import "server-only";
import { attributionHistory } from "@/lib/attribution/history";
import { validateYandexClientId } from "@/lib/analytics/yandex-client-id-value";
import { getClient } from "./store";

/** Optional evidence attachment must never turn a successful contact into a failed contact. */
export async function attachLeadAttribution(leadId: string, input: {
  analytics_consent?: unknown; attribution?: unknown; yandex_client_id?: unknown;
}): Promise<void> {
  if (input.analytics_consent !== true) return;
  const client = getClient();
  if (!client) return;
  const incoming = attributionHistory(input.attribution, null);
  const clientId = validateYandexClientId(input.yandex_client_id);
  if (!incoming.history.length && !clientId) return;
  try {
    const current = await client.from("leads").select("metadata").eq("id", leadId).single();
    if (current.error) throw new Error(current.error.code);
    const metadata = current.data.metadata as Record<string, unknown>;
    const previous = attributionHistory(metadata.attribution, null);
    let merged = previous;
    for (const touch of incoming.history) merged = attributionHistory(merged, touch);
    const result = await client.from("leads").update({ metadata: {
      ...metadata, attribution: merged, ...(clientId ? { yandex_client_id: clientId } : {}),
    } }).eq("id", leadId).eq("metadata", JSON.stringify(metadata)).select("id");
    if (result.error || !result.data.length) throw new Error("write_conflict");
  } catch { console.error("[lead] attribution attachment incomplete", { leadId }); }
}
