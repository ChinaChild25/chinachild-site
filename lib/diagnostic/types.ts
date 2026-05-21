// AI-диагностика / Chinese Fingerprint
// Общие типы. Никаких внешних зависимостей — переиспользуется и на сервере,
// и в браузере. Все вопросы идут одной структурой, тип определяет рендер.

export type QuestionType = "A" | "B" | "C" | "D" | "E" | "F";

export type HskLevel = 0 | 1 | 2 | 3 | 4 | 5;

// --- A: распознавание иероглифа -------------------------------------------
export interface QuestionA {
  id: string;
  type: "A";
  difficulty: number;
  hsk: HskLevel;
  hanzi: string;
  pinyin: string;
  options: string[];
  correctIndex: number;
}

// --- B: тон по пиньиню (с опциональным аудио через Web Speech) ------------
export interface QuestionB {
  id: string;
  type: "B";
  difficulty: number;
  hsk: HskLevel;
  syllable: string; // без тона: "ma"
  hanzi: string;    // целевой иероглиф для зачитывания
  correctTone: 1 | 2 | 3 | 4 | 5; // 5 = нейтральный
  translation: string;
}

// --- C: произношение (Speech Recognition + Claude-оценка) -----------------
export interface QuestionC {
  id: string;
  type: "C";
  difficulty: number;
  hsk: HskLevel;
  hanzi: string;
  pinyin: string;
  translation: string;
  expected: string[]; // приемлемые варианты (учитываем омофоны/толерантность)
}

// --- D: сборка предложения -----------------------------------------------
export interface QuestionD {
  id: string;
  type: "D";
  difficulty: number;
  hsk: HskLevel;
  translation: string;
  tiles: { hanzi: string; pinyin: string }[]; // перемешаем на клиенте
  correctOrder: number[]; // индексы tiles в правильном порядке
}

// --- E: чтение / cloze ---------------------------------------------------
export interface QuestionE {
  id: string;
  type: "E";
  difficulty: number;
  hsk: HskLevel;
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// --- F: порядок черт (да/нет) --------------------------------------------
export interface QuestionF {
  id: string;
  type: "F";
  difficulty: number;
  hsk: HskLevel;
  hanzi: string;
  correctOrder: boolean; // показываем правильный или нарочно переставленный?
}

export type Question =
  | QuestionA
  | QuestionB
  | QuestionC
  | QuestionD
  | QuestionE
  | QuestionF;

// --- Калибровка ----------------------------------------------------------
export type Experience = "none" | "lt3m" | "lt1y" | "1to3y" | "gt3y";
export type Goal = "work" | "travel" | "live" | "fun" | "business";

export interface Calibration {
  experience: Experience;
  goal: Goal;
  minutesPerDay: number; // 5–60
}

// --- Ответы ---------------------------------------------------------------
export interface AnswerRecord {
  questionId: string;
  type: QuestionType;
  hsk: HskLevel;
  difficulty: number;
  correct: boolean;
  // 0..1 — для типа C это «соответствие произношения», даёт частичный кредит
  score?: number;
  responseTimeMs: number;
  skipped?: boolean;
}

// --- Архетипы -------------------------------------------------------------
export type ArchetypeId =
  | "pattern-hunter"
  | "tone-whisperer"
  | "grammar-architect"
  | "speed-reader"
  | "methodical-climber"
  | "intuition-linguist"
  | "memory-master"
  | "brave-beginner";

export interface Archetype {
  id: ArchetypeId;
  zh: string;
  pinyin: string;
  ru: string;
  tagline: string;
  description: string;
}

// --- Профиль навыков (для радара) ----------------------------------------
export interface SkillProfile {
  hanzi: number;   // 字 — распознавание
  tones: number;   // 音 — тоны
  grammar: number; // 语 — грамматика
  reading: number; // 读 — чтение
  speed: number;   // 速 — скорость
  listening: number; // 听 — аудирование
}

// --- Итоговый профиль ---------------------------------------------------
export interface DiagnosticResult {
  ability: number;
  standardError: number;
  hsk: HskLevel;
  skills: SkillProfile;
  archetype: ArchetypeId;
  percentileVsCohort: number; // 0..100 — насколько лучше средних с тем же стажем
  monthsToNextLevel: number;  // прогноз
  nextHsk: HskLevel;
}
