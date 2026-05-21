"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { ARCHETYPES } from "@/lib/diagnostic/archetypes";
import { track } from "@/lib/diagnostic/analytics";

const LINES = [
  "Анализирую ответы…",
  "Сравниваю с 47 832 профилями…",
  "Подбираю архетип…",
  "Считаю прогноз…",
];

const STEP_MS = 700;
const DONE_DELAY = 900;

export default function AnalyzingPage() {
  const router = useRouter();
  const { state, hydrated, finalize } = useDiagnostic();
  const [visible, setVisible] = useState(0);
  const [showDone, setShowDone] = useState(false);

  // Защита: если попали сюда без ответов — назад на лендинг
  useEffect(() => {
    if (!hydrated) return;
    if (state.engine.history.length === 0) {
      router.replace("/diagnostic");
    }
  }, [hydrated, state.engine.history.length, router]);

  // Финализируем результат сразу при монтировании (если ещё не финализован)
  useEffect(() => {
    if (!hydrated) return;
    const result = finalize();
    if (result) {
      const archetype = ARCHETYPES[result.archetype];
      track({
        name: "test_completed",
        params: {
          ability: Number(result.ability.toFixed(2)),
          hsk: result.hsk,
          archetype: archetype.ru,
          questions: state.engine.history.length,
        },
      });
    }
  }, [hydrated, finalize, state.engine.history.length]);

  // Поочерёдная анимация строк
  useEffect(() => {
    if (visible >= LINES.length) return;
    const id = setTimeout(() => setVisible((v) => v + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [visible]);

  // После всех строк — «Готово» и переход
  useEffect(() => {
    if (visible < LINES.length) return;
    const id1 = setTimeout(() => setShowDone(true), 400);
    const id2 = setTimeout(() => router.push("/diagnostic/result"), 400 + DONE_DELAY);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, [visible, router]);

  // Прогресс-бар — нелинейный, ускоряется к концу
  const progress = Math.min(1, (visible / LINES.length) * 0.85 + (showDone ? 0.15 : 0));

  return (
    <main className="d-analyzing">
      <div className="d-analyzing-inner">
        {LINES.map((line, i) => (
          <div
            key={i}
            className={i < visible ? "d-analyzing-line" : ""}
            style={{
              opacity: i < visible ? undefined : 0,
              animationDelay: `${i * 80}ms`,
            }}
          >
            {line}
          </div>
        ))}
        {showDone && (
          <div className="d-analyzing-line d-analyzing-done" style={{ animationDelay: "0ms" }}>
            Готово.
          </div>
        )}
        <div className="d-analyzing-bar">
          <div className="d-analyzing-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </main>
  );
}
