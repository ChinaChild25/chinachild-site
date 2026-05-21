"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HanziStroke from "@/components/diagnostic/HanziStroke";
import RadarChart from "@/components/diagnostic/RadarChart";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { track } from "@/lib/diagnostic/analytics";

const PREVIEW_SKILLS = {
  hanzi: 78,
  tones: 52,
  grammar: 60,
  reading: 70,
  speed: 65,
  listening: 58,
};

export default function DiagnosticLandingPage() {
  const router = useRouter();
  const { state, hydrated, reset, start } = useDiagnostic();

  // Если результат уже есть (юзер прошёл и вернулся) — предложим продолжить
  const hasResult = hydrated && state.result;

  useEffect(() => {
    // Засчитываем view-as-impression один раз
    track({ name: "diagnostic_started" });
    // НЕ создаём событие старта теста — для этого есть Calibration page
  }, []);

  const beginNew = () => {
    reset();
    start();
    router.push("/diagnostic/calibration");
  };

  return (
    <main className="d-shell">
      <section className="d-landing-grid">
        <div>
          <div className="d-landing-hanzi">
            <HanziStroke hanzi="你" size={220} loop delay={300} />
          </div>

          <h1 className="d-h1 d-fade-in d-fade-in-delay-1">
            Узнайте, какой&nbsp;вы китаист
          </h1>

          <p className="d-lead d-fade-in d-fade-in-delay-2" style={{ marginTop: 24, maxWidth: 520 }}>
            Семиминутная AI-диагностика построит ваш персональный портрет владения
            китайским: уровень HSK, сильные и слабые стороны, время до беглости.
          </p>

          <div className="d-cta-row d-fade-in d-fade-in-delay-3">
            {hasResult ? (
              <>
                <Link href="/diagnostic/result" className="d-btn">
                  Посмотреть мой результат
                </Link>
                <button type="button" className="d-btn d-btn-secondary" onClick={beginNew}>
                  Пройти заново
                </button>
              </>
            ) : (
              <button type="button" className="d-btn" onClick={beginNew}>
                Начать диагностику · 7 минут
              </button>
            )}
          </div>

          <Link
            href="/courses"
            className="d-btn-ghost"
            style={{ marginTop: 10, display: "inline-flex" }}
          >
            Уже знаете уровень? Перейти к курсам →
          </Link>

          <ul className="d-feature-list">
            <li>
              <span className="d-feature-mark" aria-hidden>·</span>
              Адаптивный тест: 18–22 вопроса вместо 100 — алгоритм подбирает
              сложность под ваши ответы в реальном времени
            </li>
            <li>
              <span className="d-feature-mark" aria-hidden>·</span>
              Шесть типов заданий: иероглифы, тоны, грамматика, чтение,
              распознавание речи и порядок черт
            </li>
            <li>
              <span className="d-feature-mark" aria-hidden>·</span>
              Финальный разбор от GPT-4o — что подтянуть и сколько времени
              займёт следующий уровень
            </li>
          </ul>

          <div className="d-social-proof">
            <span>Лицензированная школа · Департамент образования Москвы</span>
            <span aria-hidden>·</span>
            <span>Преподаватели с дипломами ЮФУ и ДГТУ</span>
          </div>
        </div>

        <PreviewCard />
      </section>
    </main>
  );
}

function PreviewCard() {
  return (
    <div className="d-preview-card d-fade-in d-fade-in-delay-4" aria-hidden>
      <span className="d-preview-tag">Ваш профиль</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="d-zh" style={{ fontSize: "2.4rem", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em" }}>
          图形猎手
        </div>
        <div style={{ fontSize: "1rem", color: "var(--d-muted)" }}>
          Например, «Охотник за иероглифами» · HSK 3
        </div>
      </div>
      <p className="d-small" style={{ marginTop: 14 }}>
        Узнаёт иероглифы быстрее, чем 73% изучающих ваш уровень, но тоны пока даются сложнее.
      </p>
      <div style={{ marginTop: 18 }}>
        <RadarChart skills={PREVIEW_SKILLS} size={300} />
      </div>
    </div>
  );
}
