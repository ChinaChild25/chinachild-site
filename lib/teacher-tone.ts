// Нарисованный фон под фото преподавателя. Фото всегда прозрачные (свой фон
// картинки не несут), поэтому подложку рисуем в UI через CSS-класс — её можно
// в любой момент поменять, не трогая сами изображения.
// Тон закреплён за slug'ом, чтобы он совпадал на главной, в разделе «Команда»
// и на странице профиля.

const TONES = [
  "teacher-photo--peach",
  "teacher-photo--sky",
  "teacher-photo--violet",
  "teacher-photo--lime",
] as const;

const TONE_BY_SLUG: Record<string, (typeof TONES)[number]> = {
  "anastasia-ponomareva": "teacher-photo--peach",
  "anastasia-erina": "teacher-photo--sky",
  "zhao-li": "teacher-photo--violet",
  "milena-karlova": "teacher-photo--lime",
};

export function teacherToneClass(slug: string): string {
  const fixed = TONE_BY_SLUG[slug];
  if (fixed) return fixed;
  // Детерминированный фолбэк для новых преподавателей.
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length];
}

// Тон-класс блока-обложки в профиле. Берёт тот же оттенок, что и подложка под
// фото (teacherToneClass), но в более насыщенном `card-*-soft` варианте —
// фото-аватар оказывается чуть светлее своего блока и сливается с ним по тону.
export function teacherBlockToneClass(slug: string): string {
  const tone = teacherToneClass(slug).replace("teacher-photo--", "");
  return `card-${tone}-soft`;
}
