import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site-config";

export type LeadInput = {
  name: string;
  phone: string;
  email?: string;
  course?: string;
  comment?: string;
  source?: string;
  utm?: Record<string, string>;
};

export type DispatchResult = {
  channel: string;
  ok: boolean;
  detail?: string;
};

function formatLead(lead: LeadInput): string {
  const lines = [
    `🐉 Новая заявка с ${SITE_URL}`,
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
  ];
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.course) lines.push(`Курс: ${lead.course}`);
  if (lead.source) lines.push(`Источник: ${lead.source}`);
  if (lead.comment) lines.push("", `Комментарий:`, lead.comment);
  if (lead.utm && Object.keys(lead.utm).length > 0) {
    lines.push("", "UTM:");
    for (const [k, v] of Object.entries(lead.utm)) lines.push(`  ${k}=${v}`);
  }
  lines.push("", `Получатель: ${SITE_NAME} <${CONTACT_EMAIL}>`);
  return lines.join("\n");
}

async function dispatchTelegram(lead: LeadInput): Promise<DispatchResult | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLead(lead),
        disable_web_page_preview: true,
      }),
    });
    return {
      channel: "telegram",
      ok: res.ok,
      detail: res.ok ? undefined : `status=${res.status}`,
    };
  } catch (error) {
    return {
      channel: "telegram",
      ok: false,
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function dispatchResend(lead: LeadInput): Promise<DispatchResult | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  const to = process.env.LEAD_EMAIL_TO ?? CONTACT_EMAIL;
  if (!apiKey || !from) return null;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email ? [lead.email] : undefined,
        subject: `Новая заявка: ${lead.name} — ${lead.course ?? "без курса"}`,
        text: formatLead(lead),
      }),
    });
    return {
      channel: "email",
      ok: res.ok,
      detail: res.ok ? undefined : `status=${res.status}`,
    };
  } catch (error) {
    return {
      channel: "email",
      ok: false,
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function dispatchWebhook(lead: LeadInput): Promise<DispatchResult | null> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        ...lead,
        receivedAt: new Date().toISOString(),
        site: SITE_URL,
      }),
    });
    return {
      channel: "webhook",
      ok: res.ok,
      detail: res.ok ? undefined : `status=${res.status}`,
    };
  } catch (error) {
    return {
      channel: "webhook",
      ok: false,
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}

/**
 * Fan-out the lead to every configured channel in parallel.
 * Always logs to stdout so a Vercel deployment without any external
 * integrations still records the lead in the function logs.
 */
export async function dispatchLead(lead: LeadInput): Promise<{
  delivered: DispatchResult[];
  attempted: number;
}> {
  console.log("[lead] received", JSON.stringify(lead));

  const results = await Promise.all([
    dispatchTelegram(lead),
    dispatchResend(lead),
    dispatchWebhook(lead),
  ]);

  const delivered = results.filter((r): r is DispatchResult => r !== null);
  for (const r of delivered) {
    console.log(`[lead] dispatch ${r.channel}: ${r.ok ? "ok" : `failed (${r.detail})`}`);
  }
  return { delivered, attempted: delivered.length };
}
