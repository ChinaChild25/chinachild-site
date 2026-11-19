import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildWebsiteMessengerUrl, type WebsiteMessengerChannel } from "./messenger-links";

export async function createWebsiteMessengerHandoff(input: {
  channel: WebsiteMessengerChannel;
  visitorKey: string;
  sourcePage: string;
  message?: string;
}): Promise<{ url: string; leadId: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase not configured");

  const token = randomBytes(24).toString("base64url");
  const url = buildWebsiteMessengerUrl(input.channel, token, input.message);
  if (!url) throw new Error(`Messenger ${input.channel} is not configured`);

  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await admin.rpc("create_website_messenger_handoff", {
    p_visitor_key_hash: hash(input.visitorKey),
    p_channel: input.channel,
    p_token_hash: hash(token),
    p_source_page: input.sourcePage.slice(0, 300),
    p_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  if (result.error || !result.data) throw new Error(result.error?.message || "Could not create messenger handoff");
  return { url, leadId: String(result.data) };
}
