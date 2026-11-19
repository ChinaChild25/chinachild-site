import assert from "node:assert/strict";
import test from "node:test";
import { buildWebsiteMessengerUrl, WEBSITE_CONTACT_TEMPLATE } from "../../lib/leads/messenger-links.ts";

const token = "abcdefghijklmnopqrstuvwx";

test("builds native messenger URLs with the same handoff token", () => {
  const env = {
    MESSENGER_TELEGRAM_USERNAME: "ChinaChild",
    MESSENGER_MAX_BOT_USERNAME: "chinachild_bot",
    MESSENGER_WHATSAPP_PHONE: "+7 (985) 139-92-56",
  };
  assert.match(buildWebsiteMessengerUrl("telegram", token, "Хочу на пробный урок", env) ?? "", /t\.me\/ChinaChild\?text=/);
  assert.equal(buildWebsiteMessengerUrl("max", token, "Хочу на пробный урок", env), `https://max.ru/chinachild_bot?start=cc_${token}`);
  assert.match(buildWebsiteMessengerUrl("whatsapp", token, "Хочу на пробный урок", env) ?? "", /wa\.me\/79851399256\?text=/);
  assert.match(
    decodeURIComponent(buildWebsiteMessengerUrl("telegram", token, "Хочу на пробный урок", env) ?? ""),
    /Хочу на пробный урок[\s\S]*CC-abcdefghijklmnopqrstuvwx/,
  );
});

test("rejects malformed destination or handoff tokens", () => {
  assert.equal(buildWebsiteMessengerUrl("telegram", "short", "", { MESSENGER_TELEGRAM_USERNAME: "ChinaChild" }), null);
  assert.equal(buildWebsiteMessengerUrl("whatsapp", token, "", { MESSENGER_WHATSAPP_PHONE: "123" }), null);
});

test("uses the guided contact template when the visitor has not typed a message", () => {
  const url = buildWebsiteMessengerUrl("whatsapp", token, "", {
    MESSENGER_WHATSAPP_PHONE: "+7 (985) 139-92-56",
  });
  assert.match(decodeURIComponent(url ?? ""), new RegExp(WEBSITE_CONTACT_TEMPLATE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
