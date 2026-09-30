import "server-only";

import { createHash, randomBytes } from "node:crypto";
import {
  APPLICATION_MESSENGER_CHANNELS,
  buildApplicationMessengerLink,
  type ApplicationMessengerLinks,
} from "@/lib/leads/application-messenger-links";
import { getClient } from "@/lib/leads/store";

/** Long enough to open a messenger later the same day, short enough to be worthless if leaked. */
const HANDOFF_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Issues the post-submit messenger links for a lead this request has just stored. Only the
 * SHA-256 of each token reaches the database; the raw token exists only inside the links
 * returned to this browser. The platform RPC refuses a lead that is not a fresh application,
 * so a lead id alone can never be turned into a handoff.
 */
export async function issueApplicationMessengerLinks(input: {
  leadId: string;
  sourcePage: string;
}): Promise<ApplicationMessengerLinks> {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase not configured");

  const issued = APPLICATION_MESSENGER_CHANNELS.map((channel) => {
    const token = randomBytes(16).toString("hex");
    return { channel, token, link: buildApplicationMessengerLink(channel, token) };
  });
  const { error } = await supabase.rpc("create_lead_application_messenger_handoffs", {
    p_lead_id: input.leadId,
    p_handoffs: issued.map((item) => ({
      channel: item.channel,
      token_hash: createHash("sha256").update(item.token).digest("hex"),
    })),
    p_source_page: input.sourcePage.slice(0, 300),
    p_expires_at: new Date(Date.now() + HANDOFF_TTL_MS).toISOString(),
  });
  if (error) throw new Error(error.message);

  return Object.fromEntries(
    issued.flatMap((item) => (item.link ? [[item.channel, item.link]] : [])),
  ) as ApplicationMessengerLinks;
}
