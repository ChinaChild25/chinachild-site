"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  QuestionARenderer,
  QuestionBRenderer,
  QuestionCRenderer,
  QuestionDRenderer,
  QuestionERenderer,
  QuestionFRenderer,
} from "@/components/diagnostic/QuestionRenderers";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { confidenceProgress } from "@/lib/diagnostic/cat-engine";
import { track } from "@/lib/diagnostic/analytics";
import type { Question } from "@/lib/diagnostic/types";

const INSIGHTS: Array<{ at: number; text: string }> = [
  { at: 6, text: "Анализирую вашу скорость. Вы отвечаете на 1.4× быстрее среднего на этом уровне." },
  { at: 12, text: "Подмечено: визуальное узнавание иероглифов даётся вам легче, чем тоны. Учту в финальном разборе." },
];

export default function TestPage() {
  const router = useRouter();
  const { state, hydrated, beginTest, submitAnswer } = useDiagnostic();
  const [current, setCurrent] = useState<Question | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const askStartRef = useRef<number>(Date.now());
  const requestedRef = useRef(false);

  // Если состояние не калибровалось — отбрасываем на лендинг
  useEffect(() => {
    if (!hydrated) return;
    if (!state.calibration) {
      router.replace("/diagnostic");
    }
  }, [hydrated, state.calibration, router]);

  // Первый вопрос — синхронный вызов beginTest()
  useEffect(() => {
    if (!hydrated || requestedRef.current) return;
    if (!state.calibration) return;
    requestedRef.current = true;
    const q = beginTest();
    if (q) {
      setCurrent(q);
      askStartRef.current = Date.now();
    } else {
      router.replace("/diagnostic/analyzing");
    }
  }, [hydrated, state.calibration, beginTest, router]);

  // Insight-полоса
  useEffect(() => {
    const idx = state.engine.history.length;
    const found = INSIGHTS.find((i) => i.at === idx);
    if (found) {
      setInsight(found.text);
      const id = setTimeout(() => setInsight(null), 6500);
      return () => clearTimeout(id);
    }
  }, [state.engine.history.length]);

  const progress = useMemo(() => confidenceProgress(state.engine), [state.engine]);
  const questionNumber = state.engine.history.length + (current ? 1 : 0);

  const handleAnswer = (correct: boolean, partialScore?: number) => {
    if (!current) return;
    const ms = Date.now() - askStartRef.current;
    track({
      name: "test_question_answered",
      params: { id: current.id, type: current.type, correct, ms },
    });
    // Атомарный submitAnswer возвращает done + next одним вызовом —
    // никакой гонки между двумя setState.
    const { done, next } = submitAnswer(current, correct, ms, partialScore);
    if (done || !next) {
      router.push("/diagnostic/analyzing");
      return;
    }
    setCurrent(next);
    askStartRef.current = Date.now();
  };

  if (!hydrated || !state.calibration || !current) {
    return <main className="d-test-shell"><div className="d-small">Готовим диагностику…</div></main>;
  }

  return (
    <main className="d-test-shell">
      <div className="d-test-bar">
        <div className="d-test-progress-track">
          <div className="d-test-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="d-test-meta">
          <span>Вопрос {questionNumber} · Адаптивный режим</span>
          <div className="d-popover">
            <button
              type="button"
              className="d-test-meta-info"
              aria-label="Как работает адаптивный режим"
              onClick={() => setPopoverOpen((p) => !p)}
            >
              Что это значит?
            </button>
            {popoverOpen && (
              <div className="d-popover-content" role="dialog">
                Тест адаптируется к вашим ответам. После каждого вопроса алгоритм
                уточняет вашу оценку и подбирает следующий — сложнее или проще.
                Закончится, когда модель уверена в результате.
              </div>
            )}
          </div>
        </div>
        {insight && (
          <div className="d-test-insight" role="status" aria-live="polite">
            <svg className="d-test-insight-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z" />
            </svg>
            <span>{insight}</span>
          </div>
        )}
      </div>

      <div className="d-test-card" key={current.id}>
        {renderQuestion(current, handleAnswer)}
      </div>
    </main>
  );
}

function renderQuestion(q: Question, onAnswer: (correct: boolean, partialScore?: number) => void) {
  switch (q.type) {
    case "A": return <QuestionARenderer question={q} onAnswer={onAnswer} />;
    case "B": return <QuestionBRenderer question={q} onAnswer={onAnswer} />;
    case "C": return <QuestionCRenderer question={q} onAnswer={onAnswer} />;
    case "D": return <QuestionDRenderer question={q} onAnswer={onAnswer} />;
    case "E": return <QuestionERenderer question={q} onAnswer={onAnswer} />;
    case "F": return <QuestionFRenderer question={q} onAnswer={onAnswer} />;
  }
}
