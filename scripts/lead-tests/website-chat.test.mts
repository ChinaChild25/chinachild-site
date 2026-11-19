import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");
const widget = read("components/layout/MessengerContactWidget.tsx");
const sessionRoute = read("app/api/website-chat/session/route.ts");
const messagesRoute = read("app/api/website-chat/messages/route.ts");
const server = read("lib/website-chat/server.ts");
const envExample = read(".env.example");

test("website chat restores history through an HttpOnly visitor session", () => {
  assert.match(sessionRoute, /httpOnly:\s*true/);
  assert.match(sessionRoute, /sameSite:\s*"lax"/);
  assert.match(server, /website_visitor_key_hash/);
  assert.match(server, /listWebsiteChatMessages/);
});

test("first message uses the atomic RPC and a caller-stable nonce", () => {
  assert.match(server, /post_website_chat_message/);
  assert.match(server, /p_client_nonce/);
  assert.match(messagesRoute, /clientNonce/);
  assert.match(widget, /crypto\.randomUUID\(\)/);
  assert.match(widget, /deliveryStatus:\s*"pending"/);
  assert.match(widget, /deliveryStatus:\s*"failed"/);
  assert.match(server, /WEBSITE_CHAT_OPERATOR_DISPATCH_SECRET/);
  assert.match(server, /x-chinachild-dialogue-secret/);
  assert.match(server, /dispatchOperatorNotification\(result\.message_id\)/);
  assert.doesNotMatch(envExample, /WEBSITE_CHAT_OPERATOR_BOT_TOKEN/);
});

test("polling runs only for an open visible widget with bounded backoff", () => {
  assert.match(widget, /if \(!open \|\| !sessionReady\) return/);
  assert.match(widget, /document\.visibilityState !== "visible"/);
  assert.match(widget, /Math\.min\(delay \* 2, 15000\)/);
  assert.match(widget, /clearTimeout\(timer\)/);
});

test("composer supports Enter, retry and delivery status", () => {
  assert.match(widget, /event\.key === "Enter"/);
  assert.match(widget, />Повторить</);
  assert.match(widget, /Отправляется…/);
  assert.match(widget, /Доставлено/);
});
