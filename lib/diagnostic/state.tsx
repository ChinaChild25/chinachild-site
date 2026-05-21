"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  computeSkillProfile,
  createEngineState,
  estimatedHsk,
  isDone,
  percentileVsCohort,
  predictMonthsToNextLevel,
  selectNextItem,
  updateAbility,
  type EngineState,
} from "./cat-engine";
import { QUESTION_BANK } from "./questions";
import { chooseArchetype } from "./archetypes";
import type {
  AnswerRecord,
  Calibration,
  DiagnosticResult,
  HskLevel,
  Question,
} from "./types";

const STORAGE_KEY = "chinachild.diagnostic.v2";

interface DiagnosticState {
  calibration: Calibration | null;
  engine: EngineState;
  currentQuestion: Question | null;
  startedAt: number | null;
  finishedAt: number | null;
  result: DiagnosticResult | null;
}

export interface SubmitResult {
  done: boolean;
  next: Question | null;
  result: DiagnosticResult | null;
}

interface DiagnosticContextValue {
  state: DiagnosticState;
  hydrated: boolean;
  start: () => void;
  setCalibration: (calibration: Calibration) => void;
  /** Возвращает первый вопрос (или существующий currentQuestion при resume). */
  beginTest: () => Question | null;
  /**
   * Атомарно: применить ответ, обновить ability/SE, выбрать следующий вопрос,
   * посчитать done. Возвращает всё разом — никаких setState-замыканий.
   */
  submitAnswer: (
    question: Question,
    correct: boolean,
    responseTimeMs: number,
    partialScore?: number,
  ) => SubmitResult;
  reset: () => void;
  /** Финализирует результат, если он ещё не вычислен. */
  finalize: () => DiagnosticResult | null;
}

const DiagnosticContext = createContext<DiagnosticContextValue | null>(null);

function serializeEngine(engine: EngineState) {
  return {
    ability: engine.ability,
    standardError: engine.standardError,
    asked: Array.from(engine.asked),
    history: engine.history,
    lastType: engine.lastType,
    consecutiveSameType: engine.consecutiveSameType,
  };
}

function deserializeEngine(raw: {
  ability: number;
  standardError: number;
  asked: string[];
  history: AnswerRecord[];
  lastType: EngineState["lastType"];
  consecutiveSameType: number;
}): EngineState {
  return {
    ability: raw.ability,
    standardError: raw.standardError,
    asked: new Set(raw.asked),
    history: raw.history,
    lastType: raw.lastType,
    consecutiveSameType: raw.consecutiveSameType,
  };
}

function cloneEngine(e: EngineState): EngineState {
  return {
    ability: e.ability,
    standardError: e.standardError,
    asked: new Set(e.asked),
    history: [...e.history],
    lastType: e.lastType,
    consecutiveSameType: e.consecutiveSameType,
  };
}

function initialState(): DiagnosticState {
  return {
    calibration: null,
    engine: createEngineState(),
    currentQuestion: null,
    startedAt: null,
    finishedAt: null,
    result: null,
  };
}

function loadFromStorage(): DiagnosticState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      calibration: Calibration | null;
      engine: ReturnType<typeof serializeEngine>;
      currentQuestion: Question | null;
      startedAt: number | null;
      finishedAt: number | null;
      result: DiagnosticResult | null;
    };
    return {
      calibration: parsed.calibration,
      engine: deserializeEngine(parsed.engine),
      currentQuestion: parsed.currentQuestion,
      startedAt: parsed.startedAt,
      finishedAt: parsed.finishedAt,
      result: parsed.result,
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: DiagnosticState) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      calibration: state.calibration,
      engine: serializeEngine(state.engine),
      currentQuestion: state.currentQuestion,
      startedAt: state.startedAt,
      finishedAt: state.finishedAt,
      result: state.result,
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* storage full / disabled */
  }
}

