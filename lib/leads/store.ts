import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { submissionFingerprint } from "./submission-identity";

let cachedClient: SupabaseClient | null = null;

/** Service-role client for server-side lead writes; null when Supabase is not configured. */
export function getClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export type LeadInsert = {
  id?: string;
  metadata?: Record<string, unknown>;
  name: string;
  phone: string;
  email?: string;
  course?: string;
  call_time?: string;
  timezone?: string;
  message?: string;
  consent_pd: boolean;
  consent_marketing: boolean;
  consent_pd_version: string;
  consent_pd_content_hash: string;
  consent_marketing_version: string;
  consent_marketing_content_hash: string;
  consent_accepted_at: string;
  source_page?: string;
  consent_page_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  yclid?: string;
  gclid?: string;
  referrer?: string;
  ip_hash?: string;
  user_agent?: string;
};

export async function storeLead(
  lead: LeadInsert,
): Promise<{ ok: true; id: string; duplicate: boolean } | { ok: false; error: string }> {
  const supabase = getClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const metadata = { ...lead.metadata, submissionFingerprint: submissionFingerprint(lead) };
  const { data, error } = await supabase.from("leads").insert({ ...lead, metadata }).select("id").single();

  if (error?.code === "23505" && lead.id) {
    const existing = await supabase.from("leads").select("id,metadata").eq("id", lead.id).single();
    if (!existing.error && existing.data.metadata?.submissionFingerprint === metadata.submissionFingerprint) {
      return { ok: true, id: existing.data.id, duplicate: true };
    }
    return { ok: false, error: "Submission identity conflict" };
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id, duplicate: false };
}

export async function markLeadDelivered(
  id: string,
  success: boolean,
  errorMsg?: string,
): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  await supabase
    .from("leads")
    .update({
      delivered_email: success,
      delivered_email_error: errorMsg ?? null,
      delivered_at: new Date().toISOString(),
    })
    .eq("id", id);
}
