import "server-only";
import { getPublicSupabaseClient } from "@/lib/supabase/public-content";

// Fetches public-safe cached TTS URLs from the shared `vocab_audio_assets`
// table. Anonymous role only sees rows whose owner_type is part of the
// public educational surface (term / example / grammar_example) — RLS
// guarantees the rest.
//
// Returns a `Map<owner_id, public_url>`. Callers that need to look up audio
// for many rows of one owner_type should call this once per page.

export type AudioOwnerType = "term" | "example" | "grammar_example";

export async function fetchAudioUrls(
  ownerType: AudioOwnerType,
  ownerIds: ReadonlyArray<string>,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (ownerIds.length === 0) return result;
  const supabase = getPublicSupabaseClient();
  if (!supabase) return result;

  // `.in()` accepts up to ~1k ids; chunk if we ever surpass that. For now
  // the dictionary level pages cap at 500 terms per page so one round-trip
  // is fine.
  const { data, error } = await supabase
    .from("vocab_audio_assets")
    .select("owner_id, public_url, storage_path")
    .eq("owner_type", ownerType)
    .in("owner_id", ownerIds as string[]);
  if (error) {
    console.warn(`[public-content/audio] ${ownerType} fetch error:`, error.message);
    return result;
  }
  for (const row of (data ?? []) as Array<{
    owner_id: string;
    public_url: string | null;
    storage_path: string | null;
  }>) {
    const url = row.public_url ?? null;
    if (url) result.set(row.owner_id, url);
  }
  return result;
}
