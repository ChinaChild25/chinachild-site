"use client";

import dynamic from "next/dynamic";

const HanziStroke = dynamic(
  () => import("@/components/diagnostic/HanziStroke"),
  { ssr: false, loading: () => null },
);

type HskHeroHanziProps = {
  hanzi: string;
  size?: number;
  /** Loop animation. Defaults to true (hero context). */
  loop?: boolean;
  /** Delay between strokes, ms. */
  delay?: number;
  /** Stroke colour. Omit to let HanziStroke read --d-ink (theme-aware).
   *  Pass a fixed colour when the hanzi sits on an always-pastel surface
   *  (per-level hero, certificate) so it stays legible across themes. */
  strokeColor?: string;
  className?: string;
};

/**
 * Animated calligraphic hanzi for HSK-test heroes & certificates.
 *
 * Renders in `accent` mode — the strokes draw from scratch with no faded
 * template character or outline behind them. This is a decorative
 * animation, not a tracing/training tool — those keep the ghost outline.
 */
export default function HskHeroHanzi({
  hanzi,
  size = 280,
  loop = true,
  delay = 320,
  strokeColor,
  className,
}: HskHeroHanziProps) {
  return (
    <div className={className ?? "hsk-test-hero-hanzi"} aria-hidden>
      <HanziStroke
        hanzi={hanzi}
        size={size}
        loop={loop}
        delay={delay}
        strokeColor={strokeColor}
        accent
      />
    </div>
  );
}
