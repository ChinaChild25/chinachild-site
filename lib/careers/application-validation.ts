const CANDIDATE_NAME_REGEX = /^(?=.{2,60}$)[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

export {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "../leads/contact-validation.ts";

export function normalizeCandidateName(value: string): string | null {
  const normalized = value.trim().normalize("NFKC").replace(/\s+/g, " ");
  return CANDIDATE_NAME_REGEX.test(normalized) ? normalized : null;
}

export function isValidCandidateName(value: string): boolean {
  return normalizeCandidateName(value) !== null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}
