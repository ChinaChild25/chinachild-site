import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Auto-linker for blog body text.
 *
 * Walks each paragraph/list-item once and replaces the FIRST occurrence of any
 * known term with a contextual internal link to the relevant money page or
 * trust page. Links never repeat in the same paragraph (prevents over-linking).
 * Per-article we cap the total auto-link count to avoid spam.
 */

type Term = {
  match: RegExp;
  href: string;
  label?: string;
};

// Order matters — longer terms first so they win over substrings.
// Money pages get heaviest specificity; glossary entries pick up generic
// term mentions so blog body builds an internal cluster.
const TERMS: Term[] = [
  { match: /курсы китайского для детей/i, href: "/courses/chinese-for-kids" },
  { match: /курсы китайского для взрослых/i, href: "/courses/chinese-for-adults" },
  { match: /бизнес-китайский|корпоративный китайский/i, href: "/courses/business-chinese" },
  { match: /подготовк[аеи]\s+к\s+HSK|курс[ы]?\s+HSK/i, href: "/courses/hsk-preparation" },
  { match: /курс[ы]?\s+ChinaChild|курс[ы]?\s+с\s+нуля/i, href: "/courses/online-chinese" },
  { match: /бесплатн(ое|ый)\s+(пробное|тест)/i, href: "/courses/online-chinese" },
  { match: /(методик[аиу]|программ[аеу])\s+ChinaChild/i, href: "/methodology" },
  { match: /преподавател[ия]\s+ЮФУ|преподавател[ия]\s+школы/i, href: "/about" },
  { match: /отзыв[ыи]\s+учеников/i, href: "/reviews" },
  { match: /курс[ы]?\s+(?:в\s+)?Москв[еы]/i, href: "/cities/moscow" },
  // Single-term anchors (least specific — last)
  { match: /\bHSK\s*1\b/i, href: "/courses/hsk-preparation" },
  { match: /\bHSK\s*2\b/i, href: "/courses/hsk-preparation" },
  { match: /\bHSK\s*3\b/i, href: "/courses/hsk-preparation" },
  { match: /\bHSK\s*4\b/i, href: "/courses/hsk-preparation" },
  // Glossary anchors — informational lane
  { match: /\bпиньинь\b/i, href: "/glossary/pinyin" },
  { match: /\bпутунхуа\b/i, href: "/glossary/putonghua" },
  // Plain HSK as a defined term — only after specific HSK course matches above
  { match: /\bэкзамен[а-я]*\s+HSK\b/i, href: "/glossary/hsk" },
];

const MAX_AUTO_LINKS_PER_ARTICLE = 6;

type LinkerState = {
  used: Set<string>;
  total: number;
};

function autolinkOne(text: string, state: LinkerState): ReactNode[] | string {
  if (state.total >= MAX_AUTO_LINKS_PER_ARTICLE) return text;

  for (const term of TERMS) {
    if (state.used.has(term.href)) continue;
    const m = text.match(term.match);
    if (!m || m.index === undefined) continue;

    const before = text.slice(0, m.index);
    const matched = text.slice(m.index, m.index + m[0].length);
    const after = text.slice(m.index + m[0].length);
    state.used.add(term.href);
    state.total += 1;

    // Recurse into the trailing slice with mutated state
    const tail = autolinkOne(after, state);
    return [
      before,
      <Link
        key={`auto-${term.href}-${m.index}`}
        href={term.href}
        className="font-semibold text-[#1b1b1b] underline underline-offset-4 decoration-[rgba(0,0,0,0.18)] hover:decoration-[rgba(0,0,0,0.6)]"
      >
        {matched}
      </Link>,
      ...(typeof tail === "string" ? [tail] : tail),
    ];
  }

  return text;
}

export function makeAutolinker() {
  const state: LinkerState = { used: new Set(), total: 0 };
  return (text: string): ReactNode | string => {
    const result = autolinkOne(text, state);
    return result;
  };
}
