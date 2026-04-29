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
  // Money pages — most commercial intent first
  { match: /курсы китайского для детей/i, href: "/courses/chinese-for-kids" },
  { match: /курсы китайского для взрослых/i, href: "/courses/chinese-for-adults" },
  { match: /бизнес-китайский|корпоративный китайский/i, href: "/courses/business-chinese" },
  { match: /подготовк[аеи]\s+к\s+HSK|курс[ы]?\s+HSK/i, href: "/courses/hsk-preparation" },
  { match: /курс[ы]?\s+ChinaChild|курс[ы]?\s+с\s+нуля/i, href: "/courses/online-chinese" },
  { match: /бесплатн(ое|ый)\s+(пробное|тест)|пробн(ое|ый)\s+урок/i, href: "/free-trial" },
  { match: /(методик[аиу]|программ[аеу])\s+ChinaChild/i, href: "/methodology" },
  { match: /преподавател[ия]\s+ЮФУ|преподавател[ия]\s+школы/i, href: "/team" },
  { match: /отзыв[ыи]\s+учеников/i, href: "/reviews" },
  { match: /цен[аыу]|стоимост[ьи]|тариф/i, href: "/price" },
  { match: /мини-групп[аеу]\s+vs|мини-групп[аеу]\s+или\s+индивидуально|групп[аеу]\s+или\s+индивидуально/i, href: "/compare/mini-group-vs-individual" },
  // City pages
  { match: /курс[ы]?\s+(?:в\s+)?Москв[еы]/i, href: "/cities/moscow" },
  { match: /Санкт-Петербург[а-я]*|СПб|Питер[а-я]*/i, href: "/cities/saint-petersburg" },
  { match: /Казан[а-я]+/i, href: "/cities/kazan" },
  { match: /Екатеринбург[а-я]*/i, href: "/cities/ekaterinburg" },
  { match: /Новосибирск[а-я]*/i, href: "/cities/novosibirsk" },
  { match: /Краснодар[а-я]*/i, href: "/cities/krasnodar" },
  { match: /Ростов[а-я-]+/i, href: "/cities/rostov-on-don" },
  { match: /Владивосток[а-я]*/i, href: "/cities/vladivostok" },
  // HSK level pages — specific levels go to dedicated landings
  { match: /\bHSK\s*1\b/i, href: "/hsk/hsk-1" },
  { match: /\bHSK\s*2\b/i, href: "/hsk/hsk-2" },
  { match: /\bHSK\s*3\b/i, href: "/hsk/hsk-3" },
  { match: /\bHSK\s*4\b/i, href: "/hsk/hsk-4" },
  { match: /\bHSK\s*5\b/i, href: "/hsk/hsk-5" },
  { match: /\bHSK\s*6\b/i, href: "/hsk/hsk-6" },
  // Glossary anchors — informational lane
  { match: /\bпиньинь\b/i, href: "/glossary/pinyin" },
  { match: /\bпутунхуа\b/i, href: "/glossary/putonghua" },
  // Plain HSK as a defined term — only after specific HSK course/level matches above
  { match: /\bэкзамен[а-я]*\s+HSK\b/i, href: "/glossary/hsk" },
];

// Cap raised from 6 → 12 — a 12-minute article reasonably supports
// ~10 internal links without looking spammy. Industry guidance is roughly
// 1 link per 200 words; 12 fits a 2400-word piece.
const MAX_AUTO_LINKS_PER_ARTICLE = 12;

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
