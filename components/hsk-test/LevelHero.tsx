import Link from "next/link";
import type { CSSProperties } from "react";
import type { HskTestLevelMeta } from "@/lib/hsk-test/levels";

/**
 * Per-level hero illustration — the SAME 3D object that represents the level
 * on the landing `#levels` grid, so the card you tapped flows straight into
 * the level page. Object is height-based (so it scales with the wide hero) and
 * bleeds off the bottom-right corner. Level 4 swaps variant by theme.
 */
type HeroArt = {
  art: string;
  artDark?: string;
  vars: CSSProperties;
};

const HERO_ART: Record<number, HeroArt> = {
  1: {
    art: "/hsk-test/hsk-1.webp",
    // square → vertically centred in the right zone (see CSS), not cornered
    vars: { "--h-h": "82%", "--h-w": "66%", "--h-right": "4%", "--h-bottom": "-4%", "--h-rot": "0deg" } as CSSProperties,
  },
  2: {
    art: "/hsk-test/hsk-2.webp",
    // moved left (bigger --h-right) and up (less bottom bleed)
    vars: { "--h-h": "82%", "--h-w": "68%", "--h-right": "8%", "--h-bottom": "-4%", "--h-rot": "0deg" } as CSSProperties,
  },
  3: {
    art: "/hsk-test/hsk-3.webp",
    // tilted + bottom-anchored, sized large and pushed right so the left leg
    // bleeds off the bottom and the right leg off the right edge — both flat-cut
    // ends hidden, ☀ + 三级 stay in frame.
    vars: { "--h-h": "94%", "--h-w": "108%", "--h-right": "-12%", "--h-bottom": "-10%", "--h-rot": "-24deg" } as CSSProperties,
  },
  4: {
    art: "/hsk-test/hsk-4-dark.webp",
    artDark: "/hsk-test/hsk-4.webp",
    // square → vertically centred in the right zone (see CSS), not cornered
    vars: { "--h-h": "78%", "--h-w": "60%", "--h-right": "5%", "--h-bottom": "-3%", "--h-rot": "14deg" } as CSSProperties,
  },
};

export default function LevelHero({ meta }: { meta: HskTestLevelMeta }) {
  const art = HERO_ART[meta.level];
  return (
    <div className="hsk-test-level-hero" data-level={meta.level} style={art.vars}>
      <div className="hsk-test-level-hero-body">
        <span className="hsk-test-level-hero-eyebrow">
          Уровень HSK {meta.level} · CEFR {meta.cefr}
        </span>
        <h1 className="hsk-test-level-hero-title">
          Тест HSK {meta.level} онлайн — проверьте свой уровень китайского за 10 минут
        </h1>
        <p className="hsk-test-level-hero-sub">{meta.blurb}</p>
        <div className="hsk-test-level-hero-chips">
          <span className="hsk-test-level-hero-chip">{meta.vocabSize}</span>
          <span className="hsk-test-level-hero-chip">{meta.hanziCount}</span>
          <span className="hsk-test-level-hero-chip">{meta.hours}</span>
        </div>
        <div className="hsk-test-level-hero-cta">
          <Link href="#start" className="hsk-test-level-hero-btn" data-floating-cta-suppress="true">
            Пройти тест бесплатно
          </Link>
          <Link href={`/hsk/hsk-${meta.level}`} className="hsk-test-level-hero-btn-ghost">
            Подробнее о HSK {meta.level}
          </Link>
        </div>
      </div>

      <div className="hsk-test-level-hero-art" aria-hidden>
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={art.art}
          alt=""
          className={`hsk-test-level-hero-img${art.artDark ? " hsk-test-level-hero-img--light" : ""}`}
          loading="eager"
          draggable={false}
        />
        {art.artDark && (
          <img
            src={art.artDark}
            alt=""
            className="hsk-test-level-hero-img hsk-test-level-hero-img--dark"
            loading="eager"
            draggable={false}
          />
        )}
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}
