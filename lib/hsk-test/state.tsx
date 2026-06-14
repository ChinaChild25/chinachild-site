"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { pickAdaptive, pickQuestions } from "./questions";
import { SKILL_ORDER } from "./quiz-sections";
import { computeResult, scoreAnswer } from "./scoring";
import type {
  HskAnswer,
  HskTestLevel,
  HskTestMode,
  HskTestQuestion,
  HskTestResult,
} from "./types";

const STORAGE_KEY = "chinachild.hsk-test.v1";

const MODE_LENGTH: Record<HskTestMode, number> = {
  express: 10,
  full: 20,
  adaptive: 15,
};

interface HskTestState {
  level: HskTestLevel | null;
  mode: HskTestMode | null;
  questions: HskTestQuestion[];
  answers: HskAnswer[];
  index: number;
  result: HskTestResult | null;
  /** Optional name on the certificate. */
  name: string;
}

const initialState: HskTestState = {
  level: null,
  mode: null,
  questions: [],
  answers: [],
  index: 0,
  result: null,
  name: "",
};

type Action =
  | { type: "start"; level: HskTestLevel; mode: HskTestMode }
  | { type: "answer"; questionId: string; value: unknown }
  | { type: "next" }
  | { type: "back" }
  | { type: "finish" }
  | { type: "reset" }
  | { type: "setName"; value: string }
  | { type: "hydrate"; value: HskTestState };

function reducer(state: HskTestState, action: Action): HskTestState {
  switch (action.type) {
    case "start": {
      const seed = Date.now() & 0xffffffff;
      const length = MODE_LENGTH[action.mode];
      const picked =
        action.mode === "adaptive"
          ? pickAdaptive(action.level, length, seed)
          : pickQuestions(action.level, length, seed);
      // Group into skill sections (vocabulary → grammar → reading → listening)
      // so the runner can show one block per skill with interstitials between.
      // Array.prototype.sort is stable (ES2019+), so difficulty progression
      // within each skill — produced by pick* — is preserved. Scoring iterates
      // all questions and is order-independent, so this only affects display.
      const questions = [...picked].sort(
        (a, b) => SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill),
      );
      return {
        ...state,
        level: action.level,
        mode: action.mode,
        questions,
        answers: [],
        index: 0,
        result: null,
      };
    }
    case "answer": {
      const q = state.questions.find((it) => it.id === action.questionId);
      if (!q) return state;
      const scored = scoreAnswer(q, action.value);
      const others = state.answers.filter(
        (a) => a.questionId !== action.questionId,
      );
      return { ...state, answers: [...others, scored] };
    }
    case "next": {
      if (state.index >= state.questions.length - 1) return state;
      return { ...state, index: state.index + 1 };
    }
    case "back": {
      if (state.index <= 0) return state;
      return { ...state, index: state.index - 1 };
    }
    case "finish": {
      if (!state.level || !state.mode) return state;
      const result = computeResult(
        state.level,
        state.mode,
        state.questions,
        state.answers,
      );
      return { ...state, result };
    }
    case "reset":
      return { ...initialState };
    case "setName":
      return { ...state, name: action.value };
    case "hydrate":
      return action.value;
  }
}

interface HskTestContextValue {
  state: HskTestState;
  hydrated: boolean;
  /** Begin a fresh test for a level + mode. */
  start: (level: HskTestLevel, mode: HskTestMode) => void;
  /** Record an answer for the current question (index-based, legacy). */
  answer: (value: unknown) => void;
  /** Record an answer for a specific question by id. Used by the immersive
   *  runner, which drives its own screen machine instead of state.index. */
  recordAnswer: (questionId: string, value: unknown) => void;
  /** Read the stored answer for the current question, if any. */
  getCurrentAnswer: () => HskAnswer | undefined;
  next: () => void;
  back: () => void;
  /** Move to result. Returns true if successful. */
  finish: () => boolean;
  reset: () => void;
  setName: (value: string) => void;
}

const HskTestContext = createContext<HskTestContextValue | null>(null);

export function HskTestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  // Hydrate once.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HskTestState;
        // We don't restore in-progress test (questions may differ between
        // visits). Only the last result + name persists.
        const restore: HskTestState = {
          ...initialState,
          name: parsed.name ?? "",
          result: parsed.result ?? null,
        };
        dispatch({ type: "hydrate", value: restore });
      }
    } catch {
      // localStorage may throw in private mode — ignore.
    }
    hydratedRef.current = true;
  }, []);

  // Persist on each change after hydration.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const slim = { name: state.name, result: state.result };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      // ignore
    }
  }, [state.name, state.result]);

  const start = useCallback(
    (level: HskTestLevel, mode: HskTestMode) =>
      dispatch({ type: "start", level, mode }),
    [],
  );
  const answer = useCallback(
    (value: unknown) => {
      const q = state.questions[state.index];
      if (!q) return;
      dispatch({ type: "answer", questionId: q.id, value });
    },
    [state.index, state.questions],
  );
  const recordAnswer = useCallback(
    (questionId: string, value: unknown) =>
      dispatch({ type: "answer", questionId, value }),
    [],
  );
  const getCurrentAnswer = useCallback(() => {
    const q = state.questions[state.index];
    if (!q) return undefined;
    return state.answers.find((a) => a.questionId === q.id);
  }, [state.answers, state.index, state.questions]);

  const next = useCallback(() => dispatch({ type: "next" }), []);
  const back = useCallback(() => dispatch({ type: "back" }), []);
  const finish = useCallback(() => {
    dispatch({ type: "finish" });
    return true;
  }, []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const setName = useCallback(
    (value: string) => dispatch({ type: "setName", value }),
    [],
  );

  const value = useMemo<HskTestContextValue>(
    () => ({
      state,
      hydrated: hydratedRef.current,
      start,
      answer,
      recordAnswer,
      getCurrentAnswer,
      next,
      back,
      finish,
      reset,
      setName,
    }),
    [
      state,
      start,
      answer,
      recordAnswer,
      getCurrentAnswer,
      next,
      back,
      finish,
      reset,
      setName,
    ],
  );

  return (
    <HskTestContext.Provider value={value}>{children}</HskTestContext.Provider>
  );
}

export function useHskTest(): HskTestContextValue {
  const ctx = useContext(HskTestContext);
  if (!ctx) {
    throw new Error("useHskTest must be used inside <HskTestProvider>");
  }
  return ctx;
}

export { MODE_LENGTH };
