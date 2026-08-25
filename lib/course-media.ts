// Иллюстрация курса = та же, что представляет курс на главной (раздел «Кому
// подойдёт»). Используется и в hero подробной страницы курса, и в карточках на
// /courses, чтобы тон/картинка совпадали. Прозрачные WebP-кадры ложатся в правый
// нижний угол и сливаются с фоном блока без просветов. Размеры — натуральные,
// чтобы next/image держал пропорции.
export type CourseMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const courseMediaBySlug: Record<string, CourseMedia> = {
  "chinese-for-kids": {
    src: "/heroes/kitajskij-dlya-shkolnikov.webp",
    alt: "Курс китайского языка для детей от 7 лет с онлайн-занятиями в ChinaChild",
    width: 3024,
    height: 1730,
  },
  "chinese-for-adults": {
    src: "/home-redesign/kitayskiy-dlya-vzroslyh-studentka-s-noutbukom.webp",
    alt: "Взрослая студентка учит китайский язык онлайн",
    width: 1408,
    height: 1152,
  },
  "online-chinese": {
    src: "/related/online.svg",
    alt: "Человек с глобусом — онлайн-обучение китайскому языку",
    width: 295,
    height: 331,
  },
  "hsk-preparation": {
    src: "/home-redesign/podgotovka-hsk-papki-dokumenty.webp",
    alt: "Папки с документами для подготовки к экзамену HSK",
    width: 848,
    height: 848,
  },
  "business-chinese": {
    src: "/home-redesign/korporativnyy-kitajskiy-papka-dokumenty.webp",
    alt: "Закрывающие документы для корпоративного обучения китайскому",
    width: 1720,
    height: 1100,
  },
};
