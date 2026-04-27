export const SITE_NAME = "ChinaChild";
export const SITE_URL = "https://chinachild.ru";
export const APP_URL = "https://app.chinachild.ru";
export const REGISTER_URL = `${APP_URL}/register`;
export const SITE_DESCRIPTION =
  "Онлайн-школа китайского языка для детей, подростков, взрослых и корпоративных команд.";
export const CONTACT_EMAIL = "mail@chinachild.ru";

export function absoluteUrl(path: string): string {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
