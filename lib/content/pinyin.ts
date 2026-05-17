// Pinyin normalisation helpers for the public dictionary.
// Mirrors chinachild-sandbox/lib/vocabulary/pinyin.ts in semantics; kept in
// sync by intent (each repo carries its own copy so the public site has no
// cross-repo runtime dependency).

const TONE_MARKS: Record<string, readonly [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["ü", 1], ǘ: ["ü", 2], ǚ: ["ü", 3], ǜ: ["ü", 4],
  ü: ["ü", 5],
};

const TONE_VOWELS: Record<string, readonly string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeUmlaut(value: string): string {
  return value.replace(/u:/gi, "ü").replace(/v/gi, "ü");
}

function splitNumberedPinyin(value: string): string[] {
  const normalized = normalizeUmlaut(value.toLowerCase())
    .replace(/([1-5])(?=[a-zü])/g, "$1 ")
    .replace(/([a-zü])([1-5])/g, "$1$2 ");
  return normalized.split(/\s+/).map((part) => part.trim()).filter(Boolean);
}

function markIndexForSyllable(syllable: string): number {
  const chars = [...syllable];
  const a = chars.indexOf("a");
  if (a >= 0) return a;
  const e = chars.indexOf("e");
  if (e >= 0) return e;
  const ou = syllable.indexOf("ou");
  if (ou >= 0) return ou;
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (["i", "o", "u", "ü"].includes(chars[i] ?? "")) return i;
  }
  return -1;
}

function numberedTokenToToneMark(token: string): string {
  const match = /^([a-zü]+)([1-5])$/i.exec(normalizeUmlaut(token));
  if (!match) return token;
  const syllable = match[1]?.toLowerCase() ?? "";
  const tone = Number(match[2]);
  if (tone < 1 || tone > 4) return syllable;
  const chars = [...syllable];
  const markIndex = markIndexForSyllable(syllable);
  if (markIndex < 0) return syllable;
  const vowel = chars[markIndex];
  const marked = vowel ? TONE_VOWELS[vowel]?.[tone - 1] : undefined;
  if (!marked) return syllable;
  chars[markIndex] = marked;
  return chars.join("");
}

function stripToneMarks(value: string): string {
  return [...value].map((char) => TONE_MARKS[char]?.[0] ?? char).join("");
}

function numberedFromMarkedToken(token: string): string {
  let tone = 5;
  const base = [...normalizeUmlaut(token.toLowerCase())]
    .map((char) => {
      const marked = TONE_MARKS[char];
      if (!marked) return char;
      tone = marked[1];
      return marked[0];
    })
    .join("");
  return tone === 5 ? base : `${base}${tone}`;
}

export function normalizePinyinWithToneMarks(input: string): string {
  const trimmed = normalizeSpaces(input);
  if (!trimmed) return "";
  if (/[1-5]/.test(trimmed)) {
    return splitNumberedPinyin(trimmed).map(numberedTokenToToneMark).join(" ");
  }
  return normalizeSpaces(normalizeUmlaut(trimmed.toLowerCase()));
}

export function normalizePinyinWithoutToneMarks(input: string): string {
  return stripToneMarks(normalizePinyinWithToneMarks(input)).toLowerCase();
}

export function normalizePinyinToneNumbers(input: string): string {
  const trimmed = normalizeSpaces(input);
  if (!trimmed) return "";
  if (/[1-5]/.test(trimmed)) {
    return splitNumberedPinyin(trimmed)
      .map((token) => {
        const match = /^([a-zü]+)([1-5])$/i.exec(normalizeUmlaut(token));
        return match ? `${match[1]?.toLowerCase() ?? ""}${match[2]}` : token.toLowerCase();
      })
      .join(" ");
  }
  return normalizeSpaces(trimmed).split(" ").map(numberedFromMarkedToken).join(" ");
}

const HANZI_RE = /\p{Script=Han}/u;

export type NormalizedQuery = {
  raw: string;
  normalized: string;
  pinyinToneMarks: string;
  pinyinNoTone: string;
  pinyinToneNumbers: string;
  hasHanzi: boolean;
};

export function normalizeQuery(input: string): NormalizedQuery {
  const raw = input;
  const normalized = input.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  return {
    raw,
    normalized,
    pinyinToneMarks: normalizePinyinWithToneMarks(normalized),
    pinyinNoTone: normalizePinyinWithoutToneMarks(normalized),
    pinyinToneNumbers: normalizePinyinToneNumbers(normalized),
    hasHanzi: HANZI_RE.test(normalized),
  };
}

/** Escape characters that have meaning inside PostgREST's `or=` filter list. */
export function escapeForPostgrestOr(value: string): string {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}
