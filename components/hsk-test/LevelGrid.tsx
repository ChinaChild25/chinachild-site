import Link from "next/link";
import type { CSSProperties } from "react";
import { hskTestLevels } from "@/lib/hsk-test/levels";

/**
 * Per-level card preset. Geometry mirrors the light master reference at a
 * 500×500 desktop card: object width/offsets are % of the card box (so they
 * stay exact at 500px and scale proportionally below), the subtitle is two
 * forced lines that match the reference line breaks verbatim, and level 4 ships
 * a dark-interior variant for the dark theme (CSS-only swap, SSR-safe).
 */
type Preset = {
  lines: [string, string];
  art: string;
  artDark?: string;
  /** Inline CSS custom properties consumed by the card CSS. */
  vars: CSSProperties;
};

const LEVEL_CARD: Record<number, Preset> = {
  1: {
    lines: ["Базовые слова и", "простые фразы"],
    art: "/hsk-test/hsk-1.webp",
    vars: {
      "--img-w": "58.4%",
      "--img-right": "2.4%",
      "--img-bottom": "3.6%",
      "--img-rot": "0deg",
      "--sub-w": "248px",
    } as CSSProperties,
  },
  2: {
    lines: ["Повседневные темы,", "диалоги и общение"],
    art: "/hsk-test/hsk-2.webp",
    vars: {
      "--img-w": "76%",
      "--img-left": "12%",
      "--img-bottom": "-4%",
      "--img-rot": "0deg",
      "--sub-w": "312px",
    } as CSSProperties,
  },
  3: {
    lines: ["Грамматика, чтение и", "аудирование"],
    art: "/hsk-test/hsk-3.webp",
    vars: {
      "--img-w": "112.4%",
      "--img-left": "-5.6%",
      "--img-bottom": "2%",
      "--img-rot": "0deg",
      "--sub-w": "322px",
    } as CSSProperties,
  },
  4: {
    lines: ["Сложные тексты, устная", "речь и анализ"],
    // Dark-interior octagon pops on the light card; light-interior on the dark card.
    art: "/hsk-test/hsk-4-dark.webp", // shown in light theme (--light)
    artDark: "/hsk-test/hsk-4.webp", // shown in dark theme (--dark)
    vars: {
      "--img-w": "55.2%",
      "--img-right": "2.8%",
      "--img-bottom": "4%",
      "--img-rot": "14deg",
      "--sub-w": "330px",
    } as CSSProperties,
  },
};

/** Pixel ↗ glyph — recoloured from blue-arrow.svg to follow the card ink. */
function CornerArrow() {
  const cells = [
    // top bar
    [10, 10], [13.3344, 10], [16.6661, 10], [20, 10], [23.3344, 10],
    // right bar
    [26.6664, 10], [26.6664, 13.3374], [26.6664, 16.6655], [26.6664, 20],
    [26.6664, 23.3374], [26.6664, 26.6655],
    // diagonal
    [23.3344, 13.3296], [20, 16.6655], [16.6664, 19.9937], [13.3344, 23.3296],
    [10, 26.6655],
  ];
  return (
    <svg
      className="hsk-test-level-card-arrow"
      viewBox="0 0 40 40"
      aria-hidden
      focusable="false"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3.33327" height="3.33327" fill="currentColor" />
      ))}
    </svg>
  );
}

export default function LevelGrid(
  {
    /** Kept for call-site compatibility; both targets resolve to the level page. */
    linkToLevelPage = true,
    excludeLevel,
  }: {
    linkToLevelPage?: boolean;
    excludeLevel?: number;
  } = {},
) {
  void linkToLevelPage;
  const levels = excludeLevel
    ? hskTestLevels.filter((meta) => meta.level !== excludeLevel)
    : hskTestLevels;

  return (
    <div className="hsk-test-level-grid">
      {levels.map((meta) => {
        const card = LEVEL_CARD[meta.level];
        return (
          <Link
            key={meta.slug}
            href={`/chinese/hsk-test/${meta.slug}`}
            className="hsk-test-level-card"
            data-level={meta.level}
            style={card.vars}
          >
            <CornerArrow />
            <h3 className="hsk-test-level-card-title">HSK&nbsp;{meta.level}</h3>
            <p className="hsk-test-level-card-blurb">
              {card.lines[0]}
              <br />
              {card.lines[1]}
            </p>
            <div className="hsk-test-level-card-art" aria-hidden>
              {/* eslint-disable @next/next/no-img-element */}
              <img
                src={card.art}
                alt=""
                className={`hsk-test-level-card-art-img${card.artDark ? " hsk-test-level-card-art-img--light" : ""}`}
                loading="lazy"
                draggable={false}
              />
              {card.artDark && (
                <img
                  src={card.artDark}
                  alt=""
                  className="hsk-test-level-card-art-img hsk-test-level-card-art-img--dark"
                  loading="lazy"
                  draggable={false}
                />
              )}
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
