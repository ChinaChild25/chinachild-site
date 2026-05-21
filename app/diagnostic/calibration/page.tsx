"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WaveLoader from "@/components/diagnostic/WaveLoader";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { track } from "@/lib/diagnostic/analytics";
import type { Experience, Goal } from "@/lib/diagnostic/types";

const EXP_OPTIONS: Array<{ value: Experience; label: string }> = [
  { value: "none", label: "Никогда" },
  { value: "lt3m", label: "Меньше 3 мес." },
  { value: "lt1y", label: "До года" },
  { value: "1to3y", label: "1–3 года" },
  { value: "gt3y", label: "Больше 3 лет" },
];

const GOAL_OPTIONS: Array<{ value: Goal; label: string }> = [
  { value: "work", label: "Работа" },
  { value: "travel", label: "Путешествия" },
  { value: "live", label: "Жизнь в Китае" },
  { value: "fun", label: "Для души" },
  { value: "business", label: "Бизнес" },
];

type Stage = "experience" | "goal" | "minutes" | "transition";

export default function CalibrationPage() {
  const router = useRouter();
  const { setCalibration } = useDiagnostic();
  const [stage, setStage] = useState<Stage>("experience");
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [minutes, setMinutes] = useState(20);

  // Авто-переход с transition-экрана через 2 секунды
  useEffect(() => {
    if (stage !== "transition") return;
    if (!experience || !goal) return;
    setCalibration({ experience, goal, minutesPerDay: minutes });
    track({
      name: "calibration_completed",
      params: { experience, goal, minutesPerDay: minutes },
    });
    const id = setTimeout(() => router.push("/diagnostic/test"), 2200);
    return () => clearTimeout(id);
  }, [stage, experience, goal, minutes, setCalibration, router]);

  return (
    <main className="d-shell-narrow">
      {stage === "experience" && (
        <Step
          step={1}
          title="Как давно вы изучаете китайский?"
        >
          <div className="d-pill-row">
            {EXP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="d-pill"
                data-selected={experience === opt.value || undefined}
                onClick={() => {
                  setExperience(opt.value);
                  setTimeout(() => setStage("goal"), 220);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Step>
      )}

      {stage === "goal" && (
        <Step step={2} title="Зачем вам китайский?">
          <div className="d-pill-row">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="d-pill"
                data-selected={goal === opt.value || undefined}
                onClick={() => {
                  setGoal(opt.value);
                  setTimeout(() => setStage("minutes"), 220);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Step>
      )}

      {stage === "minutes" && (
        <Step step={3} title="Сколько минут в день готовы заниматься?">
          <div className="d-slider" style={{ marginTop: 24 }}>
            <div className="d-slider-value" style={{ marginBottom: 18 }}>
              {minutes} <span style={{ fontSize: "1.25rem", color: "var(--d-muted)" }}>мин/день</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="d-slider-input"
              style={{ ["--slider-progress" as string]: `${((minutes - 5) / 55) * 100}%` } as React.CSSProperties}
              aria-label="Минут в день"
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span className="d-small">5</span>
              <span className="d-small">60</span>
            </div>
          </div>
          <div style={{ marginTop: 36 }}>
            <button type="button" className="d-btn d-btn-block" onClick={() => setStage("transition")}>
              Дальше
            </button>
          </div>
        </Step>
      )}

      {stage === "transition" && (
        <div className="d-fade-in" style={{ paddingTop: 64, textAlign: "left" }}>
          <h2 className="d-h2">Калибруем диагностику под вас</h2>
          <p className="d-lead" style={{ marginTop: 18, maxWidth: 520 }}>
            Подбираю 18–22 вопроса, которые точно определят ваш уровень.
          </p>
          <div style={{ marginTop: 40 }}>
            <WaveLoader />
          </div>
        </div>
      )}
    </main>
  );
}

function Step({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="d-cal-step d-fade-in" key={step}>
      <span className="d-small">Шаг {step} из 3</span>
      <h1 className="d-h2">{title}</h1>
      {children}
    </div>
  );
}
