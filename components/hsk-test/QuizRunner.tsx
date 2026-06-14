"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import QuestionRenderer from "@/components/hsk-test/QuestionRenderer";
import TestArt from "@/components/hsk-test/TestArt";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import {
  buildSections,
  FINAL_COPY,
  INTRO_COPY,
  SECTION_COPY,
} from "@/lib/hsk-test/quiz-sections";
import { useHskTest } from "@/lib/hsk-test/state";

/**
 * Immersive HSK-test runner — a full-viewport overlay (own top bar + fixed
 * bottom nav) that covers the site chrome, mirroring the Praktikum quiz box.
 *
 * The flow is a flat list of "screens" derived from the section model:
 *   intro → [section interstitial, …questions] per skill → final
 * Navigation is a local cursor (`pos`); answers are recorded by question id, so
 * the reducer's index machinery is untouched.
 *
 * The page (`/chinese/hsk-test/take`) guarantees a started test before mounting
 * this, so `state.questions` is non-empty here.
 */

type Screen =
  | { kind: "intro" }
  | { kind: "section"; sectionIndex: number }
  | { kind: "question"; qIndex: number; sectionIndex: number }
  | { kind: "final" };

export default function QuizRunner() {
  const router = useRouter();
  const { state, recordAnswer, finish, reset } = useHskTest();
  const [pos, setPos] = useState(0);
  const [consent, setConsent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const level = state.level!;
  const questions = state.questions;
  const total = questions.length;

  const sections = useMemo(() => buildSections(questions), [questions]);

  const screens = useMemo<Screen[]>(() => {
    const list: Screen[] = [{ kind: "intro" }];
    sections.forEach((sec, sectionIndex) => {
      list.push({ kind: "section", sectionIndex });
      sec.qIndexes.forEach((qIndex) =>
        list.push({ kind: "question", qIndex, sectionIndex }),
      );
    });
    list.push({ kind: "final" });
    return list;
  }, [sections]);

  // Lock body scroll while the overlay is mounted.
  useEffect(() => {
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, []);

  // Scroll the stage back to top on every screen change.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pos]);

  const answered = useMemo(
    () => new Set(state.answers.map((a) => a.questionId)),
    [state.answers],
  );

  const screen = screens[pos] ?? screens[0];
  const isFirst = pos === 0;

  const currentQuestion =
    screen.kind === "question" ? questions[screen.qIndex] : null;
  const currentAnswer = currentQuestion
    ? state.answers.find((a) => a.questionId === currentQuestion.id)
    : undefined;
  const canAdvance = screen.kind === "question" ? Boolean(currentAnswer) : true;

  const goForward = () => {
    if (screen.kind === "question") {
      if (!currentAnswer) return;
      HskTestGoals.answered(level, currentQuestion!.id, currentAnswer.correct);
    }
    if (screen.kind === "final") {
      const ok = finish();
      if (ok) router.push("/chinese/hsk-test/result");
      return;
    }
    setPos((p) => Math.min(p + 1, screens.length - 1));
  };

  const goBack = () => {
    if (isFirst) return;
    setPos((p) => Math.max(0, p - 1));
  };

  const exit = () => {
    if (
      window.confirm("Выйти из теста? Прогресс этого прохождения не сохранится.")
    ) {
      reset();
      router.push("/chinese/hsk-test");
    }
  };

  const nextLabel =
    screen.kind === "intro"
      ? INTRO_COPY.cta
      : screen.kind === "final"
        ? FINAL_COPY.cta
        : screen.kind === "section"
          ? "Продолжить"
          : "Дальше";

  const progressLabel = (() => {
    if (screen.kind === "intro") return "Интро";
    if (screen.kind === "final") return "Финал";
    const skill = sections[screen.sectionIndex].skill;
    const label = SECTION_COPY[skill].label;
    if (screen.kind === "section") return label;
    return `${label} · Вопрос ${screen.qIndex + 1} из ${total}`;
  })();

  return (
    <div className="hsk-quiz" data-screen={screen.kind}>
      <header className="hsk-quiz-top">
        <Link href="/" className="hsk-quiz-brand" aria-label="ChinaChild — на главную">
          ChinaChild
        </Link>
        <div className="hsk-quiz-tabs" aria-hidden>
          <span className="hsk-quiz-tab hsk-quiz-tab-live">Тест</span>
          <span className="hsk-quiz-tab">HSK {level}</span>
        </div>
        <button
          type="button"
          className="hsk-quiz-close"
          onClick={exit}
          aria-label="Выйти из теста"
        >
          ✕
        </button>
      </header>

      <div className="hsk-quiz-stage" ref={scrollRef}>
        <div className="hsk-quiz-card" data-kind={screen.kind}>
          {screen.kind === "intro" && (
            <div className="hsk-quiz-screen">
              <TestArt name={INTRO_COPY.art} glyph="你" className="hsk-quiz-art" />
              <p className="hsk-quiz-eyebrow">{INTRO_COPY.eyebrow}</p>
              <h1 className="hsk-quiz-title">{INTRO_COPY.title}</h1>
              <p className="hsk-quiz-body">{INTRO_COPY.body}</p>
              <label className="hsk-quiz-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>{INTRO_COPY.consent}</span>
              </label>
            </div>
          )}

          {screen.kind === "section" &&
            (() => {
              const skill = sections[screen.sectionIndex].skill;
              const copy = SECTION_COPY[skill];
              return (
                <div className="hsk-quiz-screen">
                  <TestArt name={copy.art} glyph="学" className="hsk-quiz-art" />
                  <p className="hsk-quiz-eyebrow">
                    Блок {screen.sectionIndex + 1} из {sections.length} ·{" "}
                    {copy.label}
                  </p>
                  <h2 className="hsk-quiz-title">{copy.title}</h2>
                  <p className="hsk-quiz-body">{copy.body}</p>
                </div>
              );
            })()}

          {screen.kind === "question" && currentQuestion && (
            <QuestionRenderer
              key={currentQuestion.id}
              question={currentQuestion}
              initial={currentAnswer?.raw}
              onAnswer={(value) => recordAnswer(currentQuestion.id, value)}
            />
          )}

          {screen.kind === "final" && (
            <div className="hsk-quiz-screen">
              <TestArt name={FINAL_COPY.art} glyph="题" className="hsk-quiz-art" />
              <h2 className="hsk-quiz-title">{FINAL_COPY.title}</h2>
              <p className="hsk-quiz-body">{FINAL_COPY.body}</p>
            </div>
          )}
        </div>
      </div>

      <footer className="hsk-quiz-bottom">
        <button
          type="button"
          className="hsk-quiz-back"
          onClick={goBack}
          disabled={isFirst}
        >
          Назад
        </button>

        <div className="hsk-quiz-progress" aria-hidden>
          <span className="hsk-quiz-progress-pill">{progressLabel}</span>
          <div className="hsk-quiz-segments">
            {sections.map((sec, i) => {
              const done = sec.qIndexes.filter((qi) =>
                answered.has(questions[qi].id),
              ).length;
              const fill = sec.qIndexes.length
                ? Math.round((done / sec.qIndexes.length) * 100)
                : 0;
              return (
                <span className="hsk-quiz-segment" key={i}>
                  <span
                    className="hsk-quiz-segment-fill"
                    style={{ width: `${fill}%` }}
                  />
                </span>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="hsk-quiz-next"
          onClick={goForward}
          disabled={!canAdvance}
        >
          {nextLabel}
        </button>
      </footer>
    </div>
  );
}
