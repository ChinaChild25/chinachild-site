import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadEmail } from "../../lib/email/lead-template.ts";

test("lead email renders the branded HTML and preserves the plain-text fallback", () => {
  const email = buildLeadEmail(
    {
      id: "lead-123",
      name: "Анна <script>alert(1)</script>",
      phone: "+7 999 123-45-67",
      email: "anna@example.test",
      course: "HSK <3>",
      call_time: "После 18:00",
      message: "Первая строка\nВторая <b>строка</b>",
      consent_pd: true,
      consent_marketing: false,
      consent_text_version: "v1",
      consent_accepted_at: "2026-08-11T10:00:00.000Z",
      source_page: "/free-trial?utm=a&b=c",
      utm_source: "yandex",
      utm_campaign: "hsk <summer>",
      referrer: "https://example.test/?a=1&b=2",
      ip_hash: "hash-123",
      user_agent: "Browser <test>",
    },
    { siteUrl: "https://chinachild.ru", recipient: "info@chinachild.ru" },
  );

  assert.match(email.html, /Заявка с chinachild\.ru/);
  assert.match(email.html, /Анна &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.html, /<script>alert/);
  assert.match(email.html, /Первая строка<br>Вторая &lt;b&gt;строка&lt;\/b&gt;/);
  assert.match(email.html, /mailto:anna@example\.test/);
  assert.match(email.html, /Согласие на рассылку: Нет/);
  assert.match(email.html, /utm_campaign: hsk &lt;summer&gt;/);
  assert.match(email.text, /Новая заявка с https:\/\/chinachild\.ru/);
  assert.match(email.text, /Имя: Анна <script>alert\(1\)<\/script>/);
  assert.match(email.text, /utm_source=yandex/);
});

test("lead email renders explicit placeholders for omitted optional fields", () => {
  const email = buildLeadEmail(
    {
      id: "lead-456",
      name: "Ли",
      phone: "+79990000000",
      consent_pd: true,
      consent_marketing: true,
      consent_text_version: "v1",
      consent_accepted_at: "2026-08-11T10:00:00.000Z",
    },
    { siteUrl: "https://chinachild.ru", recipient: "info@chinachild.ru" },
  );

  assert.match(email.html, /Курс «Не указано» · страница «Не указано»/);
  assert.doesNotMatch(email.html, /href="mailto:Не указано"/);
  assert.match(email.html, /💬&nbsp;Сообщение[\s\S]*Не указано/);
});
