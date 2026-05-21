"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Question,
  QuestionA,
  QuestionB,
  QuestionC,
  QuestionD,
  QuestionE,
  QuestionF,
} from "@/lib/diagnostic/types";
import HanziStroke from "./HanziStroke";
import ToneArc from "./ToneArc";

// =============================================================================
// Общий контракт: каждый рендерер вызывает onAnswer(correct, score?)
// корректно один раз на вопрос. Родитель обнуляет компонент через key.
// =============================================================================

export interface QuestionRendererProps<Q extends Question> {
  question: Q;
  onAnswer: (correct: boolean, partialScore?: number) => void;
}

// ---------- Type A: Recognition (иероглиф → значение) -----------------------

export function QuestionARenderer({ question, onAnswer }: QuestionRendererProps<QuestionA>) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="d-fade-in">
      <div className="d-hanzi-display d-zh">{question.hanzi}</div>
      <div className="d-pinyin-display">{question.pinyin}</div>
      <div className="d-options-grid" style={{ marginTop: 36 }}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="d-option"
            data-selected={selected === i || undefined}
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      <ActionRow
        disabled={selected === null}
        onSubmit={() => selected !== null && onAnswer(selected === question.correctIndex)}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

// ---------- Type B: Tone identification ------------------------------------

export function QuestionBRenderer({ question, onAnswer }: QuestionRendererProps<QuestionB>) {
  const [selected, setSelected] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const speak = () => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(question.hanzi);
    utter.lang = "zh-CN";
    utter.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="d-fade-in">
      <p className="d-small" style={{ textAlign: "center" }}>Какой тон в этом слове?</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "12px 0 24px" }}>
        <div style={{ fontSize: "4rem", lineHeight: 1 }} className="d-zh">{question.hanzi}</div>
        <div style={{ fontSize: "1.5rem", color: "var(--d-muted)" }}>{question.syllable}?</div>
        <button
          type="button"
          className="d-btn-ghost"
          onClick={speak}
          aria-label="Прослушать произношение"
          style={{ border: "1px solid var(--d-line-strong)", borderRadius: 12, padding: "10px 14px" }}
        >
          <Icon name="sound" />
        </button>
      </div>
      <div className="d-tone-grid">
        {([1, 2, 3, 4, 5] as const).map((t) => (
          <button
            key={t}
            type="button"
            className="d-tone-btn"
            data-selected={selected === t || undefined}
            onClick={() => setSelected(t)}
          >
            <ToneArc tone={t} />
            <span className="d-tone-label">{toneLabel(t)}</span>
          </button>
        ))}
      </div>
      <ActionRow
        disabled={selected === null}
        onSubmit={() => selected !== null && onAnswer(selected === question.correctTone)}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

function toneLabel(t: 1 | 2 | 3 | 4 | 5): string {
  if (t === 5) return "·";
  return String(t);
}

