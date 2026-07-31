import { COURSE_PACKAGES } from "./course-packages.ts";

export const INDIVIDUAL_MODULE_TERMS = {
  priceRub: COURSE_PACKAGES.individual.priceRub,
  priceLabel: COURSE_PACKAGES.individual.priceLabel,
  durationMonths: 1,
  lessonCount: 8,
  lessonMinutes: 60,
  guidedHours: 8,
  isSubscription: false,
  isInstallment: false,
  hasDiscount: false,
  nextModulePurchasedSeparately: true,
} as const;

export const INDIVIDUAL_MODULE_CONTINUATION_COPY =
  "После завершения модуля ученик может продолжить обучение, отдельно оплатив следующий модуль. Автоматического списания и обязательной покупки следующих модулей нет.";

export type IndividualModuleStage = {
  order: number;
  title: string;
  hours: number;
  description: string;
};

export type IndividualCourseModule = {
  id: string;
  courseSlug:
    | "chinese-for-adults"
    | "chinese-for-kids"
    | "hsk-preparation";
  path:
    | "/courses/chinese-for-adults"
    | "/courses/chinese-for-kids"
    | "/courses/hsk-preparation";
  categoryId: "10023" | "20006";
  name: string;
  feedName: string;
  audience: string;
  description: string;
  classes?: string;
  stages: readonly IndividualModuleStage[];
};

export const INDIVIDUAL_COURSE_MODULES = {
  adults: {
    id: "adult-individual-monthly-module",
    courseSlug: "chinese-for-adults",
    path: "/courses/chinese-for-adults",
    categoryId: "20006",
    name: "Индивидуальный модуль китайского для взрослых",
    feedName: "Китайский для взрослых: индивидуальный модуль на месяц",
    audience: "Взрослые без подготовки или продолжающие обучение",
    description:
      "Индивидуальный онлайн-модуль с преподавателем: 8 занятий по 60 минут за один месяц. Содержание адаптируется к уровню и цели взрослого ученика.",
    stages: [
      {
        order: 1,
        title: "Пиньинь и тоны",
        hours: 2,
        description:
          "Диагностика произношения, пиньинь и четыре тона на материале, соответствующем текущему уровню.",
      },
      {
        order: 2,
        title: "Лексика и иероглифы",
        hours: 2,
        description:
          "Базовая лексика, чтение и иероглифы для повседневных задач ученика.",
      },
      {
        order: 3,
        title: "Грамматика и диалоги",
        hours: 2,
        description:
          "Практическая грамматика и разговорные сценарии с персональной обратной связью.",
      },
      {
        order: 4,
        title: "Аудирование и проверка прогресса",
        hours: 2,
        description:
          "Понимание речи на слух, закрепление материала и итоговый чек-пойнт модуля.",
      },
    ],
  },
  kids: {
    id: "schoolchildren-12plus-individual-monthly-module",
    courseSlug: "chinese-for-kids",
    path: "/courses/chinese-for-kids",
    categoryId: "10023",
    name: "Индивидуальный модуль китайского для школьников 12+",
    feedName: "Китайский для школьников 12+: индивидуальный модуль",
    audience: "Школьники строго с 12 лет",
    description:
      "Индивидуальный онлайн-модуль для школьника 12+: 8 занятий по 60 минут за один месяц, с расписанием под школьную нагрузку.",
    classes: "5–11",
    stages: [
      {
        order: 1,
        title: "Диагностика, пиньинь и тоны",
        hours: 2,
        description:
          "Определение стартового уровня, постановка произношения и работа с четырьмя тонами.",
      },
      {
        order: 2,
        title: "Лексика о себе, семье и школе",
        hours: 2,
        description:
          "Возрастная лексика, базовые фразы и первые иероглифы без механической зубрёжки.",
      },
      {
        order: 3,
        title: "Грамматика и живые диалоги",
        hours: 2,
        description:
          "Простые конструкции и разговорные ситуации в персональном темпе школьника.",
      },
      {
        order: 4,
        title: "Аудирование и отчёт о прогрессе",
        hours: 2,
        description:
          "Понимание речи на слух, закрепление и чек-пойнт с результатами модуля.",
      },
    ],
  },
  hsk: {
    id: "hsk-individual-monthly-module",
    courseSlug: "hsk-preparation",
    path: "/courses/hsk-preparation",
    categoryId: "20006",
    name: "Индивидуальный модуль подготовки к HSK",
    feedName: "Подготовка к HSK: индивидуальный модуль на месяц",
    audience: "Подростки 12+ и взрослые, готовящиеся к HSK",
    description:
      "Индивидуальный онлайн-модуль подготовки к HSK: 8 занятий по 60 минут за один месяц, с планом под текущий уровень и экзаменационную цель.",
    stages: [
      {
        order: 1,
        title: "Диагностика и экзаменационная цель",
        hours: 2,
        description:
          "Определение текущего уровня, целевого балла и приоритетных разделов экзамена.",
      },
      {
        order: 2,
        title: "Целевая лексика и грамматика",
        hours: 2,
        description:
          "Разбор слов и конструкций, которые нужны для выбранного уровня HSK.",
      },
      {
        order: 3,
        title: "Задания в формате HSK",
        hours: 2,
        description:
          "Аудирование, чтение и письмо в формате соответствующего уровня экзамена.",
      },
      {
        order: 4,
        title: "Пробник и разбор ошибок",
        hours: 2,
        description:
          "Практика на время, анализ потерянных баллов и план следующего модуля.",
      },
    ],
  },
} as const satisfies Record<string, IndividualCourseModule>;

export const INDIVIDUAL_COURSE_MODULE_LIST = Object.values(
  INDIVIDUAL_COURSE_MODULES,
);

export type IndividualCourseModuleKey =
  keyof typeof INDIVIDUAL_COURSE_MODULES;
