/**
 * Links offered right after a website application is stored: the visitor may continue in
 * Telegram, WhatsApp or MAX instead of waiting for a call. Every link carries an opaque,
 * single-use code bound server-side (chinachild-my, website_messenger_handoffs) to that exact
 * application, so the chat attaches to the same CRM lead instead of creating a second one.
 *
 * Destinations are the CRM ones, never the notification bots:
 * - Telegram → the school's Telegram Business account; the prefilled text reaches the CRM
 *   through the Business connection;
 * - WhatsApp → the CRM Cloud API number (the client sends the prefilled first message);
 * - MAX → the CRM bot; the code travels in the `start` payload (bot_started).
 *
 * Kept free of path aliases and server-only imports so `node --test` can load it directly.
 */

export type ApplicationMessengerChannel = "telegram" | "whatsapp" | "max";

export const APPLICATION_MESSENGER_CHANNELS: readonly ApplicationMessengerChannel[] = ["telegram", "whatsapp", "max"];

export type ApplicationMessengerLinks = Partial<Record<ApplicationMessengerChannel, string>>;

export const APPLICATION_MESSENGER_DESTINATIONS = {
  telegramUsername: "chinachildedu",
  whatsappPhone: "79851399256",
  maxBotUsername: "id323101941586_1_bot",
} as const;

/** 128 random bits as hex: no «-»/«_», so no messenger can split or re-case the code. */
export const APPLICATION_HANDOFF_TOKEN_RE = /^[0-9a-f]{32}$/;

const ALLOWED_LINK = /^https:\/\/(t\.me|wa\.me|max\.ru)\/[A-Za-z0-9_]+\?(text|start)=[^\s]+$/;

export function applicationHandoffPrefill(token: string): string {
  return `Здравствуйте! Я оставил(а) заявку на сайте ChinaChild.\n\nКод заявки: CC-${token}`;
}

export function buildApplicationMessengerLink(channel: ApplicationMessengerChannel, token: string): string | null {
  if (!APPLICATION_HANDOFF_TOKEN_RE.test(token)) return null;
  const text = encodeURIComponent(applicationHandoffPrefill(token));
  if (channel === "telegram") return `https://t.me/${APPLICATION_MESSENGER_DESTINATIONS.telegramUsername}?text=${text}`;
  if (channel === "whatsapp") return `https://wa.me/${APPLICATION_MESSENGER_DESTINATIONS.whatsappPhone}?text=${text}`;
  return `https://max.ru/${APPLICATION_MESSENGER_DESTINATIONS.maxBotUsername}?start=cc_${token}`;
}

/** Accepts only the links this module builds — the browser never renders anything else. */
export function parseApplicationMessengerLinks(value: unknown): ApplicationMessengerLinks | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const links: ApplicationMessengerLinks = {};
  for (const channel of APPLICATION_MESSENGER_CHANNELS) {
    const link = (value as Record<string, unknown>)[channel];
    if (typeof link === "string" && ALLOWED_LINK.test(link)) links[channel] = link;
  }
  return Object.keys(links).length ? links : null;
}
