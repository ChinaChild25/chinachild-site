"use client";

import { useEffect, useState } from "react";

interface Props {
  base?: number;
  variance?: number;
  intervalMs?: number;
  className?: string;
}

/**
 * Псевдо-живой счётчик. Стартует с детерминированного числа
 * (чтобы не было гидрационного flash), потом плавно гуляет ±variance.
 */
export default function LiveCounter({
  base = 1247,
  variance = 18,
  intervalMs = 3500,
  className,
}: Props) {
  const [n, setN] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setN((prev) => {
        const drift = Math.round((Math.random() - 0.5) * variance);
        const next = base + drift;
        return Math.max(base - variance, Math.min(base + variance, next));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, variance, intervalMs]);

  return (
    <span className={`d-counter ${className ?? ""}`}>
      <span className="d-counter-dot" />
      {n.toLocaleString("ru-RU")} человек проходят сейчас
    </span>
  );
}
