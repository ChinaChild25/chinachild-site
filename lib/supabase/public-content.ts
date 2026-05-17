import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read-only Supabase client for public educational content.
// Uses the same project as chinachild-sandbox; the anon key + RLS policies
// added in migration 20260717120000_public_content_anon_select.sql restrict
// reads to published grammar articles, system/imported HSK decks, and
// dictionary terms only. No personal/user/private data is exposed.

declare global {
  // eslint-disable-next-line no-var
  var __chinachild_public_supabase: SupabaseClient | undefined;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getPublicSupabaseClient(): SupabaseClient | null {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;

  if (!globalThis.__chinachild_public_supabase) {
    globalThis.__chinachild_public_supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "chinachild-site/public" } },
    });
  }
  return globalThis.__chinachild_public_supabase;
}

export type PublicContentClient = SupabaseClient;
