export const COURSE_PACKAGES = {
  introduction: {
    title: "Китайский с нуля",
    priceRub: 9_990,
    priceLabel: "9 990 ₽",
    regularPriceLabel: "12 990 ₽",
    lessonCount: 24,
  },
  individual: {
    title: "Индивидуальный",
    priceRub: 17_990,
    priceLabel: "17 990 ₽",
    durationMonths: 1,
    lessonCount: 8,
    lessonMinutes: 60,
    durationHours: 8,
    hourKind: "астрономических",
  },
  group: {
    title: "Групповой",
    priceRub: 15_990,
    priceLabel: "15 990 ₽",
    durationHours: 8,
    hourKind: "академических",
  },
} as const;

export type CoursePackageId = keyof typeof COURSE_PACKAGES;
