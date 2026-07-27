"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AudioChoiceQuestion,
  FillBlankQuestion,
  GrammarChoiceQuestion,
  HskTestQuestion,
  MatchTranslationQuestion,
  PairMatchingQuestion,
  PinyinQuestion,
  ReadingQuestion,
  SentenceOrderQuestion,
  ToneIdQuestion,
} from "@/lib/hsk-test/types";
import { getStoredTestAudioUrl } from "@/lib/content/stored-test-audio";

interface RendererProps<Q extends HskTestQuestion> {
  question: Q;
  /** Previously stored answer (for "back" navigation). */
  initial?: unknown;
  /** Called whenever the user picks/changes their answer. */
  onAnswer: (value: unknown) => void;
}

export default function QuestionRenderer({
  question,
  initial,
  onAnswer,
}: {
  question: HskTestQuestion;
  initial?: unknown;
  onAnswer: (value: unknown) => void;
}) {
  switch (question.type) {
    case "match_translation":
      return (
        <MatchTranslationRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "pinyin":
      return (
        <PinyinRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "fill_blank":
      return (
        <FillBlankRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "sentence_order":
      return (
        <SentenceOrderRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "reading":
      return (
        <ReadingRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "pair_matching":
      return (
        <PairMatchingRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "grammar_choice":
      return (
        <GrammarChoiceRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "audio_choice":
      return (
        <AudioChoiceRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
    case "tone_id":
      return (
        <ToneIdRenderer
          question={question}
          initial={initial}
          onAnswer={onAnswer}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Shared multiple-choice block.
// ---------------------------------------------------------------------------

function ChoiceList({
  options,
  selected,
  onPick,
  ariaLabel,
}: {
  options: string[];
  selected: number | null;
  onPick: (index: number) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="hsk-test-choices">
      {options.map((option, index) => {
        const isSelected = selected === index;
        return (
          <button
            key={`${option}-${index}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onPick(index)}
            className={
              "hsk-test-choice" + (isSelected ? " hsk-test-choice-active" : "")
            }
          >
            <span className="hsk-test-choice-marker" aria-hidden>
              {String.fromCharCode(65 + index)}
            </span>
            <span className="hsk-test-choice-text">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// match_translation / pinyin / grammar_choice — they all share the same UI.
// ---------------------------------------------------------------------------

function MatchTranslationRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<MatchTranslationQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <div className="hsk-test-hanzi">{question.prompt}</div>
      {question.pinyin ? (
        <div className="hsk-test-pinyin">{question.pinyin}</div>
      ) : null}
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

function PinyinRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<PinyinQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <div className="hsk-test-hanzi">{question.prompt}</div>
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

function GrammarChoiceRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<GrammarChoiceQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// fill_blank — sentence shown above choices, options small.
// ---------------------------------------------------------------------------

function FillBlankRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<FillBlankQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <div className="hsk-test-sentence">{question.sentence}</div>
      {question.pinyin ? (
        <div className="hsk-test-pinyin">{question.pinyin}</div>
      ) : null}
      <div className="hsk-test-translation">{question.translation}</div>
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// reading — passage + standard choice list.
// ---------------------------------------------------------------------------

function ReadingRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<ReadingQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <div className="hsk-test-passage">{question.passage}</div>
      {question.passagePinyin ? (
        <div className="hsk-test-pinyin hsk-test-pinyin-passage">
          {question.passagePinyin}
        </div>
      ) : null}
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// sentence_order — clickable tiles. We use a "click to add / click to remove"
// pattern that works for both desktop and touch without drag-and-drop libs.
// ---------------------------------------------------------------------------

function SentenceOrderRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<SentenceOrderQuestion>) {
  const shuffled = useMemo(
    () => shuffleStable(question.tiles.map((_, i) => i), question.id),
    [question.id, question.tiles],
  );

  const [order, setOrder] = useState<number[]>(
    Array.isArray(initial) && initial.every((v) => typeof v === "number")
      ? (initial as number[])
      : [],
  );

  useEffect(() => {
    setOrder(
      Array.isArray(initial) && initial.every((v) => typeof v === "number")
        ? (initial as number[])
        : [],
    );
  }, [question.id, initial]);

  const available = shuffled.filter((idx) => !order.includes(idx));

  const submit = (next: number[]) => {
    setOrder(next);
    onAnswer(next);
  };

  return (
    <div className="hsk-test-stack">
      <div className="hsk-test-translation hsk-test-translation-large">
        {question.translation}
      </div>
      <h2 className="hsk-test-question">
        Соберите китайское предложение в правильном порядке
      </h2>
      <div className="hsk-test-order-area">
        {order.length === 0 ? (
          <span className="hsk-test-order-placeholder">
            Нажмите слова ниже, чтобы выстроить фразу
          </span>
        ) : (
          order.map((tileIdx, pos) => (
            <button
              key={`${tileIdx}-${pos}`}
              type="button"
              className="hsk-test-tile hsk-test-tile-active"
              onClick={() => submit(order.filter((_, p) => p !== pos))}
            >
              {question.tiles[tileIdx]}
            </button>
          ))
        )}
      </div>
      <div className="hsk-test-order-pool">
        {available.map((tileIdx) => (
          <button
            key={tileIdx}
            type="button"
            className="hsk-test-tile"
            onClick={() => submit([...order, tileIdx])}
          >
            {question.tiles[tileIdx]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// pair_matching — left column fixed, right column reorderable via pick.
// Each "left" item has a dropdown-like picker showing the remaining right
// options. No drag-and-drop dependency.
// ---------------------------------------------------------------------------

function PairMatchingRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<PairMatchingQuestion>) {
  const shuffledRight = useMemo(
    () => shuffleStable(question.right.map((_, i) => i), question.id),
    [question.id, question.right],
  );

  // assignments[i] = index into the original `right` array assigned to left[i],
  // or -1 if not assigned yet.
  const [assignments, setAssignments] = useState<number[]>(
    Array.isArray(initial) &&
      initial.length === question.left.length &&
      initial.every((v) => typeof v === "number")
      ? (initial as number[])
      : new Array(question.left.length).fill(-1),
  );

  useEffect(() => {
    setAssignments(
      Array.isArray(initial) &&
        initial.length === question.left.length &&
        initial.every((v) => typeof v === "number")
        ? (initial as number[])
        : new Array(question.left.length).fill(-1),
    );
  }, [question.id, initial, question.left.length]);

  const used = new Set(assignments.filter((v) => v >= 0));

  const set = (leftIdx: number, rightIdx: number) => {
    const next = assignments.slice();
    // Remove rightIdx from any previous spot.
    for (let i = 0; i < next.length; i++) {
      if (next[i] === rightIdx) next[i] = -1;
    }
    next[leftIdx] = rightIdx;
    setAssignments(next);
    onAnswer(next);
  };

  return (
    <div className="hsk-test-stack">
      <h2 className="hsk-test-question">{question.question}</h2>
      <div className="hsk-test-pairs">
        {question.left.map((leftItem, leftIdx) => {
          const currentRight = assignments[leftIdx];
          return (
            <div className="hsk-test-pair-row" key={leftItem}>
              <div className="hsk-test-pair-left">{leftItem}</div>
              <div className="hsk-test-pair-right">
                {shuffledRight.map((rightIdx) => {
                  const disabled =
                    used.has(rightIdx) && currentRight !== rightIdx;
                  const active = currentRight === rightIdx;
                  return (
                    <button
                      key={rightIdx}
                      type="button"
                      className={
                        "hsk-test-pair-option" +
                        (active ? " hsk-test-pair-option-active" : "") +
                        (disabled ? " hsk-test-pair-option-disabled" : "")
                      }
                      onClick={() => !disabled && set(leftIdx, rightIdx)}
                      aria-pressed={active}
                      disabled={disabled}
                    >
                      {question.right[rightIdx]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audio renderers — all clips are generated ahead of time with OpenAI TTS and
// served directly from public Supabase Storage. Playback never calls OpenAI.
// ---------------------------------------------------------------------------

function AudioPlayer({ text }: { text: string }) {
  const src = getStoredTestAudioUrl(text);
  const [unavailable, setUnavailable] = useState(!src);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setUnavailable(!src);
  }, [src, text]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => setUnavailable(true));
  };

  const ready = Boolean(src) && !unavailable;

  return (
    <div className="hsk-test-audio">
      <button
        type="button"
        className="hsk-test-audio-btn"
        onClick={play}
        disabled={!ready}
        aria-label="Воспроизвести аудио"
      >
        <svg
          aria-hidden
          width="22"
          height="22"
          viewBox="0 0 22 22"
          focusable="false"
        >
          <path d="M6 5 L6 17 L17 11 Z" fill="currentColor" />
        </svg>
        <span>
          {unavailable ? "Аудио недоступно" : "Прослушать"}
        </span>
      </button>
      {src ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onError={() => setUnavailable(true)}
        />
      ) : null}
    </div>
  );
}

function AudioChoiceRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<AudioChoiceQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  return (
    <div className="hsk-test-stack">
      <AudioPlayer text={question.audioText} />
      <h2 className="hsk-test-question">{question.question}</h2>
      <ChoiceList
        ariaLabel={question.question}
        options={question.options}
        selected={selected}
        onPick={(i) => {
          setSelected(i);
          onAnswer(i);
        }}
      />
    </div>
  );
}

function ToneIdRenderer({
  question,
  initial,
  onAnswer,
}: RendererProps<ToneIdQuestion>) {
  const [selected, setSelected] = useState<number | null>(
    typeof initial === "number" ? initial : null,
  );
  useEffect(() => {
    setSelected(typeof initial === "number" ? initial : null);
  }, [question.id, initial]);

  const TONES: { value: 1 | 2 | 3 | 4; label: string }[] = [
    { value: 1, label: "1-й тон (ровный, mā)" },
    { value: 2, label: "2-й тон (восходящий, má)" },
    { value: 3, label: "3-й тон (нисходяще-восходящий, mǎ)" },
    { value: 4, label: "4-й тон (нисходящий, mà)" },
  ];

  return (
    <div className="hsk-test-stack">
      <AudioPlayer text={question.audioText} />
      <div className="hsk-test-translation">
        Слог: <strong>{question.syllable}</strong>
      </div>
      <h2 className="hsk-test-question">
        Какой тон вы услышали?
      </h2>
      <div role="radiogroup" aria-label="Выберите тон" className="hsk-test-choices">
        {TONES.map((tone) => {
          const isSelected = selected === tone.value;
          return (
            <button
              key={tone.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setSelected(tone.value);
                onAnswer(tone.value);
              }}
              className={
                "hsk-test-choice" + (isSelected ? " hsk-test-choice-active" : "")
              }
            >
              <span className="hsk-test-choice-marker" aria-hidden>
                {tone.value}
              </span>
              <span className="hsk-test-choice-text">{tone.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deterministic shuffle so the same question shows the same tile order on a
// "back" navigation. Seeds off the question id.
// ---------------------------------------------------------------------------
function shuffleStable<T>(items: T[], seedStr: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const next = () => {
    h += 0x6d2b79f5;
    let r = Math.imul(h ^ (h >>> 15), 1 | h);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
