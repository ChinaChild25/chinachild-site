// Телефон и email лида: мягкая валидация против мусора, не против людей.
//
// Цель — отсечь заведомо ненастоящие контакты (строки по 20 символов, 0000000000,
// 1234567890, текст вместо номера) и при этом принять любой реально существующий
// номер: Россия, Казахстан, остальное СНГ, любой международный с «+».
//
// Правило: если номер не распознан уверенно — мы его НЕ переписываем.
// Раньше `375291234567` молча превращался в `+7 375 291 23 45`.

const PHONE_CHARACTERS_REGEX = /^\+?[\d\s().-‐-―]+$/;

/** Россия и Казахстан делят код +7. 0/1/2 во второй позиции — служебные префиксы. */
const RU_KZ_PHONE_REGEX = /^7[3-9]\d{9}$/;

/** Коды стран СНГ — принимаются даже без «+», чтобы не терять заявку из-за формата. */
const CIS_COUNTRY_CODES = [
  "375", // Беларусь
  "380", // Украина
  "373", // Молдова
  "374", // Армения
  "994", // Азербайджан
  "995", // Грузия
  "992", // Таджикистан
  "993", // Туркменистан
  "996", // Киргизия
  "998", // Узбекистан
] as const;

// Локальная часть: ASCII плюс юникодные буквы. Email — необязательное поле,
// и терять из-за него всю заявку (телефон уже проверен) хуже, чем принять
// экзотический, но осмысленный адрес.
const EMAIL_LOCAL_REGEX = /^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~.-]+$/u;
const EMAIL_DOMAIN_LABEL_REGEX = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u;
const EMAIL_TLD_REGEX = /^(?:[\p{L}]{2,63}|xn--[a-z0-9-]{2,59})$/iu;

/** 0000000000, 9999999999 — очевидная заглушка. */
function isRepeatedDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

/** 1234567890 и 9876543210 — тоже заглушка, но только если идёт подряд целиком. */
function isSequentialDigits(digits: string): boolean {
  if (digits.length < 7) return false;
  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i += 1) {
    const delta = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
    if (delta !== 1) ascending = false;
    if (delta !== -1) descending = false;
  }
  return ascending || descending;
}

function isJunk(digits: string): boolean {
  return isRepeatedDigits(digits) || isSequentialDigits(digits);
}

/**
 * Приводит номер к E.164 (`+79991234567`) или возвращает null, если номер
 * заведомо ненастоящий. Не угадывает страну для неизвестных форматов.
 */
export function normalizePhone(value: string): string | null {
  const normalized = value.trim().normalize("NFKC");
  if (!normalized) return null;
  if (!PHONE_CHARACTERS_REGEX.test(normalized)) return null;

  const hasInternationalPrefix = normalized.startsWith("+");
  let digits = normalized.replace(/\D/g, "");
  if (!digits) return null;

  // Привычный локальный ввод: 9991234567 и 89991234567.
  if (!hasInternationalPrefix) {
    if (digits.length === 10) digits = `7${digits}`;
    else if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  }

  if (digits.length < 10 || digits.length > 15) return null;
  if (isJunk(digits)) return null;

  // Россия и Казахстан.
  if (digits.startsWith("7")) {
    if (!RU_KZ_PHONE_REGEX.test(digits)) return null;
    if (isJunk(digits.slice(1))) return null;
    return `+${digits}`;
  }

  // Остальное СНГ — принимаем и без «+».
  const cisCode = CIS_COUNTRY_CODES.find((code) => digits.startsWith(code));
  if (cisCode) {
    const nationalNumber = digits.slice(cisCode.length);
    if (nationalNumber.length < 7 || nationalNumber.length > 12) return null;
    if (isJunk(nationalNumber)) return null;
    return `+${digits}`;
  }

  // Любая другая страна — только с явным «+», иначе это скорее опечатка,
  // чем международный номер, и угадывать мы не будем.
  if (!hasInternationalPrefix) return null;
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return `+${digits}`;
}

export function isValidPhone(value: string): boolean {
  return normalizePhone(value) !== null;
}

/**
 * Красивое отображение — только для валидного номера и только по blur.
 * Нераспознанный ввод возвращается как есть: пользователь должен видеть
 * то, что набрал, а не результат чужих догадок.
 */
export function formatPhoneInput(value: string): string {
  const normalized = normalizePhone(value);
  if (!normalized) return value.trim();

  const digits = normalized.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) {
    const n = digits.slice(1);
    return `+7 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8, 10)}`;
  }
  return normalized;
}

export function normalizeEmail(value: string): string | null {
  const normalized = value.trim().normalize("NFKC");
  if (!normalized || normalized.length > 254) return null;

  const separator = normalized.lastIndexOf("@");
  if (separator <= 0 || separator !== normalized.indexOf("@")) return null;
  const local = normalized.slice(0, separator);
  const domain = normalized.slice(separator + 1).toLowerCase();
  if (
    local.length > 64 ||
    !EMAIL_LOCAL_REGEX.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) return null;

  const labels = domain.split(".");
  if (
    labels.length < 2 ||
    !labels.every((label) => EMAIL_DOMAIN_LABEL_REGEX.test(label)) ||
    !EMAIL_TLD_REGEX.test(labels.at(-1) || "")
  ) return null;

  return `${local}@${domain}`;
}

export function isValidEmail(value: string): boolean {
  return normalizeEmail(value) !== null;
}
