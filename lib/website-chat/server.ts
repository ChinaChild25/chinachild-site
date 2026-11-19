import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const WEBSITE_CHAT_COOKIE = "cc_website_chat_visitor";

async function dispatchOperatorNotification(messageId: string): Promise<void> {
  const secret = process.env.WEBSITE_CHAT_OPERATOR_DISPATCH_SECRET?.trim();
  const configuredUrl = process.env.WEBSITE_CHAT_OPERATOR_DISPATCH_URL?.trim();
  if (!secret || !configuredUrl) throw new Error("Operator dispatch not configured");
  const url = new URL(configuredUrl);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV === "development" && url.protocol === "http:")) {
    throw new Error("Invalid operator dispatch URL");
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chinachild-dialogue-secret": secret,
    },
    body: JSON.stringify({ messageId }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; result?: string } | null;
  if (!response.ok || !result?.ok || !["sent", "duplicate"].includes(result.result ?? "")) {
    throw new Error(`Operator dispatch failed (${response.status})`);
  }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type WebsiteChatMessage = {
  id: string;
  clientNonce: string | null;
  direction: "incoming" | "outgoing" | "internal";
  sourceChannel: "website" | "telegram" | "max" | "whatsapp" | "email" | "internal";
  text: string;
  sourceTimestamp: string;
  sentAt: string | null;
  deliveryStatus: "pending" | "sent" | "delivered" | "read" | "failed";
};

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function newWebsiteChatVisitorKey(): string {
  return randomUUID();
}

export function validWebsiteChatVisitorKey(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export function websiteChatVisitorHash(visitorKey: string): string {
  return createHash("sha256").update(visitorKey).digest("hex");
}

function messageView(row: Record<string, unknown>): WebsiteChatMessage {
  return {
    id: String(row.id),
    clientNonce: typeof row.client_nonce === "string" ? row.client_nonce : null,
    direction: row.direction as WebsiteChatMessage["direction"],
    sourceChannel: row.source_channel as WebsiteChatMessage["sourceChannel"],
    text: String(row.text),
    sourceTimestamp: String(row.source_timestamp),
    sentAt: typeof row.sent_at === "string" ? row.sent_at : null,
    deliveryStatus: row.delivery_status as WebsiteChatMessage["deliveryStatus"],
  };
}

async function websiteConversation(admin: SupabaseClient, visitorHash: string) {
  const result = await admin.from("dialogue_conversations")
    .select("id,lead_id")
    .eq("channel", "website")
    .eq("website_visitor_key_hash", visitorHash)
    .eq("status", "active")
    .maybeSingle<{ id: string; lead_id: string | null }>();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function listWebsiteChatMessages(visitorKey: string, after?: string | null) {
  const admin = adminClient();
  const conversation = await websiteConversation(admin, websiteChatVisitorHash(visitorKey));
  if (!conversation) return { conversationId: null, leadId: null, messages: [] as WebsiteChatMessage[] };

  let cursorTimestamp: string | null = null;
  if (after && UUID_RE.test(after)) {
    const cursor = await admin.from("dialogue_messages").select("source_timestamp")
      .eq("conversation_id", conversation.id).eq("id", after)
      .maybeSingle<{ source_timestamp: string }>();
    if (cursor.error) throw new Error(cursor.error.message);
    cursorTimestamp = cursor.data?.source_timestamp ?? null;
  }

  let query = admin.from("dialogue_messages")
    .select("id,client_nonce,direction,source_channel,text,source_timestamp,sent_at,delivery_status")
    .eq("conversation_id", conversation.id)
    .order("source_timestamp", { ascending: true })
    .order("id", { ascending: true })
    .limit(100);
  // Include the cursor timestamp because multiple provider events may share it;
  // the client merges by message id/client nonce, so a repeated cursor row is safe.
  if (cursorTimestamp) query = query.gte("source_timestamp", cursorTimestamp);
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return {
    conversationId: conversation.id,
    leadId: conversation.lead_id,
    messages: (result.data ?? []).map((row) => messageView(row as Record<string, unknown>)),
  };
}

export async function postWebsiteChatMessage(input: {
  visitorKey: string;
  clientNonce: string;
  text: string;
  sourcePage: string;
}) {
  if (!UUID_RE.test(input.clientNonce)) throw new Error("Invalid client nonce");
  const text = input.text.trim();
  if (!text || text.length > 8000) throw new Error("Invalid message");
  const admin = adminClient();
  const posted = await admin.rpc("post_website_chat_message", {
    p_visitor_key_hash: websiteChatVisitorHash(input.visitorKey),
    p_client_nonce: input.clientNonce,
    p_text: text,
    p_source_page: input.sourcePage.slice(0, 300),
  });
  if (posted.error || !posted.data?.[0]) throw new Error(posted.error?.message || "Could not post message");
  const result = posted.data[0] as {
    conversation_id: string;
    message_id: string;
    lead_id: string;
    inserted: boolean;
  };
  try {
    await dispatchOperatorNotification(result.message_id);
    const delivered = await admin.from("dialogue_messages")
      .update({ delivery_status: "delivered", error_code: null })
      .eq("id", result.message_id);
    if (delivered.error) throw new Error(delivered.error.message);
  } catch (error) {
    await admin.from("dialogue_messages")
      .update({ delivery_status: "failed", error_code: "operator_dispatch_failed" })
      .eq("id", result.message_id);
    throw error;
  }
  const stored = await admin.from("dialogue_messages")
    .select("id,client_nonce,direction,source_channel,text,source_timestamp,sent_at,delivery_status")
    .eq("id", result.message_id).single();
  if (stored.error) throw new Error(stored.error.message);
  return { ...result, message: messageView(stored.data as Record<string, unknown>) };
}
