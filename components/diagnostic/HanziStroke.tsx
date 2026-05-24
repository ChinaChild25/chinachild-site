"use client";

import { useEffect, useRef } from "react";

interface Props {
  hanzi: string;
  size?: number;
  /** Зациклить анимацию (только для not-shuffled). */
  loop?: boolean;
  /** Показать нарочно неправильный порядок черт (для типа F). */
  shuffled?: boolean;
  /** Задержка между чертами, мс. */
  delay?: number;
  className?: string;
  /** Override stroke colour. Defaults to var(--d-ink). Use this when the
   *  hanzi sits on a fixed-light pastel background (HSK-test hero) so
   *  strokes don't flip to white in dark theme. */
  strokeColor?: string;
  /** Accent mode — no faded template character, no outline. The hanzi is
   *  drawn from scratch in brush strokes. Use this when the animation is
   *  decorative (heroes, watermarks) and NOT a tracing/training tool. */
  accent?: boolean;
}

/**
 * Анимированный иероглиф через hanzi-writer. Данные грузятся с CDN
 * jsdelivr (разрешено в CSP). Поддерживает loop и shuffled-режим:
 * shuffled рисует черты в подменённом порядке (соседние пары меняются местами),
 * чтобы пользователь типа F смог распознать сбой.
 */
export default function HanziStroke({
  hanzi,
  size = 200,
  loop = false,
  shuffled = false,
  delay = 220,
  className,
  strokeColor,
  accent = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    type WriterLike = {
      animateCharacter: (opts?: { onComplete?: () => void }) => void;
      animateStroke: (i: number, opts?: { onComplete?: () => void }) => void;
      loopCharacterAnimation: () => void;
      cancelCharacterAnimation?: () => void;
      hideCharacter: () => void;
    };
    type WriterModule = {
      default: {
        create: (target: HTMLElement, char: string, opts: Record<string, unknown>) => WriterLike;
        loadCharacterData: (char: string) => Promise<{ strokes: string[] }>;
      };
    };

    let writer: WriterLike | null = null;
    const node = ref.current;

    (async () => {
      try {
        const mod = (await import("hanzi-writer")) as unknown as WriterModule;
        if (cancelled || !node) return;
        const HanziWriter = mod.default;

        node.innerHTML = "";

        const ink =
          strokeColor ||
          getComputedStyle(document.documentElement).getPropertyValue("--d-ink").trim() ||
          "#0a0a0a";

        writer = HanziWriter.create(node, hanzi, {
          width: size,
          height: size,
          padding: Math.max(6, Math.round(size * 0.04)),
          // Accent mode: no faded ghost character, no outline — strokes
          // appear from scratch in the stroke colour. Tracing/training
          // mode (default) shows the outline + faded char as a guide.
          showOutline: !accent,
          showCharacter: !shuffled && !accent,
          strokeColor: ink,
          outlineColor: "rgba(0,0,0,0.18)",
          radicalColor: ink,
          strokeAnimationSpeed: 1.15,
          delayBetweenStrokes: delay,
        });

        // In accent mode the user shouldn't see the static character flash
        // before the strokes start drawing. Hide it explicitly.
        if (accent && writer && !shuffled) {
          try { writer.hideCharacter(); } catch { /* ignore */ }
        }

        if (shuffled && writer) {
          // Тип F: показываем неправильный порядок (соседние пары меняем местами)
          try {
            const data = await HanziWriter.loadCharacterData(hanzi);
            if (cancelled) return;
            const n = data.strokes.length;
            const order = shuffleOrder(n);
            writer.hideCharacter();
            // Небольшая пауза, чтобы юзер увидел outline до старта анимации
            await wait(220);
            for (const i of order) {
              if (cancelled || !writer) return;
              await new Promise<void>((resolve) => {
                writer!.animateStroke(i, { onComplete: () => resolve() });
              });
              await wait(delay);
            }
          } catch {
            // fallback — рисуем как есть
            if (!cancelled && writer) writer.animateCharacter();
          }
        } else if (loop && writer) {
          writer.loopCharacterAnimation();
        } else if (writer) {
          writer.animateCharacter();
        }
      } catch (err) {
        console.error("[HanziStroke] failed", err);
      }
    })();

    return () => {
      cancelled = true;
      if (writer && typeof writer.cancelCharacterAnimation === "function") {
        try { writer.cancelCharacterAnimation(); } catch { /* ignore */ }
      }
      if (node) node.innerHTML = "";
    };
  }, [hanzi, size, loop, shuffled, delay, strokeColor, accent]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: size, height: size, display: "grid", placeItems: "center" }}
      aria-label={`иероглиф ${hanzi}`}
    />
  );
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function shuffleOrder(n: number): number[] {
  // Меняем соседние пары местами: [0,1,2,3,4] → [1,0,3,2,4]
  // Это детерминированный «неправильный» порядок без рандома.
  if (n < 2) return [0];
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i + 1 < n; i += 2) {
    [order[i], order[i + 1]] = [order[i + 1], order[i]];
  }
  return order;
}
