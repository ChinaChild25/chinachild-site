// HSK-level test (interactive landing). Types are shared client + server.
// All UI-facing strings are Russian; question payloads embed Chinese where needed.

export type HskTestLevel = 1 | 2 | 3 | 4;

export type HskTestSkill = "vocabulary" | "grammar" | "reading" | "listening";

export type HskTestMode = "express" | "full" | "adaptive";

/** Each renderer picks the variant by `type`. */
export type HskTestQuestionType =
  | "match_translation"
  | "pinyin"
  | "fill_blank"
  | "sentence_order"
  | "reading"
  | "pair_matching"
  | "grammar_choice"
  | "audio_choice"
  | "tone_id";

interface BaseQuestion {
  id: string;
  level: HskTestLevel;
  difficulty: 1.0 | 1.5 | 2.0;
  skill: HskTestSkill;
}

export interface MatchTranslationQuestion extends BaseQuestion {
  type: "match_translation";
  /** Either a Hanzi or a short Chinese phrase shown in big type. */
  prompt: string;
  pinyin?: string;
  /** Russian question text, e.g. "Что означает 你好?". */
  question: string;
  options: string[];
  correct: number;
}

export interface PinyinQuestion extends BaseQuestion {
  type: "pinyin";
  prompt: string;
  question: string;
  options: string[];
  correct: number;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill_blank";
  /** Sentence with a single literal "___" marking the blank. */
  sentence: string;
  pinyin?: string;
  translation: string;
  question: string;
  options: string[];
  correct: number;
}

export interface SentenceOrderQuestion extends BaseQuestion {
  type: "sentence_order";
  /** Russian gloss the student must reconstruct. */
  translation: string;
  /** Word tiles. Renderer shuffles them. */
  tiles: string[];
  /** Indexes of `tiles` in the correct order. */
  correctOrder: number[];
}

export interface ReadingQuestion extends BaseQuestion {
  type: "reading";
  passage: string;
  passagePinyin?: string;
  question: string;
  options: string[];
  correct: number;
}

export interface PairMatchingQuestion extends BaseQuestion {
  type: "pair_matching";
  question: string;
  /** Chinese (left). */
  left: string[];
  /** Russian (right). Provided in canonical order — renderer shuffles. */
  right: string[];
}

export interface GrammarChoiceQuestion extends BaseQuestion {
  type: "grammar_choice";
  question: string;
  options: string[];
  correct: number;
}

/** Audio question — user hears a Chinese phrase via OpenAI TTS, picks the
 *  Russian translation or the matching hanzi. */
export interface AudioChoiceQuestion extends BaseQuestion {
  type: "audio_choice";
  /** Chinese text spoken via TTS. */
  audioText: string;
  /** Russian instruction shown above options. */
  question: string;
  options: string[];
  correct: number;
}

/** Tone identification — user hears a single syllable, picks tone 1..4. */
export interface ToneIdQuestion extends BaseQuestion {
  type: "tone_id";
  /** The syllable as a hanzi (e.g. "妈"). Its tone is the answer. */
  audioText: string;
  /** Pinyin without tone (e.g. "ma"). */
  syllable: string;
  /** 1 | 2 | 3 | 4 — the correct tone of `audioText`. */
  correct: 1 | 2 | 3 | 4;
}

export type HskTestQuestion =
  | MatchTranslationQuestion
  | PinyinQuestion
  | FillBlankQuestion
  | SentenceOrderQuestion
  | ReadingQuestion
  | PairMatchingQuestion
  | GrammarChoiceQuestion
  | AudioChoiceQuestion
  | ToneIdQuestion;

export type HskTestQuestionBank = Record<HskTestLevel, HskTestQuestion[]>;

export interface HskAnswer {
  questionId: string;
  correct: boolean;
  skill: HskTestSkill;
  difficulty: number;
  /** Pair matching can be partially correct. */
  partial?: number;
  /** Raw value the user picked. Kept so the runner can restore the
   *  selection when the user navigates back to a question. */
  raw?: unknown;
}

export type Verdict =
  | "exceeds"
  | "confirmed"
  | "borderline"
  | "below";

export interface HskTestResult {
  level: HskTestLevel;
  mode: HskTestMode;
  correctCount: number;
  totalCount: number;
  /** Weighted 0..1. */
  score: number;
  /** Per-skill 0..1. */
  skills: Record<HskTestSkill, number>;
  verdict: Verdict;
  recommendedLevel: HskTestLevel;
  date: string;
}