function finalizeResult(state: DiagnosticState): DiagnosticResult | null {
  if (!state.calibration) return null;
  const ability = state.engine.ability;
  const hsk = estimatedHsk(ability);
  const skills = computeSkillProfile(state.engine.history);

  const totalTime =
    state.engine.history.reduce((s, h) => s + h.responseTimeMs, 0) /
    Math.max(1, state.engine.history.length);

  const vocabItems = state.engine.history.filter((h) => h.type === "A");
  const vocabAcc =
    vocabItems.length === 0
      ? 0
      : vocabItems.filter((h) => h.correct).length / vocabItems.length;

  const attemptedItems = state.engine.history.filter((h) => !h.skipped).length;
  const attemptRate =
    state.engine.history.length === 0
      ? 0
      : attemptedItems / state.engine.history.length;

  const archetype = chooseArchetype(skills, ability, totalTime, vocabAcc, attemptRate);
  const nextHsk = (Math.min(5, hsk + 1) as HskLevel);
  const monthsToNextLevel = predictMonthsToNextLevel({
    ability,
    currentHsk: hsk,
    minutesPerDay: state.calibration.minutesPerDay,
  });

  return {
    ability,
    standardError: state.engine.standardError,
    hsk,
    skills,
    archetype,
    percentileVsCohort: percentileVsCohort(ability, state.calibration.experience),
    monthsToNextLevel,
    nextHsk,
  };
}

export function DiagnosticProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInternal] = useState<DiagnosticState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  // stateRef всегда содержит АКТУАЛЬНОЕ состояние для синхронных операций.
  const stateRef = useRef<DiagnosticState>(state);

  /** Единственный путь записи: обновляет и ref, и React-state. */
  const commit = useCallback((next: DiagnosticState) => {
    stateRef.current = next;
    setStateInternal(next);
  }, []);

  // Гидрация из localStorage
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) {
      stateRef.current = loaded;
      setStateInternal(loaded);
    }
    setHydrated(true);
  }, []);

  // Персистим — но не на стадии гидрации
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  const start = useCallback(() => {
    const cur = stateRef.current;
    commit({ ...cur, startedAt: cur.startedAt ?? Date.now() });
  }, [commit]);

  const setCalibration = useCallback(
    (calibration: Calibration) => {
      const cur = stateRef.current;
      commit({ ...cur, calibration, startedAt: cur.startedAt ?? Date.now() });
    },
    [commit],
  );

  const beginTest = useCallback((): Question | null => {
    const cur = stateRef.current;
    if (cur.currentQuestion) return cur.currentQuestion;
    const q = selectNextItem(cur.engine, QUESTION_BANK);
    if (!q) return null;
    commit({ ...cur, currentQuestion: q });
    return q;
  }, [commit]);

  const submitAnswer = useCallback(
    (
      question: Question,
      correct: boolean,
      responseTimeMs: number,
      partialScore?: number,
    ): SubmitResult => {
      const cur = stateRef.current;
      const engine = cloneEngine(cur.engine);
      updateAbility(engine, question, correct, responseTimeMs, partialScore);

      const done = isDone(engine);
      const nextQ = done ? null : selectNextItem(engine, QUESTION_BANK);

      const next: DiagnosticState = {
        ...cur,
        engine,
        currentQuestion: nextQ,
        finishedAt: done && !cur.finishedAt ? Date.now() : cur.finishedAt,
      };
      if (done) {
        next.result = finalizeResult(next);
      }
      commit(next);
      return { done, next: nextQ, result: next.result };
    },
    [commit],
  );

  const reset = useCallback(() => {
    const fresh = initialState();
    stateRef.current = fresh;
    setStateInternal(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const finalize = useCallback((): DiagnosticResult | null => {
    const cur = stateRef.current;
    const existing = cur.result;
    if (existing) return existing;
    const result = finalizeResult(cur);
    commit({ ...cur, result, finishedAt: cur.finishedAt ?? Date.now() });
    return result;
  }, [commit]);

  const value = useMemo(
    () => ({ state, hydrated, start, setCalibration, beginTest, submitAnswer, reset, finalize }),
    [state, hydrated, start, setCalibration, beginTest, submitAnswer, reset, finalize],
  );

  return (
    <DiagnosticContext.Provider value={value}>{children}</DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error("useDiagnostic must be used inside DiagnosticProvider");
  return ctx;
}
