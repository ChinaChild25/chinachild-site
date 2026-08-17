import "server-only";

import { sendEmail } from "@/lib/email/smtp";
import { buildLeadEmail } from "@/lib/email/lead-template";
import { SITE_URL } from "@/lib/site-config";

export type LeadInput = {
  id: string;
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

export type DispatchResult = {
  channel: string;
  ok: boolean;
  detail?: string;
};

async function dispatchEmail(lead: LeadInput): Promise<DispatchResult> {
  const to = process.env.LEAD_EMAIL_TO;
  if (!to) {
    return {
      channel: "email",
      ok: false,
      detail: "LEAD_EMAIL_TO not configured",
    };
  }

  const email = buildLeadEmail(lead, { siteUrl: SITE_URL, recipient: to });
  const result = await sendEmail({
    to,
    replyTo: lead.email,
    subject: `Новая заявка с сайта: ${lead.name}`,
    text: email.text,
    html: email.html,
  });

  return {
    channel: "email",
    ok: result.ok,
    detail: result.ok ? result.messageId : result.error,
  };
}

// import { sendTelegram } from "./telegram"; // disabled until bot is configured
// async function dispatchTelegram(_lead: LeadInput): Promise<DispatchResult | null> {
//   return null;
// }

/**
 * Fan-out the lead to configured channels after durable storage.
 * At the moment only email is active; Telegram stays disabled intentionally.
 */
export async function dispatchLead(lead: LeadInput): Promise<{
  delivered: DispatchResult[];
  attempted: number;
}> {
  console.log("[lead] stored", JSON.stringify({ id: lead.id, source: lead.source_page }));

  const delivered = [await dispatchEmail(lead)];
  for (const result of delivered) {
    console.log(
      `[lead] dispatch ${result.channel}: ${result.ok ? "ok" : `failed (${result.detail})`}`,
    );
  }

  return { delivered, attempted: delivered.length };
}
