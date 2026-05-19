import "server-only";

import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS_PER_HOUR = process.env.NODE_ENV === "production" ? 5 : 50;

let cachedClient: SupabaseClient | null = null;

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "chinachild";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

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

export async function checkRateLimit(ipHash: string): Promise<{
  allowed: boolean;
  attempts: number;
}> {
  const supabase = getClient();
  if (!supabase) return { allowed: true, attempts: 0 };

  const now = new Date().toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("lead_rate_limit")
    .select("ip_hash, attempts, first_attempt_at, last_attempt_at")
    .eq("ip_hash", ipHash)
    .single();

  if (!existing) {
    await supabase.from("lead_rate_limit").insert({
      ip_hash: ipHash,
      attempts: 1,
      first_attempt_at: now,
      last_attempt_at: now,
    });
    return { allowed: true, attempts: 1 };
  }

  if (existing.last_attempt_at < oneHourAgo) {
    await supabase
      .from("lead_rate_limit")
      .update({
        attempts: 1,
        first_attempt_at: now,
        last_attempt_at: now,
      })
      .eq("ip_hash", ipHash);
    return { allowed: true, attempts: 1 };
  }

  const newAttempts = existing.attempts + 1;
  await supabase
    .from("lead_rate_limit")
    .update({
      attempts: newAttempts,
      last_attempt_at: now,
    })
    .eq("ip_hash", ipHash);

  return {
    allowed: newAttempts <= MAX_ATTEMPTS_PER_HOUR,
    attempts: newAttempts,
  };
}