// ---------- Type C: Speaking (Web Speech Recognition + GPT-4o eval) --------

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function QuestionCRenderer({ question, onAnswer }: QuestionRendererProps<QuestionC>) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "zh-CN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      setTranscript(text);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch { /* noop */ }
    };
  }, []);

  const startListen = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setVerdict(null);
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  };

  const submit = async () => {
    if (!transcript) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/speech-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedHanzi: question.hanzi,
          expectedPinyin: question.pinyin,
          transcript,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        eval?: { score: number; verdict: "native" | "understandable" | "needs-work"; note: string };
      };
      const evalRes = data.eval ?? { score: 0.3, verdict: "needs-work" as const, note: "" };
      setVerdict(humanizeVerdict(evalRes.verdict));
      const correct = evalRes.score >= 0.6;
      // короткая пауза для драматургии
      await new Promise((r) => setTimeout(r, 600));
      onAnswer(correct, evalRes.score);
    } catch {
      // на ошибку — отдаём ответ как неверный, но без скоринга
      onAnswer(false, 0.2);
    } finally {
      setEvaluating(false);
    }
  };

  if (!supported) {
    return (
      <div className="d-fade-in" style={{ textAlign: "center" }}>
        <p className="d-lead" style={{ marginBottom: 20 }}>
          Ваш браузер не поддерживает распознавание речи. Пропустите этот вопрос — мы учтём это при оценке.
        </p>
        <button
          type="button"
          className="d-btn d-btn-compact"
          onClick={() => onAnswer(false, 0.5)}
        >
          Пропустить
        </button>
      </div>
    );
  }

  return (
    <div className="d-fade-in" style={{ display: "grid", gap: 28 }}>
      <div style={{ textAlign: "center" }}>
        <p className="d-small">Произнесите слово вслух</p>
        <div className="d-hanzi-display d-zh" style={{ fontSize: "5rem", marginTop: 12 }}>{question.hanzi}</div>
        <div className="d-pinyin-display" style={{ marginTop: 8 }}>{question.pinyin}</div>
        <div className="d-small" style={{ marginTop: 6 }}>{question.translation}</div>
      </div>

      <button
        type="button"
        className="d-mic-btn"
        data-listening={listening || undefined}
        onClick={startListen}
        disabled={evaluating}
        aria-label={listening ? "Говорите" : "Записать произношение"}
      >
        <Icon name="mic" />
      </button>

      <div className="d-mic-transcript d-zh">
        {evaluating ? "Анализирую…" : verdict ?? (transcript || (listening ? "Говорите…" : "Нажмите, чтобы записать"))}
      </div>

      <ActionRow
        disabled={!transcript || evaluating}
        primaryLabel="Оценить"
        onSubmit={submit}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

function humanizeVerdict(v: "native" | "understandable" | "needs-work"): string {
  if (v === "native") return "Близко к носителю";
  if (v === "understandable") return "Понятно, с лёгким акцентом";
  return "Над тонами стоит поработать";
}

// ---------- Type D: Sentence construction ----------------------------------

export function QuestionDRenderer({ question, onAnswer }: QuestionRendererProps<QuestionD>) {
  const shuffled = useMemo(() => {
    // Детерминированная перестановка по id вопроса
    const idx = question.tiles.map((_, i) => i);
    const seed = hashCode(question.id);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = (seed + i * 1103515245) % (i + 1);
      const k = j < 0 ? j + i + 1 : j;
      [idx[i], idx[k]] = [idx[k], idx[i]];
    }
    return idx;
  }, [question.id, question.tiles]);

  const [picked, setPicked] = useState<number[]>([]); // tile original indices

  const togglePick = (origIdx: number) => {
    setPicked((prev) =>
      prev.includes(origIdx) ? prev.filter((i) => i !== origIdx) : [...prev, origIdx],
    );
  };

  const reset = () => setPicked([]);

  const correct =
    picked.length === question.correctOrder.length &&
    picked.every((v, i) => v === question.correctOrder[i]);

  return (
    <div className="d-fade-in" style={{ display: "grid", gap: 22 }}>
      <p className="d-lead" style={{ textAlign: "center" }}>{question.translation}</p>

      <div className="d-tile-slot">
        {picked.length === 0 ? (
          <span className="d-small">Кликайте по плиткам, чтобы составить предложение</span>
        ) : (
          picked.map((origIdx, i) => (
            <button
              key={`pick-${origIdx}-${i}`}
              type="button"
              className="d-tile"
              onClick={() => setPicked(picked.slice(0, i).concat(picked.slice(i + 1)))}
            >
              <span className="d-tile-hanzi d-zh">{question.tiles[origIdx].hanzi}</span>
              <span className="d-tile-pinyin">{question.tiles[origIdx].pinyin}</span>
            </button>
          ))
        )}
      </div>

      <div className="d-tile-bank">
        {shuffled.map((origIdx) => (
          <button
            key={`bank-${origIdx}`}
            type="button"
            className="d-tile"
            data-used={picked.includes(origIdx) || undefined}
            onClick={() => togglePick(origIdx)}
          >
            <span className="d-tile-hanzi d-zh">{question.tiles[origIdx].hanzi}</span>
            <span className="d-tile-pinyin">{question.tiles[origIdx].pinyin}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button type="button" className="d-btn-ghost" onClick={reset}>Сбросить</button>
      </div>

      <ActionRow
        disabled={picked.length !== question.tiles.length}
        onSubmit={() => onAnswer(correct)}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ---------- Type E: Reading -------------------------------------------------

export function QuestionERenderer({ question, onAnswer }: QuestionRendererProps<QuestionE>) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="d-fade-in" style={{ display: "grid", gap: 22 }}>
      <div className="d-passage">{question.passage}</div>
      <p className="d-lead">{question.question}</p>
      <div className="d-options-grid">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="d-option"
            data-selected={selected === i || undefined}
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      <ActionRow
        disabled={selected === null}
        onSubmit={() => selected !== null && onAnswer(selected === question.correctIndex)}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

// ---------- Type F: Stroke order (yes/no) ----------------------------------

export function QuestionFRenderer({ question, onAnswer }: QuestionRendererProps<QuestionF>) {
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);
  // anim key — анимация запускается на каждом монтировании
  return (
    <div className="d-fade-in" style={{ display: "grid", gap: 22 }}>
      <p className="d-lead" style={{ textAlign: "center" }}>
        Посмотрите, в каком порядке рисуются черты. Это правильный порядок?
      </p>
      <div style={{ width: 220, height: 220, margin: "0 auto" }}>
        <HanziStroke
          hanzi={question.hanzi}
          size={220}
          shuffled={!question.correctOrder}
          delay={260}
        />
      </div>
      <div className="d-yesno-grid">
        <button
          type="button"
          className="d-yesno-btn"
          data-selected={selected === "yes" || undefined}
          onClick={() => setSelected("yes")}
        >
          Правильный порядок
        </button>
        <button
          type="button"
          className="d-yesno-btn"
          data-selected={selected === "no" || undefined}
          onClick={() => setSelected("no")}
        >
          Порядок нарушен
        </button>
      </div>
      <ActionRow
        disabled={selected === null}
        onSubmit={() => {
          if (selected === null) return;
          const userSaysCorrect = selected === "yes";
          onAnswer(userSaysCorrect === question.correctOrder);
        }}
        onSkip={() => onAnswer(false, 0)}
      />
    </div>
  );
}

// ---------- Shared action row -----------------------------------------------

function ActionRow({
  disabled,
  primaryLabel = "Ответить",
  onSubmit,
  onSkip,
}: {
  disabled: boolean;
  primaryLabel?: string;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="d-test-actions">
      <button
        type="button"
        className="d-btn d-btn-block"
        onClick={onSubmit}
        disabled={disabled}
      >
        {primaryLabel}
      </button>
      <button type="button" className="d-skip" onClick={onSkip}>
        Не знаю
      </button>
    </div>
  );
}

// ---------- Icon set --------------------------------------------------------

function Icon({ name }: { name: "sound" | "mic" }) {
  if (name === "sound") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 L6 9 H2 v6 h4 l5 4 V5z" />
        <path d="M19 5 a 9 9 0 0 1 0 14" />
        <path d="M15.5 8.5 a 5 5 0 0 1 0 7" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11 a 7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}
