import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
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
  name: string;
  phone: string;
  email?: string;
  course?: string;
  call_time?: string;
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
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = getClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data, error } = await supabase.from("leads").insert(lead).select("id").single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id };
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
