import "server-only";

import type { Career } from "@/lib/careers";

type CareerEmailInput = {
  id: string;
  career: Career;
  name: string;
  phone: string;
  email: string;
  experience?: string;
  salaryExpectations?: string;
  comment?: string;
  portfolioUrl?: string;
  sourcePage?: string;
  filenames: string[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function multiline(value?: string): string {
  return value ? escapeHtml(value).replaceAll("\n", "<br>") : "—";
}

export function buildCareerEmail(input: CareerEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const text = [
    `Новый отклик на вакансию: ${input.career.title}`,
    `ID заявки: ${input.id}`,
    `Кандидат: ${input.name}`,
    `Телефон: ${input.phone}`,
    `Email: ${input.email}`,
    `Опыт: ${input.experience || "—"}`,
    `Пожелания по оплате: ${input.salaryExpectations || "—"}`,
    `Портфолио / ссылка на резюме: ${input.portfolioUrl || "—"}`,
    `Страница: ${input.sourcePage || "—"}`,
    `Приложенные файлы: ${input.filenames.join(", ") || "—"}`,
    "",
    "Комментарий:",
    input.comment || "—",
  ].join("\n");

  const fileRows = input.filenames.length
    ? input.filenames.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    : "<li>Нет вложений</li>";

  return {
    subject: `[КАНДИДАТ][${input.career.direction}] ${input.career.title} — ${input.name}`,
    text,
    html: `
      <div style="margin:0;background:#f5f5f5;padding:32px;font-family:Inter,Arial,sans-serif;color:#1b1b1b;">
        <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;">
          <div style="font-size:13px;color:#6d6d6d;">ChinaChild · карьерный отклик</div>
          <h1 style="margin:12px 0 24px;font-size:26px;line-height:1.15;">${escapeHtml(input.career.title)}</h1>
          <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
            <tr><td style="padding:7px 0;color:#777;width:180px;">Кандидат</td><td style="padding:7px 0;font-weight:600;">${escapeHtml(input.name)}</td></tr>
            <tr><td style="padding:7px 0;color:#777;">Телефон</td><td style="padding:7px 0;"><a href="tel:${escapeHtml(input.phone)}">${escapeHtml(input.phone)}</a></td></tr>
            <tr><td style="padding:7px 0;color:#777;">Email</td><td style="padding:7px 0;"><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
            <tr><td style="padding:7px 0;color:#777;">Опыт</td><td style="padding:7px 0;">${escapeHtml(input.experience || "—")}</td></tr>
            <tr><td style="padding:7px 0;color:#777;">Пожелания по оплате</td><td style="padding:7px 0;">${escapeHtml(input.salaryExpectations || "—")}</td></tr>
            <tr><td style="padding:7px 0;color:#777;">Портфолио</td><td style="padding:7px 0;word-break:break-word;">${escapeHtml(input.portfolioUrl || "—")}</td></tr>
          </table>
          <h3 style="margin:24px 0 10px;font-size:16px;">Комментарий</h3>
          <p style="margin:0;line-height:1.6;">${multiline(input.comment)}</p>
          <h3 style="margin:24px 0 10px;font-size:16px;">Вложения</h3>
          <ul style="margin:0;padding-left:20px;">${fileRows}</ul>
          <p style="margin:28px 0 0;color:#888;font-size:12px;line-height:1.5;">ID: ${escapeHtml(input.id)} · ${escapeHtml(input.sourcePage || "")}</p>
        </div>
      </div>`,
  };
}
