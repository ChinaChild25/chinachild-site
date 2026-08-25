const PHONE_CHARACTERS_REGEX = /^\+?[\d\s().-]+$/;
const RUSSIAN_PHONE_REGEX = /^7[3489]\d{9}$/;
const INTERNATIONAL_PHONE_REGEX = /^[1-9]\d{7,14}$/;
const EMAIL_LOCAL_REGEX = /^[A-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/i;
const EMAIL_DOMAIN_LABEL_REGEX = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u;
const EMAIL_TLD_REGEX = /^(?:[\p{L}]{2,63}|xn--[a-z0-9-]{2,59})$/iu;

export function normalizePhone(value: string): string | null {
  const normalized = value.trim().normalize("NFKC");
  if (!PHONE_CHARACTERS_REGEX.test(normalized)) return null;

  const hasInternationalPrefix = normalized.startsWith("+");
  let digits = normalized.replace(/\D/g, "");
  if (!hasInternationalPrefix) {
    if (digits.length === 10) digits = `7${digits}`;
    else if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
    else if (digits.length !== 11 || !digits.startsWith("7")) return null;
  }
  if (!INTERNATIONAL_PHONE_REGEX.test(digits)) return null;

  if (digits.startsWith("7")) {
    if (!RUSSIAN_PHONE_REGEX.test(digits)) return null;
    const nationalNumber = digits.slice(1);
    if (/^(\d)\1{9}$/.test(nationalNumber)) return null;
  } else if (/^(\d)\1{7,14}$/.test(digits)) {
    return null;
  }
  return `+${digits}`;
}

export function isValidPhone(value: string): boolean {
  return normalizePhone(value) !== null;
}

export function formatPhoneInput(value: string): string {
  const normalized = value.normalize("NFKC");
  const digits = normalized.replace(/\D/g, "");
  if (!digits) return normalized.trim().startsWith("+") ? "+" : "";

  if (normalized.trim().startsWith("+") && !digits.startsWith("7")) {
    return `+${digits.slice(0, 15)}`;
  }

  let nationalNumber = digits;
  if (digits.startsWith("7") || digits.startsWith("8")) {
    nationalNumber = digits.slice(1);
  }
  nationalNumber = nationalNumber.slice(0, 10);

  const groups = [
    nationalNumber.slice(0, 3),
    nationalNumber.slice(3, 6),
    nationalNumber.slice(6, 8),
    nationalNumber.slice(8, 10),
  ].filter(Boolean);
  return groups.length ? `+7 ${groups.join(" ")}` : "+7";
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
