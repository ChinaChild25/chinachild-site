"use client";

import { useRouter } from "next/navigation";
import { useHskTest } from "@/lib/hsk-test/state";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import type { HskTestLevel, HskTestMode } from "@/lib/hsk-test/types";

type LevelStartCardProps = {
  level: HskTestLevel;
};

type ModeOption = {
  mode: HskTestMode;
  title: string;
  meta: string;
};

const MODES: ModeOption[] = [
  {
    mode: "express",
    title: "Экспресс-тест",
    meta: "10 вопросов · ≈ 5 минут · быстрая оценка уровня",
  },
  {
    mode: "full",
    title: "Полный тест",
    meta: "20 вопросов · ≈ 10–12 минут · разбор по навыкам",
  },
  {
    mode: "adaptive",
    title: "Адаптивный тест",
    meta: "15 вопросов · сложность подстраивается под темп",
  },
];

export default function LevelStartCard({ level }: LevelStartCardProps) {
  const router = useRouter();
  const { start } = useHskTest();

  const launch = (mode: HskTestMode) => {
    start(level, mode);
    HskTestGoals.started(level, mode);
    router.push("/chinese/hsk-test/take");
  };

  return (
    <div className="hsk-test-mode-picker">
      {MODES.map((option) => (
        <button
          key={option.mode}
          type="button"
          className="hsk-test-mode-card"
          onClick={() => launch(option.mode)}
        >
          <span className="hsk-test-mode-card-title">{option.title}</span>
          <span className="hsk-test-mode-card-meta">{option.meta}</span>
          <span className="hsk-test-mode-card-arrow" aria-hidden>
            →
          </span>
        </button>
      ))}
      <p className="hsk-test-mode-disclaimer">
        Тест бесплатный, регистрация не требуется. Результат сохранится в браузере.
      </p>
    </div>
  );
}
