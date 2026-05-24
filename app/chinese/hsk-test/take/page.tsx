"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import QuestionRenderer from "@/components/hsk-test/QuestionRenderer";
import { useHskTest } from "@/lib/hsk-test/state";
import { HskTestGoals } from "@/lib/hsk-test/analytics";

export default function HskTestTakePage() {
  const router = useRouter();
  const { state, hydrated, answer, getCurrentAnswer, next, back, finish, reset } =
    useHskTest();

  // Hydration guard — wait for localStorage rehydrate before redirecting.
  useEffect(() => {
    if (!hydrated) return;
    if (!state.level || !state.mode || state.questions.length === 0) {
      router.replace("/chinese/hsk-test");
    }
  }, [hydrated, state.level, state.mode, state.questions.length, router]);

  if (!state.level || !state.mode || state.questions.length === 0) {
    return (
      <main className="hsk-test-runner-shell">
        <div className="hsk-test-runner-card">
          <p className="text-[#6b6b6b]">Готовим тест…</p>
        </div>
      </main>
    );
  }

  const question = state.questions[state.index];
  const total = state.questions.length;
  const isLast = state.index === total - 1;
  const isFirst = state.index === 0;
  const progress = ((state.index + 1) / total) * 100;
  const currentAnswer = getCurrentAnswer();
  const hasAnswer = Boolean(currentAnswer);
  const initialValue = currentAnswer?.raw;

  const goNext = () => {
    if (currentAnswer) {
      HskTestGoals.answered(state.level!, question.id, currentAnswer.correct);
    }
    if (isLast) {
      const ok = finish();
      if (ok) router.push("/chinese/hsk-test/result");
      return;
    }
    next();
  };

  const goBack = () => {
    if (isFirst) return;
    back();
  };

  const exit = () => {
    if (
      window.confirm("Выйти из теста? Прогресс этого прохождения не сохранится.")
    ) {
      reset();
      router.push("/chinese/hsk-test");
    }
  };

  return (
    <main className="hsk-test-runner-shell">
      <div className="hsk-test-runner-card">
        <div className="hsk-test-runner-header">
          <div className="hsk-test-progress" aria-hidden>
            <div
              className="hsk-test-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="hsk-test-progress-label">
            Вопрос {state.index + 1} из {total}
          </span>
          <button type="button" className="hsk-test-exit" onClick={exit}>
            Выйти
          </button>
        </div>

        <QuestionRenderer
          key={question.id}
          question={question}
          initial={initialValue}
          onAnswer={(value) => answer(value)}
        />

        <div className="hsk-test-runner-footer">
          <button
            type="button"
            className="hsk-test-back"
            onClick={goBack}
            disabled={isFirst}
          >
            ← Назад
          </button>
          <button
            type="button"
            className="hsk-test-next"
            onClick={goNext}
            disabled={!hasAnswer}
          >
            {isLast ? "Узнать результат" : "Далее →"}
          </button>
        </div>

        <p className="hsk-test-runner-meta">
          HSK {state.level} ·{" "}
          {state.mode === "express"
            ? "Экспресс"
            : state.mode === "adaptive"
              ? "Адаптивный"
              : "Полный"}{" "}
          тест ·{" "}
          <Link href="/chinese/hsk-test" className="underline">
            Все уровни
          </Link>
        </p>
      </div>
    </main>
  );
}

