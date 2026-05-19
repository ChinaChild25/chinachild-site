import "server-only";

import { sendEmail } from "@/lib/email/smtp";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

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
  consent_text_version: string;
  consent_accepted_at: string;
  source_page?: string;
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

function appendLine(lines: string[], label: string, value?: string | boolean) {
  if (value === undefined || value === "") return;
  lines.push(`${label}: ${value}`);
}

function formatLead(lead: LeadInput): string {
  const lines = [
    `Новая заявка с ${SITE_URL}`,
    "",
    `ID лида: ${lead.id}`,
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
  ];

  appendLine(lines, "Email", lead.email);
  appendLine(lines, "Курс", lead.course);
  appendLine(lines, "Удобное время звонка", lead.call_time);
  appendLine(lines, "Страница", lead.source_page);
  appendLine(lines, "Referrer", lead.referrer);
  appendLine(lines, "Согласие на обработку ПД", lead.consent_pd);
  appendLine(lines, "Согласие на рассылку", lead.consent_marketing);
  appendLine(lines, "Версия текста согласия", lead.consent_text_version);
  appendLine(lines, "Время согласия", lead.consent_accepted_at);

  const utm = [
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
    ["yclid", lead.yclid],
    ["gclid", lead.gclid],
  ].filter(([, value]) => value);

  if (utm.length > 0) {
    lines.push("", "UTM:");
    for (const [key, value] of utm) lines.push(`  ${key}=${value}`);
  }

  if (lead.message) lines.push("", "Сообщение:", lead.message);
  appendLine(lines, "IP hash", lead.ip_hash);
  appendLine(lines, "User-Agent", lead.user_agent);
  lines.push("", `Получатель: ${SITE_NAME}`);

  return lines.join("\n");
}

async function dispatchEmail(lead: LeadInput): Promise<DispatchResult> {
  const to = process.env.LEAD_EMAIL_TO;
  if (!to) {
    return {
      channel: "email",
      ok: false,
      detail: "LEAD_EMAIL_TO not configured",
    };
  }

  const result = await sendEmail({
    to,
    replyTo: lead.email,
    subject: `Новая заявка с сайта: ${lead.name}`,
    text: formatLead(lead),
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
