import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APPLICATION_HANDOFF_TOKEN_RE,
  APPLICATION_MESSENGER_DESTINATIONS,
  applicationHandoffPrefill,
  buildApplicationMessengerLink,
  parseApplicationMessengerLinks,
} from "../../lib/leads/application-messenger-links.ts";

const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const route = read("app/api/contact/route.ts");
const issuer = read("lib/leads/application-messenger-handoff.ts");
const form = read("components/forms/LeadForm.tsx");
const step = read("components/forms/LeadMessengerStep.tsx");

// The same extraction chinachild-my runs on inbound text and on the MAX start payload
// (lib/crm/messenger-leads.ts) — the two repos must agree on what the code is.
const PLATFORM_HANDOFF_RE = /(?:\bCC-|\bcc_)([A-Za-z0-9_-]{20,128})(?![A-Za-z0-9_-])/i;
const TOKEN = "0123456789abcdef0123456789abcdef";

test("links go to the CRM destinations, never to the notification bots", () => {
  const telegram = buildApplicationMessengerLink("telegram", TOKEN)!;
  const whatsapp = buildApplicationMessengerLink("whatsapp", TOKEN)!;
  const max = buildApplicationMessengerLink("max", TOKEN)!;
  assert.ok(telegram.startsWith(`https://t.me/${APPLICATION_MESSENGER_DESTINATIONS.telegramUsername}?text=`));
  assert.ok(whatsapp.startsWith(`https://wa.me/${APPLICATION_MESSENGER_DESTINATIONS.whatsappPhone}?text=`));
  assert.equal(max, `https://max.ru/${APPLICATION_MESSENGER_DESTINATIONS.maxBotUsername}?start=cc_${TOKEN}`);
  for (const link of [telegram, whatsapp, max]) {
    assert.doesNotMatch(link, /notification|ChinaChild_bot/i);
  }
});

test("the platform recovers exactly the issued token from every channel", () => {
  const telegramText = decodeURIComponent(new URL(buildApplicationMessengerLink("telegram", TOKEN)!).searchParams.get("text")!);
  const whatsappText = decodeURIComponent(new URL(buildApplicationMessengerLink("whatsapp", TOKEN)!).searchParams.get("text")!);
  const maxPayload = new URL(buildApplicationMessengerLink("max", TOKEN)!).searchParams.get("start")!;
  for (const value of [telegramText, whatsappText, maxPayload]) {
    assert.equal(value.match(PLATFORM_HANDOFF_RE)?.[1], TOKEN);
  }
  assert.equal(telegramText, applicationHandoffPrefill(TOKEN));
  // MAX start payloads are limited to 128 characters.
  assert.ok(maxPayload.length <= 128);
});

test("only opaque 128-bit hex tokens are accepted", () => {
  assert.match(TOKEN, APPLICATION_HANDOFF_TOKEN_RE);
  assert.equal(buildApplicationMessengerLink("max", "short"), null);
  assert.equal(buildApplicationMessengerLink("telegram", "00000000-0000-4000-8000-000000000000"), null);
});

test("the browser renders only links this module builds", () => {
  const links = {
    telegram: buildApplicationMessengerLink("telegram", TOKEN),
    whatsapp: "javascript:alert(1)",
    max: "https://evil.example/?start=cc_x",
  };
  assert.deepEqual(parseApplicationMessengerLinks(links), { telegram: links.telegram });
  assert.equal(parseApplicationMessengerLinks(null), null);
  assert.equal(parseApplicationMessengerLinks({ whatsapp: "https://wa.me/1 2" }), null);
});

test("handoffs are issued for the lead this request stored, with only hashes persisted", () => {
  assert.match(route, /issueApplicationMessengerLinks\(\{ leadId: stored\.id/);
  // Never from a browser-supplied lead id.
  assert.doesNotMatch(route, /body\.lead_?id/i);
  assert.match(issuer, /create_lead_application_messenger_handoffs/);
  assert.match(issuer, /createHash\("sha256"\)\.update\(item\.token\)/);
  assert.match(issuer, /randomBytes\(16\)\.toString\("hex"\)/);
  assert.doesNotMatch(issuer, /token:\s*item\.token/);
  // A failed handoff never fails the application.
  assert.match(route, /\.catch\(\(error: unknown\) => \{[\s\S]*?return null;/);
  assert.equal(createHash("sha256").update(TOKEN).digest("hex").length, 64);
});

test("the success state offers the optional messenger step and keeps the old one as fallback", () => {
  assert.match(form, /Заявка отправлена/);
  assert.match(form, /<LeadMessengerStep links=\{messengerLinks\} \/>/);
  assert.match(form, /Спасибо! Заявка принята\./);
  assert.match(step, /Хотите продолжить общение прямо сейчас\?/);
  // Plain anchors: mobile browsers never block them as pop-ups after the async submit.
  assert.match(step, /<a\s[\s\S]*?href=\{links\[channel\]\}/);
  assert.doesNotMatch(step, /window\.open/);
});
