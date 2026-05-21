"use client";

import type { SkillProfile } from "@/lib/diagnostic/types";

interface Props {
  skills: SkillProfile;
  size?: number;
}

const AXES: Array<{ key: keyof SkillProfile; zh: string; ru: string }> = [
  { key: "hanzi", zh: "字", ru: "Иероглифы" },
  { key: "tones", zh: "音", ru: "Тоны" },
  { key: "grammar", zh: "语", ru: "Грамматика" },
  { key: "reading", zh: "读", ru: "Чтение" },
  { key: "speed", zh: "速", ru: "Скорость" },
  { key: "listening", zh: "听", ru: "Аудио" },
];

/**
 * Радар на 6 осей. SVG. Никаких внешних chart-библиотек.
 */
export default function RadarChart({ skills, size = 440 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const labelR = r + 28;
  const angles = AXES.map((_, i) => (-Math.PI / 2) + (i * (Math.PI * 2)) / AXES.length);

  const grid = [0.25, 0.5, 0.75, 1];

  const valuePoints = AXES.map((axis, i) => {
    const v = Math.max(0, Math.min(100, skills[axis.key])) / 100;
    return polarToCart(cx, cy, r * v, angles[i]);
  });

  const valuePath =
    valuePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      style={{ maxWidth: size }}
      role="img"
      aria-label="Радар навыков"
    >
      {/* Сетка — концентрические полигоны */}
      {grid.map((g, gi) => {
        const points = angles
          .map((a) => {
            const p = polarToCart(cx, cy, r * g, a);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(" ");
        return (
          <polygon
            key={`grid-${gi}`}
            points={points}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Оси */}
      {angles.map((a, i) => {
        const end = polarToCart(cx, cy, r, a);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Заливка значения */}
      <path d={valuePath} fill="rgba(92, 92, 255, 0.15)" stroke="#5c5cff" strokeWidth="2" strokeLinejoin="round" />

      {/* Точки */}
      {valuePoints.map((p, i) => (
        <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#5c5cff" />
      ))}

      {/* Подписи */}
      {AXES.map((axis, i) => {
        const p = polarToCart(cx, cy, labelR, angles[i]);
        const align = textAlign(angles[i]);
        return (
          <g key={`label-${i}`}>
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor={align}
              fontFamily="Noto Sans SC, PingFang SC, sans-serif"
              fontSize="14"
              fill="#0a0a0a"
            >
              {axis.zh}
            </text>
            <text
              x={p.x}
              y={p.y + 10}
              textAnchor={align}
              fontSize="11"
              fill="#7a7a7a"
            >
              {axis.ru}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function polarToCart(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function textAlign(angle: number): "start" | "middle" | "end" {
  const x = Math.cos(angle);
  if (x > 0.2) return "start";
  if (x < -0.2) return "end";
  return "middle";
}
