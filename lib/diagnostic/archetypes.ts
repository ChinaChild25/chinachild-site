import type { Archetype, ArchetypeId, SkillProfile } from "./types";

// Архетипы — внутренний ID латиницей (не показывается пользователю),
// отображается ТОЛЬКО 中文 + русское название. Никаких «Pattern Hunter» в UI.

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  "pattern-hunter": {
    id: "pattern-hunter",
    zh: "图形猎手",
    pinyin: "túxíng lièshǒu",
    ru: "Охотник за иероглифами",
    tagline: "Визуально-первый мозг",
    description:
      "Вы узнаёте иероглифы быстрее, чем большинство изучающих ваш уровень, но тоны пока даются сложнее. Ваш мозг визуально-первый — это сильная опора для быстрого роста словарного запаса.",
  },
  "tone-whisperer": {
    id: "tone-whisperer",
    zh: "声调诗人",
    pinyin: "shēngdiào shīrén",
    ru: "Слух на тоны",
    tagline: "Тонкий музыкальный слух",
    description:
      "Тоны вы слышите и воспроизводите точнее, чем большинство. Это редкое преимущество — оно сэкономит месяцы на разговорной практике и даст уверенность в живом общении.",
  },
  "grammar-architect": {
    id: "grammar-architect",
    zh: "语法工匠",
    pinyin: "yǔfǎ gōngjiàng",
    ru: "Архитектор грамматики",
    tagline: "Чувство структуры",
    description:
      "Вы видите китайскую грамматику как систему, а не как набор правил. Сильнее всего это проявляется в построении сложных предложений и работе со служебными словами.",
  },
  "speed-reader": {
    id: "speed-reader",
    zh: "阅读快客",
    pinyin: "yuèdú kuàikè",
    ru: "Скоростной читатель",
    tagline: "Беглое чтение",
    description:
      "Вы читаете тексты быстрее и точнее, чем средний ученик вашего уровня. Это значит, ваш визуальный лексикон уже работает «как родной» — вы не переводите, а понимаете.",
  },
  "methodical-climber": {
    id: "methodical-climber",
    zh: "稳步登山者",
    pinyin: "wěnbù dēngshānzhě",
    ru: "Системный путь",
    tagline: "Ровный прогресс",
    description:
      "У вас сбалансированный профиль без явных провалов — это самый предсказуемый путь к беглости. Хорошо реагируете на структурные курсы и регулярные интервальные повторения.",
  },
  "intuition-linguist": {
    id: "intuition-linguist",
    zh: "直觉语者",
    pinyin: "zhíjué yǔzhě",
    ru: "Языковая интуиция",
    tagline: "Чутьё языка",
    description:
      "Вы отвечаете быстрее среднего и часто угадываете правильный вариант ещё до того, как «разобрали» его. Хорошо подходят аудио-методики и иммерсивный контент.",
  },
  "memory-master": {
    id: "memory-master",
    zh: "记忆大师",
    pinyin: "jìyì dàshī",
    ru: "Лексический запас",
    tagline: "Сильная вербальная память",
    description:
      "Большой активный словарный запас при умеренном времени изучения. У вас сильная вербальная память — переходите к чтению адаптированных текстов раньше, чем большинство.",
  },
  "brave-beginner": {
    id: "brave-beginner",
    zh: "勇敢新手",
    pinyin: "yǒnggǎn xīnshǒu",
    ru: "Смелый старт",
    tagline: "Не боитесь пробовать",
    description:
      "Вы делаете попытки даже на незнакомом материале — это очень ценное качество. Главное сейчас — система: 20 минут в день дадут заметный сдвиг уже через 6–8 недель.",
  },
};

/**
 * Выбираем архетип по скил-профилю и характеристикам теста.
 * Логика: считаем оси, ищем самый сильный/слабый перекос или баланс.
 * Дополнительно учитываем avgResponseTime и общий ability.
 */
export function chooseArchetype(
  skills: SkillProfile,
  ability: number,
  avgResponseTimeMs: number,
  vocabAccuracy: number,
  attemptRate: number,
): ArchetypeId {
  const values = [
    skills.hanzi,
    skills.tones,
    skills.grammar,
    skills.reading,
    skills.speed,
    skills.listening,
  ];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  if (ability < -1 && attemptRate > 0.7) return "brave-beginner";
  if (spread < 12) return "methodical-climber";
  if (avgResponseTimeMs < 4500 && ability > -0.3) return "intuition-linguist";
  if (skills.hanzi - skills.tones > 14) return "pattern-hunter";
  if (skills.tones >= max - 1 && skills.tones - skills.hanzi > 10) return "tone-whisperer";
  if (skills.reading >= max - 1 && avgResponseTimeMs < 7000) return "speed-reader";
  if (skills.grammar >= max - 1 && skills.grammar - skills.hanzi > 5) return "grammar-architect";
  if (vocabAccuracy > 0.78) return "memory-master";
  return "methodical-climber";
}
