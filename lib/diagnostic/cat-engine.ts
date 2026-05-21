import type {
  AnswerRecord,
  HskLevel,
  Question,
  QuestionType,
  SkillProfile,
} from "./types";

// ---------------------------------------------------------------------------
// Computer Adaptive Testing engine — упрощённая байесовская оценка θ.
//
// Принцип: после каждого ответа сдвигаем θ к/от сложности задания,
// уменьшая стандартную ошибку. Чем ближе сложность к текущей θ,
// тем «информативнее» был ответ, тем сильнее падает SE.
// Скорость ответа корректирует ширину шага.
// ---------------------------------------------------------------------------

export const START_ABILITY = 0;
export const START_SE = 1.5;
export const STOP_SE = 0.4;
export const MIN_ITEMS = 14;
export const MAX_ITEMS = 22;

export interface EngineState {
  ability: number;
  standardError: number;
  asked: Set<string>;
  history: AnswerRecord[];
  /** Подряд идущие задания одного типа — чтобы не выдавать 3+ подряд. */
  lastType: QuestionType | null;
  consecutiveSameType: number;
}

export function createEngineState(): EngineState {
  return {
    ability: START_ABILITY,
    standardError: START_SE,
    asked: new Set(),
    history: [],
    lastType: null,
    consecutiveSameType: 0,
  };
}

/**
 * Выбираем следующий вопрос.
 *   1) Только те, что ещё не задавали.
 *   2) Тип C (speaking) — только при ability > 0.
 *   3) Тип F (stroke order) — только при ability > 0.5.
 *   4) Не больше 2 подряд одного типа.
 *   5) Сложность ближе к текущей ability (но добавим лёгкое разнообразие).
 */
export function selectNextItem(
  state: EngineState,
  pool: Question[],
): Question | null {
  const allowed = pool.filter((q) => {
    if (state.asked.has(q.id)) return false;
    if (q.type === "C" && state.ability <= 0) return false;
    if (q.type === "F" && state.ability <= 0.5) return false;
    if (
      state.lastType === q.type &&
      state.consecutiveSameType >= 2
    ) {
      return false;
    }
    return true;
  });

  if (allowed.length === 0) {
    // Снимаем ограничение по типу-streak в крайнем случае
    const relaxed = pool.filter(
      (q) =>
        !state.asked.has(q.id) &&
        !(q.type === "C" && state.ability <= 0) &&
        !(q.type === "F" && state.ability <= 0.5),
    );
    if (relaxed.length === 0) return null;
    return pickClosest(relaxed, state.ability, state.history.length);
  }

  return pickClosest(allowed, state.ability, state.history.length);
}

function pickClosest(
  pool: Question[],
  ability: number,
  attemptIndex: number,
): Question {
  // Ранжируем по близости к ability + лёгкому штрафу за «опять тот же тип».
  // На первых шагах добавляем стохастичность через детерминированный хэш
  // (зависит от attemptIndex), чтобы тест не был идентичным у всех.
  const sorted = [...pool].sort((a, b) => {
    const da = Math.abs(a.difficulty - ability);
    const db = Math.abs(b.difficulty - ability);
    return da - db;
  });

  // Берём из топ-3 ближайших, чтобы добавить разнообразие
  const top = sorted.slice(0, Math.min(3, sorted.length));
  const idx = hashPick(attemptIndex, top.length);
  return top[idx];
}

function hashPick(n: number, mod: number): number {
  // Дешёвый детерминированный «псевдо-рандом» — для разнообразия по attempt index
  const h = (n * 2654435761) >>> 0;
  return h % mod;
}

/**
 * Обновляем θ и SE после ответа.
 *
 * Логика:
 *   Если ответ правильный — θ смещается вверх на величину, зависящую от того,
 *   насколько сложность была выше текущей θ (правильно ответил на сложное →
 *   сильный сигнал, θ растёт).
 *   Если неправильный — наоборот.
 *
 *   Скорость: быстрые правильные ответы дают доп. буст; долгие неуверенные —
 *   ослабляют как правильные, так и неправильные.
 *
 *   SE уменьшаем плавно — каждый информативный ответ снижает её,
 *   около пика ability (|diff − θ| < 0.3) сильнее.
 */
export function updateAbility(
  state: EngineState,
  question: Question,
  correct: boolean,
  responseTimeMs: number,
  partialScore?: number,
): void {
  const score = partialScore !== undefined ? partialScore : correct ? 1 : 0;
  const diff = question.difficulty;
  const delta = diff - state.ability;

  // Базовый сдвиг
  const expected = 1 / (1 + Math.exp(-delta * 1.2));
  const observed = score; // 0..1
  const step = (observed - expected) * 0.55 * Math.max(state.standardError, 0.5);

  state.ability += step;
  state.ability = clamp(state.ability, -3, 3);

  // Бонус/штраф за скорость только при экстремумах
  if (responseTimeMs < 3000 && score >= 0.9) state.ability += 0.05;
  if (responseTimeMs > 25000 && score <= 0.2) state.ability -= 0.04;

  // SE — снижаем тем больше, чем ближе сложность к θ
  const information = Math.exp(-Math.abs(delta) * 0.8);
  state.standardError = Math.max(0.25, state.standardError - 0.16 * information);

  // История
  state.asked.add(question.id);
  state.history.push({
    questionId: question.id,
    type: question.type,
    hsk: question.hsk,
    difficulty: question.difficulty,
    correct,
    score: partialScore,
    responseTimeMs,
  });
  if (state.lastType === question.type) {
    state.consecutiveSameType += 1;
  } else {
    state.lastType = question.type;
    state.consecutiveSameType = 1;
  }
}

