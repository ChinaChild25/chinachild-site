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
  // Pillar hubs
  { match: /китайск(ий|ого)\s+с\s+нуля|для\s+начинающих/i, href: "/learn/beginners" },
  { match: /корпоративн[а-я]+\s+(обучени[ея]|курс[а-я]*|программ[а-я]*)\s+китайск/i, href: "/corporate" },
  { match: /репетитор[а-я]*\s+китайского/i, href: "/repetitor-kitayskogo" },
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
  { match: /\b(тон[ыа]?|четыре\s+тона)\b/i, href: "/glossary/tony" },
  { match: /\b(иероглиф[а-я]*|ханьцзы)\b/i, href: "/glossary/ieroglify" },
  { match: /\b(радикал[а-я]*|ключ\s+иероглифа)\b/i, href: "/glossary/radikaly" },
  { match: /\bэризац[а-я]*\b/i, href: "/glossary/erhua" },
  { match: /\bHSKK\b/i, href: "/glossary/hskk" },
  { match: /\bкаллиграф[а-я]*\b/i, href: "/glossary/kalligrafiya" },
  {
    match: /\b(упрощ[её]нн[а-я]*|традиционн[а-я]*)\s+иероглиф/i,
    href: "/glossary/simplified-vs-traditional",
  },
  { match: /\bмандарин\b/i, href: "/glossary/mandarin" },
  { match: /\bкантонск[а-я]*\b/i, href: "/glossary/cantonese" },
  { match: /\b(тайваньск[а-я]*\s+(путунхуа|мандарин|китайск)|G(uó|uo)y(ǔ|u))\b/i, href: "/glossary/taiwan-mandarin" },
  { match: /\b(чэнъюй|идиом[а-я]*\s+китайск)/i, href: "/glossary/chengyu" },
  // Modern China platforms & culture (new glossary terms)
  { match: /\bWeChat\b|\b(вичат|вэйсинь|微信)/i, href: "/glossary/wechat" },
  { match: /\bхунбао\b|\bкрасн[а-я]+\s+конверт/i, href: "/glossary/hong-bao" },
  { match: /\b(чуньцзе|китайск[а-я]+\s+нов[а-я]+\s+год|春节)\b/i, href: "/glossary/chun-jie" },
  // Grammar & writing (new glossary terms)
  { match: /\bчаст[ия]ц[аеу]\s+了\b/i, href: "/glossary/le-particle" },
  { match: /\bконструкци[а-я]+\s+с\s+把\b|\b把-конструкци/i, href: "/glossary/ba-construction" },
  { match: /\bконструкци[а-я]+\s+是…?的\b|\bвыделительн[а-я]+\s+конструкци/i, href: "/glossary/shi-de" },
  { match: /\bсч[её]тн[а-я]+\s+слов/i, href: "/glossary/liangci" },
  { match: /\bграфем[а-я]*\s+канси|\bграфем[а-я]+\s+иероглиф/i, href: "/glossary/bushou" },
  { match: /\b(черт[а-я]+\s+иероглиф|笔画|порядок\s+написани[а-я]+\s+иероглиф)/i, href: "/glossary/bihua" },
  { match: /\b(инициал[а-я]+\s+и\s+финал[а-я]+|声母|韵母)/i, href: "/glossary/shengmu-yunmu" },
  { match: /\b(шесть\s+категори[а-я]+\s+иероглиф|六书|liushu)/i, href: "/glossary/liushu" },
  // Tools (new glossary terms)
  { match: /\bPleco\b/, href: "/glossary/pleco" },
  { match: /\b[AА]nki\b/, href: "/glossary/anki-chinese" },
  // HSK 3.0 — the new test version
  { match: /\bHSK\s*3\.0|нов[а-я]+\s+HSK|HSK\s+(?:3\.0|3-0)/i, href: "/glossary/hsk-3-0" },
  { match: /\b(система\s+)?палладий|палладиц/i, href: "/glossary/palladiy" },
  {
    match: /\bинститут[а-я]*\s+Конфуци/i,
    href: "/glossary/confucius-institute",
  },
  // Plain HSK as a defined term — only after specific HSK course/level matches above
  { match: /\bэкзамен[а-я]*\s+HSK\b/i, href: "/glossary/hsk" },
];

// Long-form blog posts are 1500-2500 words; 18 keeps link density below
// roughly one internal link per 100-140 words while covering glossary terms.
const MAX_AUTO_LINKS_PER_ARTICLE = 18;

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
