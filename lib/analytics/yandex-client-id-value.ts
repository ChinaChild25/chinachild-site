const MAX_YANDEX_CLIENT_ID_LENGTH = 32;

export function validateYandexClientId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clientId = value.trim();
  if (
    clientId.length === 0 ||
    clientId.length > MAX_YANDEX_CLIENT_ID_LENGTH ||
    !/^\d+$/.test(clientId)
  ) {
    return null;
  }
  return clientId;
}
