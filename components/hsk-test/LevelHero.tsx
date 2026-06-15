import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { HskTestLevelMeta } from "@/lib/hsk-test/levels";

/**
 * Per-level hero illustration — the SAME 3D object that represents the level
 * on the landing `#levels` grid, so the card you tapped flows straight into
 * the level page. Object is height-based (so it scales with the wide hero) and
 * bleeds off the bottom-right corner. Level 4 swaps variant by theme.
 *
 * Served through next/image: the decorative WebPs are 720–1280px square-ish but
 * render at ~230–390px on screen, so the optimizer ships a right-sized AVIF/WebP
 * variant per DPR instead of the full file. `priority` keeps the preload + high
 * fetch priority the LCP candidate needs; `w`/`h` are the intrinsic dimensions
 * (CSS still drives the on-screen size via the --h-* custom props).
 */
type HeroArt = {
  art: string;
  artDark?: string;
  /** Intrinsic pixel size of the source WebP (for next/image aspect ratio). */
  w: number;
  h: number;
  vars: CSSProperties;
};

// The art bleeds off the card and is height-driven; ~75vw on phones, ~40vw on
// desktop covers the widest variant (HSK 3 is the only landscape object).
const HERO_ART_SIZES = "(max-width: 859px) 75vw, 40vw";

const HERO_ART: Record<number, HeroArt> = {
  1: {
    art: "/hsk-test/hsk-1.webp",
    w: 720,
    h: 720,
    // square → vertically centred in the right zone; bleeds off the right edge
    vars: { "--h-h": "74%", "--h-w": "66%", "--h-right": "-3%", "--h-bottom": "-4%", "--h-rot": "0deg" } as CSSProperties,
  },
  2: {
    art: "/hsk-test/hsk-2.webp",
    w: 760,
    h: 760,
    // bottom-anchored; pushed off the right edge so the crop is off-frame
    vars: { "--h-h": "80%", "--h-w": "68%", "--h-right": "-6%", "--h-bottom": "-7%", "--h-rot": "0deg" } as CSSProperties,
  },
  3: {
    art: "/hsk-test/hsk-3.webp",
    w: 1280,
    h: 732,
    // tilted + bottom-anchored, large and pushed right so the right leg bleeds
    // off the right edge and the left leg off the bottom — cuts stay off-frame.
    vars: { "--h-h": "88%", "--h-w": "108%", "--h-right": "-12%", "--h-bottom": "-10%", "--h-rot": "-24deg" } as CSSProperties,
  },
  4: {
    art: "/hsk-test/hsk-4-dark.webp",
    artDark: "/hsk-test/hsk-4.webp",
    w: 720,
    h: 720,
    // square → vertically centred in the right zone; bleeds off the right edge
    vars: { "--h-h": "70%", "--h-w": "60%", "--h-right": "-2%", "--h-bottom": "-3%", "--h-rot": "14deg" } as CSSProperties,
  },
};

export default function LevelHero({ meta }: { meta: HskTestLevelMeta }) {
  const art = HERO_ART[meta.level];
  return (
    <div className="hsk-test-level-hero" data-level={meta.level} style={art.vars}>
      <div className="hsk-test-level-hero-body">
        <span className="hsk-test-level-hero-eyebrow">
          Уровень HSK&nbsp;{meta.level} · CEFR&nbsp;{meta.cefr}
        </span>
        <h1 className="hsk-test-level-hero-title">
          Тест HSK&nbsp;{meta.level} онлайн — проверьте свой уровень китайского за 10 минут
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
            Подробнее о HSK&nbsp;{meta.level}
          </Link>
        </div>
      </div>

      <div className="hsk-test-level-hero-art" aria-hidden>
        <Image
          src={art.art}
          alt=""
          width={art.w}
          height={art.h}
          sizes={HERO_ART_SIZES}
          className={`hsk-test-level-hero-img${art.artDark ? " hsk-test-level-hero-img--light" : ""}`}
          priority
          draggable={false}
        />
        {art.artDark && (
          <Image
            src={art.artDark}
            alt=""
            width={art.w}
            height={art.h}
            sizes={HERO_ART_SIZES}
            className="hsk-test-level-hero-img hsk-test-level-hero-img--dark"
            // Dark-theme variant: shown only under [data-theme="dark"]. `lazy`
            // keeps it OUT of the <head> preload (a bare next/image `eager`
            // still emits one), so the light-theme majority don't fetch a
            // display:none image that would compete with the real LCP hero.
            // It's not in a container-query context (unlike the level cards), so
            // lazy is safe here, and dark-theme users get it immediately since
            // the hero sits in the initial viewport.
            loading="lazy"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
