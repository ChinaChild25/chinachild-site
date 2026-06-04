"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import Certificate from "@/components/hsk-test/Certificate";
import PrintableCertificate from "@/components/hsk-test/PrintableCertificate";
import ShareResultButtons from "@/components/hsk-test/ShareResultButtons";
import SkillBars from "@/components/hsk-test/SkillBars";
import HskTestLeadInline from "@/components/hsk-test/HskTestLeadInline";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import { getHskTestLevel } from "@/lib/hsk-test/levels";
import { verdictCopy } from "@/lib/hsk-test/scoring";
import { useHskTest } from "@/lib/hsk-test/state";
import { SITE_URL } from "@/lib/site-config";

export default function HskTestResultPage() {
  const router = useRouter();
  const { state, hydrated, reset, setName } = useHskTest();
  const [tracked, setTracked] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Redirect to landing if there's no result to show.
  useEffect(() => {
    if (!hydrated) return;
    if (!state.result) {
      router.replace("/chinese/hsk-test");
    }
  }, [hydrated, state.result, router]);

  // Fire the "completed" goal exactly once after hydration.
  useEffect(() => {
    if (!state.result || tracked) return;
    HskTestGoals.completed(
      state.result.level,
      state.result.mode,
      state.result.score,
      state.result.verdict,
    );
    setTracked(true);
  }, [state.result, tracked]);

  if (!state.result) {
    return (
      <main className="hsk-test-runner-shell">
        <div className="hsk-test-runner-card">
          <p className="text-[#6b6b6b]">Загружаем результат…</p>
        </div>
      </main>
    );
  }

  const result = state.result;
  const recommended = getHskTestLevel(result.recommendedLevel);
  const verdict = verdictCopy(result.level, result.verdict, result.recommendedLevel);
  const pct = Math.round(result.score * 100);
  // Share a per-level URL so the per-level OG image (huge level number on
  // pastel) shows in Telegram/VK previews instead of the generic landing one.
  const shareUrl = `${SITE_URL}/chinese/hsk-test/level-${result.recommendedLevel}`;
  const shareText = `Мой уровень — HSK ${result.recommendedLevel}. Пройди тест бесплатно за 10 минут.`;

  const restart = () => {
    HskTestGoals.restarted(result.level);
    reset();
    router.push("/chinese/hsk-test");
  };

  return (
    <main className="hsk-test-result-main">
      {/* Offscreen A4-landscape cert — only used to capture the PNG download.
         Stays in the DOM so html-to-image can render fonts/colours correctly. */}
      <div className="hsk-test-print-stage" aria-hidden>
        <PrintableCertificate ref={certRef} result={result} name={state.name} />
      </div>

      <div className="page-shell section-space hsk-test-result-inner">
        {/* Block 6.1 — Big badge + verdict.
           The level colours flow through CSS custom properties so dark
           theme can mix them with the page background (see globals.css). */}
        <div
          className="card-block card-block-lg hsk-test-result-shell"
          style={
            {
              "--hsk-base": recommended.color.base,
              "--hsk-deep": recommended.color.deep,
            } as React.CSSProperties
          }
        >
          <div className="hsk-test-result-hero">
            <div
              className="hsk-test-result-badge"
              style={
                { "--hsk-deep": recommended.color.deep } as React.CSSProperties
              }
            >
              <span className="hsk-test-result-badge-eyebrow">Ваш уровень</span>
              <span className="hsk-test-result-badge-level">
                HSK {result.recommendedLevel}
              </span>
              <span className="hsk-test-result-score">CEFR {recommended.cefr}</span>
            </div>
            <div>
              <h1 className="text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2.5rem]">
                {verdict.title}
              </h1>
              <p className="mt-4 max-w-[560px] text-base leading-[1.6] text-[#1b1b1b] sm:text-lg">
                {verdict.description}
              </p>
              <div className="hsk-test-result-stats">
                <div>
                  <span className="hsk-test-result-stat-label">Правильных</span>
                  <span className="hsk-test-result-stat-value">
                    {result.correctCount} / {result.totalCount}
                  </span>
                </div>
                <div>
                  <span className="hsk-test-result-stat-label">Балл</span>
                  <span className="hsk-test-result-stat-value">{pct}%</span>
                </div>
                <div>
                  <span className="hsk-test-result-stat-label">Вы выбрали</span>
                  <span className="hsk-test-result-stat-value">
                    HSK {result.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 6.2 — Skill breakdown */}
        <section className="hsk-test-result-section">
          <div className="card-block card-lime-soft">
            <h2 className="text-[1.5rem] font-medium leading-[1.2] text-[#1b1b1b] sm:text-[1.875rem]">
              Разбор по навыкам
            </h2>
            <p className="mt-3 max-w-[600px] text-base leading-[1.55] text-[#4b4b4b]">
              Тест считает каждое задание с весом по сложности: чтение и грамматика
              весят больше простых сопоставлений. Поэтому процент по навыкам
              показывает реальное распределение, а не просто долю правильных
              ответов.
            </p>
            <div className="mt-6">
              <SkillBars skills={result.skills} />
            </div>
          </div>
        </section>

        {/* Block 6.3 — Course recommendation (lead) */}
        <section className="hsk-test-result-section">
          <div className="card-block card-cream-soft hsk-test-recommendation">
            <div>
              <span className="eyebrow eyebrow-on-light">Рекомендуем курс</span>
              <h2 className="mt-4 text-[1.5rem] font-medium leading-[1.2] text-[#1b1b1b] sm:text-[1.875rem]">
                {recommended.courseTitle}
              </h2>
              <p className="mt-3 max-w-[480px] text-base leading-[1.55] text-[#4b4b4b]">
                Подходит под ваш текущий уровень: {recommended.vocabSize},{" "}
                {recommended.hanziCount}, {recommended.hours}. Куратор подберёт
                расписание и преподавателя под цель.
              </p>
            </div>
            <div className="hsk-test-recommendation-ctas">
              <LeadModal
                triggerClassName={buttonStyles({ size: "large" })}
                source={`hsk-test-result-level-${result.recommendedLevel}`}
                defaultCourse="hsk-preparation"
                ariaLabel="Записаться на курс"
                suppressFloatingCta
              >
                Записаться на курс
              </LeadModal>
              <Link
                href={`/hsk/hsk-${result.recommendedLevel}`}
                className={buttonStyles({ variant: "secondary", size: "large" })}
                onClick={() =>
                  HskTestGoals.lead(result.level, result.recommendedLevel)
                }
              >
                Подробнее о HSK {result.recommendedLevel}
              </Link>
            </div>
          </div>
        </section>

        {/* Block 6.4 — Share + certificate (on-screen preview is compact;
           the PNG download captures the printable A4 stage above) */}
        <section className="hsk-test-result-section hsk-test-share-section">
          <div className="card-block card-sky-soft">
            <h2 className="text-[1.5rem] font-medium leading-[1.2] text-[#1b1b1b] sm:text-[1.875rem]">
              Поделитесь результатом
            </h2>
            <p className="mt-3 max-w-[520px] text-base leading-[1.55] text-[#4b4b4b]">
              Подпишите сертификат своим именем, скачайте его в PNG или отправьте
              ссылку в Telegram и ВКонтакте.
            </p>
            <div className="hsk-test-share-grid">
              <Certificate result={result} name={state.name} />
              <div className="hsk-test-share-controls">
                <label className="hsk-test-name-input">
                  <span>Имя на сертификате (необязательно)</span>
                  <input
                    type="text"
                    value={state.name}
                    onChange={(event) => setName(event.target.value.slice(0, 40))}
                    placeholder="Например, Анна"
                    autoComplete="name"
                  />
                </label>
                <ShareResultButtons
                  level={result.recommendedLevel}
                  shareUrl={shareUrl}
                  shareText={shareText}
                  certRef={certRef}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Block 6.5 — Inline lead form (gentle phone/email collection after result) */}
        <section className="hsk-test-result-section">
          <HskTestLeadInline
            level={result.level}
            recommendedLevel={result.recommendedLevel}
            score={pct}
          />
        </section>

        {/* Block 6.6 — Restart + browse other levels */}
        <section className="hsk-test-result-section hsk-test-result-footer">
          <button
            type="button"
            onClick={restart}
            className={buttonStyles({ variant: "ghost", size: "large" })}
          >
            Пройти тест ещё раз
          </button>
          <Link
            href="/chinese/hsk-test"
            className={buttonStyles({ variant: "secondary", size: "large" })}
          >
            Все уровни HSK-теста
          </Link>
        </section>
      </div>
    </main>
  );
}
