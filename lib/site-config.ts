export const SITE_NAME = "ChinaChild";
export const BRAND_NAME = "HSK+";
export const SITE_URL = "https://chinachild.ru";
export const APP_URL = "https://app.chinachild.ru";
export const REGISTER_URL = `${APP_URL}/register`;
export const SITE_DESCRIPTION =
  "Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная программа HSK 1-2 — мини-группы до 5 человек, индивидуальные занятия, доступ через личный кабинет.";
export const CONTACT_EMAIL = "info@chinachild.ru";
export const CONTACT_PHONE = "+7 (495) 005-25-82";
export const CONTACT_PHONE_TEL = "+74950052582";
export const PROMO_CODE = "КИТАПР26";
export const TAX_DEDUCTION_MAX = "до 15 600 ₽ в год";
export const LICENSE_REGION = "Департамент образования и науки города Москвы";
export const LICENSE_PROGRAM = "HSK 1-2";

// IndexNow — both Yandex and Bing accept this protocol for instant indexing.
// File at /{INDEXNOW_KEY}.txt must contain the same key. Override via env if needed.
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? "e7c1a4d8b9f3469c2a85e6f4d2b9a3c1";

export function absoluteUrl(path: string): string {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
