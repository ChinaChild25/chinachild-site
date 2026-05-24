import type { HskTestLevel } from "./types";

export interface HskTestLevelMeta {
  level: HskTestLevel;
  slug: `level-${1 | 2 | 3 | 4}`;
  /** Pastel pair (base, hover/darker). Aligns with the brand HSK cards. */
  color: { base: string; deep: string };
  /** Tailwind/CSS class on landing card background. */
  cardClass: string;
  /** Short two-line description on the card. */
  blurb: string;
  vocabSize: string;
  hanziCount: string;
  hours: string;
  cefr: string;
  /** Recommended course slug (existing /courses/<slug>). */
  courseSlug: string;
  /** Course title shown on result. */
  courseTitle: string;
}

export const hskTestLevels: HskTestLevelMeta[] = [
  {
    level: 1,
    slug: "level-1",
    color: { base: "#BFD9F2", deep: "#A8C8E8" },
    cardClass: "hsk-test-card-1",
    blurb:
      "Начало: тоны, пиньинь, базовые фразы. Хватит, чтобы поздороваться, представиться и спросить дорогу.",
    vocabSize: "150 слов",
    hanziCount: "174 иероглифа",
    hours: "≈ 80–100 часов",
    cefr: "A1",
    courseSlug: "hsk-preparation",
    courseTitle: "Курс подготовки к HSK 1",
  },
  {
    level: 2,
    slug: "level-2",
    color: { base: "#A89EE8", deep: "#8B7FE0" },
    cardClass: "hsk-test-card-2",
    blurb:
      "Бытовые диалоги: семья, покупки, поездки, простая грамматика и прошедшее время с 了.",
    vocabSize: "300 слов",
    hanziCount: "347 иероглифов",
    hours: "≈ 160–200 часов",
    cefr: "A2",
    courseSlug: "hsk-preparation",
    courseTitle: "Курс подготовки к HSK 2",
  },
  {
    level: 3,
    slug: "level-3",
    color: { base: "#D9B8E8", deep: "#C99FE0" },
    cardClass: "hsk-test-card-3",
    blurb:
      "Средний уровень: связные тексты, переписка, конструкция 把, наречия и сложные предложения.",
    vocabSize: "600 слов",
    hanziCount: "617 иероглифов",
    hours: "≈ 280–320 часов",
    cefr: "B1",
    courseSlug: "hsk-preparation",
    courseTitle: "Курс подготовки к HSK 3",
  },
  {
    level: 4,
    slug: "level-4",
    color: { base: "#F0A8B0", deep: "#E89098" },
    cardClass: "hsk-test-card-4",
    blurb:
      "Уверенный средний: работа, учёба, аргументация, сложные союзы, чтение адаптированных СМИ.",
    vocabSize: "1200 слов",
    hanziCount: "1064 иероглифа",
    hours: "≈ 480–560 часов",
    cefr: "B2",
    courseSlug: "hsk-preparation",
    courseTitle: "Курс подготовки к HSK 4",
  },
];

export function getHskTestLevel(level: HskTestLevel): HskTestLevelMeta {
  return hskTestLevels.find((l) => l.level === level)!;
}

export function getHskTestLevelBySlug(
  slug: string,
): HskTestLevelMeta | null {
  return hskTestLevels.find((l) => l.slug === slug) ?? null;
}
