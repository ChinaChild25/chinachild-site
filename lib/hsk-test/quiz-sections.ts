// Section model + storytelling copy for the immersive HSK-test runner.
//
// The test is presented as skill sections (vocabulary → grammar → reading →
// listening) with an intro screen, a short interstitial before each section,
// and a final screen — mirroring the Praktikum profession-test flow, adapted
// to Chinese / HSK. All UI strings are Russian; Chinese only appears inside
// the questions themselves.

import type { HskTestQuestion, HskTestSkill } from "./types";

/** Canonical presentation order. Questions are sorted into this order at
 *  `start` time (see lib/hsk-test/state.tsx). */
export const SKILL_ORDER: HskTestSkill[] = [
  "vocabulary",
  "grammar",
  "reading",
  "listening",
];

export interface QuizSection {
  skill: HskTestSkill;
  /** Indexes into the questions array that belong to this section. */
  qIndexes: number[];
}

/** Group questions into skill sections, in canonical order, skipping skills
 *  that aren't present in the current set (e.g. express HSK 1 may have no
 *  listening block). Robust to unsorted input. */
export function buildSections(questions: HskTestQuestion[]): QuizSection[] {
  const buckets = new Map<HskTestSkill, number[]>();
  questions.forEach((q, i) => {
    const list = buckets.get(q.skill);
    if (list) list.push(i);
    else buckets.set(q.skill, [i]);
  });
  return SKILL_ORDER.filter((skill) => buckets.has(skill)).map((skill) => ({
    skill,
    qIndexes: buckets.get(skill)!,
  }));
}

export interface SectionCopy {
  /** Short label — shown in the bottom progress pill + interstitial eyebrow. */
  label: string;
  /** Interstitial headline. */
  title: string;
  /** Interstitial body. */
  body: string;
  /** TestArt asset name (public/hsk-test/<art>.png). */
  art: string;
}

export const SECTION_COPY: Record<HskTestSkill, SectionCopy> = {
  vocabulary: {
    label: "Лексика",
    title: "Начнём с лексики",
    body: "Проверим, сколько слов и иероглифов вы узнаёте без подсказок. Выбирайте первый вариант, который кажется верным, — долго думать не нужно.",
    art: "shape-folder",
  },
  grammar: {
    label: "Грамматика",
    title: "Теперь — грамматика",
    body: "Служебные слова, порядок слов и структуры предложений. Здесь видно, насколько уверенно вы собираете фразу, а не просто узнаёте слова.",
    art: "shape-masks",
  },
  reading: {
    label: "Чтение",
    title: "Переходим к чтению",
    body: "Короткие тексты и сборка предложений. Читайте целиком — иногда ответ прячется в последней строке.",
    art: "shape-spinner",
  },
  listening: {
    label: "Понимание на слух",
    title: "Финальный блок — на слух",
    body: "Послушайте запись и выберите ответ. Звук включается по кнопке, переслушать можно сколько угодно раз.",
    art: "shape-toggle",
  },
};

export const INTRO_COPY = {
  eyebrow: "Бесплатно · без регистрации",
  title: "Этот тест покажет ваш уровень китайского",
  body: "Сначала проверим лексику и грамматику, потом чтение и понимание на слух. Вопросы идут от простого к сложному — отвечайте честно, так результат точнее. Это займёт 5–10 минут.",
  art: "intro",
  consent: "Хочу получать материалы и советы по китайскому от ChinaChild",
  cta: "Начать",
} as const;

export const FINAL_COPY = {
  title: "Вопросов больше нет — посчитаем ваш уровень",
  body: "Взвесим каждый ответ по сложности и покажем уровень HSK, разбор по навыкам и рекомендацию, что учить дальше.",
  art: "final",
  cta: "Узнать результат",
} as const;