export function isDone(state: EngineState): boolean {
  if (state.history.length >= MAX_ITEMS) return true;
  if (state.history.length < MIN_ITEMS) return false;
  return state.standardError < STOP_SE;
}

/**
 * Прогресс — нелинейный, как «уверенность модели».
 * 0 при старте, плавно ускоряется к концу. Не доходит до 100 раньше времени.
 */
export function confidenceProgress(state: EngineState): number {
  const seStart = START_SE;
  const seCur = state.standardError;
  // 0..1, где 1 — SE достигла STOP_SE
  const seBased = clamp(
    (seStart - seCur) / (seStart - STOP_SE),
    0,
    1,
  );
  const countBased = clamp(state.history.length / MAX_ITEMS, 0, 1);
  // Среднее с уклоном в SE
  return clamp(seBased * 0.7 + countBased * 0.3, 0, 1);
}

export function estimatedHsk(ability: number): HskLevel {
  if (ability < -1.5) return 0;
  if (ability < -0.5) return 1;
  if (ability < 0.5) return 2;
  if (ability < 1.5) return 3;
  if (ability < 2.3) return 4;
  return 5;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// ---------------------------------------------------------------------------
// Skill profile — считаем 6 осей радара из истории ответов.
//   字 hanzi      — тип A
//   音 tones      — тип B + точность голоса (C)
//   语 grammar    — тип D
//   读 reading    — тип E
//   速 speed      — отношение быстрых правильных к общим
//   听 listening  — для MVP считаем как «B + C»; будет точнее, когда добавим аудио-задания
// ---------------------------------------------------------------------------

export function computeSkillProfile(history: AnswerRecord[]): SkillProfile {
  return {
    hanzi: axisScore(history, (a) => a.type === "A"),
    tones: axisScore(history, (a) => a.type === "B"),
    grammar: axisScore(history, (a) => a.type === "D"),
    reading: axisScore(history, (a) => a.type === "E"),
    speed: speedAxis(history),
    listening: axisScore(history, (a) => a.type === "B" || a.type === "C"),
  };
}

function axisScore(
  history: AnswerRecord[],
  pred: (a: AnswerRecord) => boolean,
): number {
  const items = history.filter(pred);
  if (items.length === 0) return baselineFromAbility(history);
  // Учитываем partial score для типа C
  const sum = items.reduce(
    (acc, a) => acc + (a.score !== undefined ? a.score : a.correct ? 1 : 0),
    0,
  );
  const ratio = sum / items.length;
  // Шкала 20..95, чтобы радар никогда не был пустым
  return Math.round(20 + ratio * 75);
}

function baselineFromAbility(history: AnswerRecord[]): number {
  // Если по оси нет данных — отдаём оценку через среднюю сложность правильных
  const correct = history.filter((h) => h.correct);
  if (correct.length === 0) return 30;
  const avg =
    correct.reduce((s, h) => s + h.difficulty, 0) / correct.length;
  // ability в диапазоне [-2.5; 2.5] → score 25..85
  return Math.round(25 + ((avg + 2.5) / 5) * 60);
}

function speedAxis(history: AnswerRecord[]): number {
  if (history.length === 0) return 50;
  const correctFast = history.filter(
    (h) => h.correct && h.responseTimeMs < 8000,
  ).length;
  const ratio = correctFast / history.length;
  return Math.round(25 + ratio * 70);
}

/**
 * Прогноз времени до следующего HSK-уровня.
 * Грубая модель: ~120 часов фокусного времени между соседними уровнями,
 * со скейлом 0.85 для motivated profiles (Brave Beginner и т.п.).
 */
export function predictMonthsToNextLevel(params: {
  ability: number;
  currentHsk: HskLevel;
  minutesPerDay: number;
}): number {
  const hoursPerLevel = 110;
  const minutesPerDay = Math.max(5, params.minutesPerDay);
  const hoursPerMonth = (minutesPerDay * 30) / 60;
  const totalHours =
    hoursPerLevel * (1 - Math.max(0, params.ability - estimatedFloor(params.currentHsk)) * 0.25);
  return Math.max(2, Math.ceil(totalHours / hoursPerMonth));
}

function estimatedFloor(hsk: HskLevel): number {
  if (hsk === 0) return -1.5;
  if (hsk === 1) return -0.5;
  if (hsk === 2) return 0.5;
  if (hsk === 3) return 1.5;
  if (hsk === 4) return 2.3;
  return 2.5;
}

// ---------------------------------------------------------------------------
// Перцентиль vs когорта — мнимый, но детерминированный.
// Считаем относительно условного среднего ability для стажа.
// ---------------------------------------------------------------------------
export function percentileVsCohort(
  ability: number,
  experience:
    | "none"
    | "lt3m"
    | "lt1y"
    | "1to3y"
    | "gt3y",
): number {
  const meanByExp: Record<string, number> = {
    none: -1.5,
    lt3m: -0.7,
    lt1y: 0.1,
    "1to3y": 0.8,
    gt3y: 1.6,
  };
  const sigma = 1.1;
  const z = (ability - meanByExp[experience]) / sigma;
  // Нормальное CDF (быстрая аппроксимация)
  const cdf =
    1 / (1 + Math.exp(-1.7 * z * (1 + 0.044 * z * z)));
  return Math.round(clamp(cdf, 0.02, 0.98) * 100);
}
