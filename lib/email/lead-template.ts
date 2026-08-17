export type LeadEmailTemplateInput = {
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cleanInline(value: string | undefined, fallback = "Не указано"): string {
  const cleaned = value?.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return cleaned || fallback;
}

function multilineHtml(value: string | undefined): string {
  const cleaned = value?.trim();
  if (!cleaned) return "Не указано";
  return escapeHtml(cleaned).replace(/\r?\n/g, "<br>");
}

function appendLine(lines: string[], label: string, value?: string | boolean) {
  if (value === undefined || value === "") return;
  lines.push(`${label}: ${value}`);
}

function buildPlainText(lead: LeadEmailTemplateInput, siteUrl: string, recipient: string): string {
  const lines = [
    `Новая заявка с ${siteUrl}`,
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
  appendLine(lines, "Версия согласия на ПД", lead.consent_pd_version);
  appendLine(lines, "Согласие на рассылку", lead.consent_marketing);
  appendLine(lines, "Версия рекламного согласия", lead.consent_marketing_version);
  appendLine(lines, "Время согласия", lead.consent_accepted_at);

  const utm = [
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
    ["yclid", lead.yclid],
    ["gclid", lead.gclid],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (utm.length > 0) {
    lines.push("", "UTM:");
    for (const [key, value] of utm) lines.push(`  ${key}=${value}`);
  }

  if (lead.message) lines.push("", "Сообщение:", lead.message);
  appendLine(lines, "IP hash", lead.ip_hash);
  appendLine(lines, "User-Agent", lead.user_agent);
  lines.push("", `Получатель: ${recipient}`);
  return lines.join("\n");
}

function infoRow(label: string, value: string, options?: { href?: string }): string {
  const content = options?.href
    ? `<a href="${escapeHtml(options.href)}" style="color:#1A1A1A;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(value)}</a>`
    : `<span style="color:#1A1A1A;font-size:16px;font-weight:600;">${escapeHtml(value)}</span>`;
  return `<tr><td style="padding-bottom:14px;border-top:1px solid #F0F0F2;padding-top:14px;"><span style="color:#B3B3B7;font-size:12px;font-weight:600;letter-spacing:0.4px;">${label}</span><br>${content}</td></tr>`;
}

export function buildLeadEmail(
  lead: LeadEmailTemplateInput,
  options: { siteUrl: string; recipient: string },
): { text: string; html: string } {
  const course = cleanInline(lead.course);
  const page = cleanInline(lead.source_page);
  const email = cleanInline(lead.email);
  const callTime = cleanInline(lead.call_time);
  const consentPdLabel = lead.consent_pd ? "Да" : "Нет";
  const consentNewsletterLabel = lead.consent_marketing ? "Да" : "Нет";
  const consentPdIcon = lead.consent_pd ? "✅" : "❌";
  const consentNewsletterIcon = lead.consent_marketing ? "✅" : "❌";
  const trackingLines = [
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
    ["yclid", lead.yclid],
    ["gclid", lead.gclid],
  ]
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `<br>${escapeHtml(key)}: ${escapeHtml(value)}`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0;padding:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;background-color:#ffffff; }
    @media only screen and (max-width:480px) { .email-card { padding:24px 18px 28px 18px !important; } .info-card { padding:16px !important; } }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Новая заявка от ${escapeHtml(cleanInline(lead.name))}</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;padding:20px 4px;">
    <tr><td align="center">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="email-card" style="max-width:560px;background-color:#F5F5F7;border-radius:20px;padding:32px 40px 40px 40px;">
        <tr><td align="left" style="padding-bottom:20px;"><img src="https://my.chinachild.ru/brand/chinachild-ch-mark.png" alt="ChinaChild" width="52" height="52" style="display:block;width:52px;height:52px;border:0;outline:none;text-decoration:none;"></td></tr>
        <tr><td align="left" style="padding-bottom:12px;"><table role="presentation" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color:#ffffff;border-radius:8px;padding:5px 10px;"><span style="color:#1A1A1A;font-size:12px;font-weight:600;">Новая заявка</span></td></tr></table></td></tr>
        <tr><td align="left" style="padding-bottom:6px;"><h1 style="margin:0;color:#1A1A1A;font-size:24px;font-weight:700;letter-spacing:-0.4px;line-height:31px;">Заявка с chinachild.ru</h1></td></tr>
        <tr><td align="left" style="padding-bottom:24px;"><p style="margin:0;color:#7F7F83;font-size:14px;line-height:20px;">Курс «${escapeHtml(course)}» · страница «${escapeHtml(page)}»</p></td></tr>
        <tr><td style="padding-bottom:16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="info-card" style="background-color:#ffffff;border-radius:16px;padding:20px;">
            <tr><td style="padding-bottom:14px;"><span style="color:#B3B3B7;font-size:12px;font-weight:600;letter-spacing:0.4px;">👤&nbsp;Имя</span><br><span style="color:#1A1A1A;font-size:16px;font-weight:600;">${escapeHtml(cleanInline(lead.name))}</span></td></tr>
            ${infoRow("📞&nbsp;Телефон", cleanInline(lead.phone), { href: `tel:${cleanInline(lead.phone)}` })}
            ${infoRow("✉️&nbsp;Email", email, lead.email ? { href: `mailto:${lead.email}` } : undefined)}
            ${infoRow("🕒&nbsp;Удобное время звонка", callTime)}
            <tr><td style="border-top:1px solid #F0F0F2;padding-top:14px;"><span style="color:#B3B3B7;font-size:12px;font-weight:600;letter-spacing:0.4px;">💬&nbsp;Сообщение</span><br><span style="color:#4A4A4D;font-size:15px;line-height:21px;">${multilineHtml(lead.message)}</span></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding-bottom:16px;"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;padding:18px 20px;">
          <tr><td style="padding-bottom:8px;"><span style="color:#1A1A1A;font-size:13px;font-weight:600;">${consentPdIcon}&nbsp;Согласие на обработку ПД: ${consentPdLabel}</span></td></tr>
          <tr><td style="padding-bottom:8px;"><span style="color:#1A1A1A;font-size:13px;font-weight:600;">${consentNewsletterIcon}&nbsp;Согласие на рассылку: ${consentNewsletterLabel}</span></td></tr>
          <tr><td><span style="color:#7F7F83;font-size:12px;">Версия ПД: ${escapeHtml(cleanInline(lead.consent_pd_version))} · Версия рекламы: ${escapeHtml(cleanInline(lead.consent_marketing_version))} · ${escapeHtml(cleanInline(lead.consent_accepted_at))}</span></td></tr>
        </table></td></tr>
        <tr><td><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px dashed #D9D9DC;border-radius:14px;padding:16px 18px;"><tr><td>
          <p style="margin:0 0 8px 0;color:#B3B3B7;font-size:11px;font-weight:600;letter-spacing:0.4px;">Технические данные</p>
          <p style="margin:0;color:#9A9A9E;font-size:12px;line-height:19px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;word-break:break-all;">ID лида: ${escapeHtml(cleanInline(lead.id))}<br>Referrer: ${escapeHtml(cleanInline(lead.referrer))}${trackingLines}<br>IP hash: ${escapeHtml(cleanInline(lead.ip_hash))}<br>User-Agent: ${escapeHtml(cleanInline(lead.user_agent))}<br>Получатель: ${escapeHtml(cleanInline(options.recipient))}</p>
        </td></tr></table></td></tr>
      </table>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;padding-top:24px;"><tr><td align="center"><p style="margin:0;color:#B3B3B7;font-size:13px;line-height:20px;">Автоматическое уведомление о заявке с сайта chinachild.ru<br>© 2026 Онлайн-школа ChinaChild</p></td></tr></table>
    </td></tr>
  </table>
</body>
</html>`;

  return {
    text: buildPlainText(lead, options.siteUrl, options.recipient),
    html,
  };
}
