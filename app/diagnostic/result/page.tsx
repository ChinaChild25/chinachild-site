"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import RadarChart from "@/components/diagnostic/RadarChart";
import ProgressChart from "@/components/diagnostic/ProgressChart";
import ShareCard from "@/components/diagnostic/ShareCard";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { ARCHETYPES } from "@/lib/diagnostic/archetypes";
import { track } from "@/lib/diagnostic/analytics";
import { SITE_URL } from "@/lib/site-config";
import type { DiagnosticResult } from "@/lib/diagnostic/types";

export default function ResultPage() {
  const router = useRouter();
  const { state, hydrated } = useDiagnostic();
  const [aiText, setAiText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.result || !state.calibration) {
      router.replace("/diagnostic");
      return;
    }
    track({ name: "result_viewed" });
  }, [hydrated, state.result, state.calibration, router]);

  // Стрим AI-разбора
  useEffect(() => {
    if (!hydrated || !state.result || !state.calibration || fetchedRef.current) return;
    fetchedRef.current = true;
    const controller = new AbortController();

    const run = async () => {
      const result = state.result!;
      const archetype = ARCHETYPES[result.archetype];
      setStreaming(true);
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            hsk: result.hsk,
            ability: result.ability,
            archetype: archetype.id,
            archetypeRu: archetype.ru,
            archetypeZh: archetype.zh,
            skills: result.skills,
            calibration: state.calibration,
            questionsAnswered: state.engine.history.length,
            percentileVsCohort: result.percentileVsCohort,
          }),
        });
        if (!res.ok || !res.body) throw new Error("bad response");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Лёгкая «печатная» анимация: разбиваем чанк на буквы
          for (const ch of chunk) {
            setAiText((prev) => prev + ch);
            // micro pacing — не сэлпим UI, но даём «живой» эффект
            await new Promise((r) => setTimeout(r, 12));
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("[result] stream failed", err);
        setAiText(
          "Не удалось получить AI-разбор. Запишитесь на бесплатный пробный — методист подберёт программу по результатам теста.",
        );
      } finally {
        setStreaming(false);
      }
    };
    run();

    return () => controller.abort();
  }, [hydrated, state.result, state.calibration, state.engine.history.length]);

  if (!hydrated || !state.result || !state.calibration) {
    return <main className="d-shell"><div className="d-small">Загружаю результат…</div></main>;
  }

  const result = state.result;
  const archetype = ARCHETYPES[result.archetype];

  return (
    <main className="d-shell-wide">
      {/* HERO */}
      <section className="d-reveal-hero d-fade-in">
        <div className="d-reveal-hsk">HSK {result.hsk}</div>
        <div className="d-reveal-hsk-label">Подтверждённый уровень</div>

        <div className="d-reveal-archetype d-zh">你是「{archetype.zh}」</div>
        <div className="d-reveal-archetype-ru">{archetype.ru}</div>

        <p className="d-reveal-tagline">{archetype.description}</p>
      </section>

      <div className="d-reveal-stack">
        {/* RADAR */}
        <section className="d-card d-card-neutral">
          <h2 className="d-h3" style={{ marginBottom: 8 }}>Chinese Fingerprint</h2>
          <p className="d-small">Профиль навыков по шести осям.</p>
          <div style={{ marginTop: 16 }} className="d-radar-wrap">
            <RadarChart skills={result.skills} size={420} />
          </div>
          <div className="d-cohort-line">
            Ваш результат сильнее, чем у {result.percentileVsCohort}% людей с тем же стажем.
          </div>
        </section>

        {/* FORECAST */}
        <section className="d-card d-card-violet">
          <div className="d-forecast-grid">
            <div>
              <span className="d-small">Прогноз</span>
              <h2 className="d-forecast-headline" style={{ marginTop: 8 }}>
                При {state.calibration.minutesPerDay} минутах в день вы достигнете HSK&nbsp;{result.nextHsk}
                {" "}примерно через {result.monthsToNextLevel}{" "}
                {pluralizeMonths(result.monthsToNextLevel)}.
              </h2>
              <button
                type="button"
                className="d-btn d-btn-compact"
                onClick={() => {
                  track({ name: "course_cta_clicked" });
                  router.push("/courses/hsk-preparation");
                }}
                style={{ marginTop: 14 }}
              >
                Ускорить до 4 месяцев →
              </button>
            </div>
            <ProgressChart currentHsk={result.hsk} monthsToNextLevel={result.monthsToNextLevel} />
          </div>
        </section>

        {/* AI BREAKDOWN */}
        <section className="d-card d-card-lime">
          <span className="d-small">Персональный разбор от AI</span>
          <h2 className="d-h3" style={{ marginTop: 6 }}>Что подтянуть и в каком темпе</h2>
          <div className="d-ai-block" data-streaming={streaming || undefined} style={{ marginTop: 16 }}>
            {aiText}
          </div>
        </section>

        {/* COURSE RECOMMENDATION */}
        <CourseRecommendation result={result} />

        {/* SHARE */}
        <section className="d-card d-card-neutral">
          <h2 className="d-h3">Поделиться результатом</h2>
          <p className="d-small">
            Скачайте карточку и опубликуйте в сториз — друзья узнают свой архетип по той же ссылке.
          </p>
          <div style={{ marginTop: 22 }}>
            <ShareCard result={result} siteUrl={SITE_URL} />
          </div>

          <ShareLinks result={result} />
        </section>

        {/* TUTOR & TELEGRAM */}
        <section style={{ display: "grid", gap: 12, marginTop: 8 }}>
          <Link href="/diagnostic/tutor" className="d-btn d-btn-accent">
            Поговорить с AI-тьютором →
          </Link>
          <Link href="/free-trial" className="d-btn d-btn-secondary" data-floating-cta-suppress="true">
            Записаться на бесплатный пробный с методистом
          </Link>
        </section>

        {/* RESTART */}
        <section style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/diagnostic" className="d-btn-ghost">
            Пройти диагностику заново
          </Link>
        </section>
      </div>
    </main>
  );
}

