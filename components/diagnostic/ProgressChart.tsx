"use client";

import type { HskLevel } from "@/lib/diagnostic/types";

interface Props {
  currentHsk: HskLevel;
  monthsToNextLevel: number;
}

/**
 * Линия Безье «месяцы × HSK-уровень».
 * 4 опорные точки: сегодня, +25%, +75%, +100% времени до nextHsk.
 * Шкала Y подстраивается под currentHsk..currentHsk+1.
 */
export default function ProgressChart({ currentHsk, monthsToNextLevel }: Props) {
  const months = Math.max(2, monthsToNextLevel);
  const width = 360;
  const height = 160;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 22;
  const padBottom = 28;

  const ticks = [0, Math.round(months * 0.5), months];

  const x = (m: number) => padLeft + ((width - padLeft - padRight) * m) / months;
  const y = (level: number) => {
    // от currentHsk (low) до currentHsk+1 (top)
    const norm = level - currentHsk;
    return height - padBottom - (height - padTop - padBottom) * Math.min(1, Math.max(0, norm));
  };

  const p0 = { x: x(0), y: y(currentHsk) };
  const p1 = { x: x(months * 0.35), y: y(currentHsk + 0.25) };
  const p2 = { x: x(months * 0.75), y: y(currentHsk + 0.75) };
  const p3 = { x: x(months), y: y(currentHsk + 1) };

  const path = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

  return (
    <svg className="d-progress-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <line className="axis" x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} />
      <line className="axis" x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} />

      <text x={padLeft - 8} y={y(currentHsk + 1) + 4} textAnchor="end">
        HSK {currentHsk + 1}
      </text>
      <text x={padLeft - 8} y={y(currentHsk) + 4} textAnchor="end">
        HSK {currentHsk}
      </text>

      {ticks.map((t) => (
        <text key={t} x={x(t)} y={height - padBottom + 16} textAnchor="middle">
          {t === 0 ? "сейчас" : `${t} мес.`}
        </text>
      ))}

      <path className="line" d={path} />
      <circle className="dot" cx={p0.x} cy={p0.y} r="3.5" />
      <circle className="dot" cx={p3.x} cy={p3.y} r="3.5" />
    </svg>
  );
}
