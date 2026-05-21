"use client";

/**
 * SVG-кривая тона (визуализация мелодики 4 тонов + нейтральный).
 *   1 — высокий ровный: ▔
 *   2 — восходящий:    ／
 *   3 — низкий с подъёмом: ∨
 *   4 — нисходящий:    ＼
 *   5 — нейтральный:   ·
 */
export default function ToneArc({ tone }: { tone: 1 | 2 | 3 | 4 | 5 }) {
  const paths: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "M 3 4 L 33 4",
    2: "M 3 18 L 33 4",
    3: "M 3 6 Q 18 22 33 6",
    4: "M 3 4 L 33 18",
    5: "M 16 11 L 20 11",
  };
  return (
    <svg viewBox="0 0 36 22" aria-hidden>
      <path d={paths[tone]} />
    </svg>
  );
}
