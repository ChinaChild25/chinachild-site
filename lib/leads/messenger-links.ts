export type WebsiteMessengerChannel = "telegram" | "max" | "whatsapp";

const DEFAULT_TELEGRAM_USERNAME = "ChinaChild_bot";
const DEFAULT_WHATSAPP_PHONE = "79851399256";

export const WEBSITE_CONTACT_TEMPLATE = [
  "Здравствуйте!",
  "Меня зовут: …",
  "Меня интересует: …",
  "Мой вопрос: …",
].join("\n");

function safeHandle(value: string | undefined): string | null {
  const normalized = value?.trim().replace(/^@/, "") ?? "";
  return /^[A-Za-z0-9_.-]{3,64}$/.test(normalized) ? normalized : null;
}

function safePhone(value: string | undefined): string | null {
  const normalized = value?.replace(/\D/g, "") ?? "";
  return /^[1-9][0-9]{7,14}$/.test(normalized) ? normalized : null;
}

export function buildWebsiteMessengerUrl(
  channel: WebsiteMessengerChannel,
  token: string,
  message = "",
  env: Record<string, string | undefined> = process.env,
): string | null {
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) return null;
  const cleanMessage = message.trim().slice(0, 1000);
  const text = encodeURIComponent(
    `${cleanMessage || WEBSITE_CONTACT_TEMPLATE}\n\nКод обращения: CC-${token}`,
  );
  const useRuntimeDefaults = env === process.env;
  if (channel === "telegram") {
    const username = safeHandle(env.MESSENGER_TELEGRAM_USERNAME)
      ?? (useRuntimeDefaults ? DEFAULT_TELEGRAM_USERNAME : null);
    return username ? `https://t.me/${username}?text=${text}` : null;
  }
  if (channel === "max") {
    const username = safeHandle(env.MESSENGER_MAX_BOT_USERNAME);
    return username ? `https://max.ru/${username}?start=cc_${token}` : null;
  }
  const phone = safePhone(env.MESSENGER_WHATSAPP_PHONE)
    ?? (useRuntimeDefaults ? DEFAULT_WHATSAPP_PHONE : null);
  return phone ? `https://wa.me/${phone}?text=${text}` : null;
}