function pluralizeMonths(n: number): string {
  const r = n % 10;
  if (n >= 11 && n <= 14) return "месяцев";
  if (r === 1) return "месяц";
  if (r >= 2 && r <= 4) return "месяца";
  return "месяцев";
}

function CourseRecommendation({ result }: { result: DiagnosticResult }) {
  const router = useRouter();
  const targetHsk = result.nextHsk;
  return (
    <section className="d-card d-card-sky">
      <span className="d-small">Рекомендованный курс</span>
      <h2 className="d-h2" style={{ marginTop: 6 }}>
        Китайский HSK&nbsp;{targetHsk} за 4 месяца
      </h2>
      <p className="d-lead" style={{ marginTop: 14, maxWidth: 560 }}>
        Программа подстроена под ваш профиль «{ARCHETYPES[result.archetype].ru}»:
        больше работы со слабыми сторонами, меньше повторения того, что вы и так знаете.
      </p>
      <div className="d-course-cta-row">
        <button
          type="button"
          className="d-btn"
          data-floating-cta-suppress="true"
          onClick={() => {
            track({ name: "course_cta_clicked" });
            router.push("/free-trial");
          }}
        >
          Записаться · от 9 900 ₽
        </button>
        <Link href="/courses/hsk-preparation" className="d-btn d-btn-secondary">
          Программа курса
        </Link>
      </div>
    </section>
  );
}

function ShareLinks({ result }: { result: DiagnosticResult }) {
  const archetype = ARCHETYPES[result.archetype];
  const text = encodeURIComponent(
    `Прошёл AI-диагностику китайского от ChinaChild. Мой архетип — ${archetype.ru} (${archetype.zh}), уровень HSK ${result.hsk}. Узнайте свой:`,
  );
  const url = encodeURIComponent(`${SITE_URL}/diagnostic?utm_source=share&utm_medium=link`);

  const links: Array<{ key: string; label: string; href: string }> = [
    { key: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}` },
    { key: "vk", label: "VK", href: `https://vk.com/share.php?url=${url}&title=${text}` },
    { key: "twitter", label: "X / Twitter", href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
    { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${text}%20${url}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/diagnostic?utm_source=share&utm_medium=copy`);
      track({ name: "share_clicked", params: { channel: "copy" } });
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="d-share-grid" style={{ marginTop: 22 }}>
        {links.map((l) => (
          <a
            key={l.key}
            className="d-share-btn"
            href={l.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => track({ name: "share_clicked", params: { channel: l.key } })}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="d-btn-ghost" onClick={copy}>
          Скопировать ссылку
        </button>
      </div>
    </>
  );
}
