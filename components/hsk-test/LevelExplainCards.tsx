"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * «Как работает тест HSK N» — three full-width cards that stack on scroll on
 * desktop (Praktikum «Как вы будете учиться») and collapse into a horizontal
 * swipe carousel on mobile. Pixel-matched to Figma:
 *   card  1400×640  r20  #F0F0F0  (no shadow)
 *   sky   665×595   r10  sky.png  (inset 22px, right half)
 *   mock  565×340   r20  #4B8CCB  (centered in the sky)
 *   title Inter 400 40px / body Inter 400 20px, tracking −5%
 * Badges are the ready-made icon1/2/3.png assets. See `.hsk-explain*` in
 * globals.css. Pure CSS, no JS.
 */
export type ExplainSample = {
  q: string;
  options: string[];
  /** Index of the option shown as selected in the mock. */
  correct: number;
};

type Props = {
  level: number;
  /** Card 1 body. */
  intro: string;
  /** Card 2 checklist (short phrases). */
  skills: string[];
  /** Card 3 sample question. */
  sample: ExplainSample;
};

const AREAS = ["Лексика", "Грамматика", "Чтение", "Аудирование"];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.4l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Card({
  i,
  icon,
  title,
  body,
  children,
}: {
  i: number;
  icon: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="hsk-explain-card" style={{ "--i": i } as CSSProperties}>
      <div className="hsk-explain-text">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt=""
          aria-hidden
          className="hsk-explain-badge"
          loading="lazy"
          draggable={false}
        />
        <h3 className="hsk-explain-title">{title}</h3>
        <p className="hsk-explain-lead">{body}</p>
      </div>
      <div className="hsk-explain-panel">
        <div className="hsk-explain-mock">{children}</div>
      </div>
    </article>
  );
}

/**
 * Scroll-driven depth: as later cards rise to cover the ones before them, the
 * covered cards scale down and dim, receding into space (Praktikum). The shrink
 * compounds per layer, so the deepest card is smallest — that's what gives the
 * stepped, 3D-stack look instead of a flat pile. Desktop only; cleared on mobile
 * (carousel) and for reduced-motion users. rAF-throttled, no library.
 */
function useStackDepth(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".hsk-explain-card"),
    );
    if (cards.length < 2) return;

    const desktop = window.matchMedia("(min-width: 860px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const SHRINK = 0.07; // per covering layer

    const cs = getComputedStyle(root);
    const base = parseFloat(cs.getPropertyValue("--stack-top")) || 84;
    const step = parseFloat(cs.getPropertyValue("--stack-step")) || 18;

    let raf = 0;
    const clear = () =>
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.filter = "";
      });

    const update = () => {
      raf = 0;
      if (!desktop.matches || reduce.matches) return clear();

      // How "pinned" each card is (0 → still rising, 1 → fully pinned).
      const pinned = cards.map((c, j) => {
        const T = base + j * step;
        const r = c.getBoundingClientRect();
        const top = r.top;
        // ramps over the last card-height of scroll before it reaches its pin
        return Math.min(1, Math.max(0, (T + r.height - top) / r.height));
      });

      cards.forEach((c, i) => {
        // covered = sum of how pinned every later card is
        let covered = 0;
        for (let j = i + 1; j < cards.length; j++) covered += pinned[j];
        const scale = 1 - covered * SHRINK;
        c.style.transform = covered ? `scale(${scale})` : "";
        c.style.filter = covered ? `brightness(${1 - covered * 0.04})` : "";
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, [rootRef]);
}

export default function LevelExplainCards({
  level,
  intro,
  skills,
  sample,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  useStackDepth(rootRef);

  return (
    <div className="hsk-explain" ref={rootRef}>
      {/* 1 — what the test measures */}
      <Card
        i={0}
        icon="/hsk-test/icon1.png"
        title={`Что проверяет тест HSK ${level}`}
        body={intro}
      >
        <span className="hsk-explain-mock-eyebrow">Что проверяем</span>
        <div className="hsk-explain-areas">
          {AREAS.map((a) => (
            <span className="hsk-explain-area" key={a}>
              {a}
            </span>
          ))}
        </div>
      </Card>

      {/* 2 — what you already can do */}
      <Card
        i={1}
        icon="/hsk-test/icon2.png"
        title={`На уровне HSK ${level} вы умеете`}
        body="Тест проверяет каждую из этих тем. Видно, что уже закрепилось, а что стоит повторить перед экзаменом."
      >
        <span className="hsk-explain-mock-eyebrow">Вы уже умеете</span>
        <ul className="hsk-explain-check">
          {skills.map((s) => (
            <li key={s}>
              <span className="hsk-explain-check-mark">
                <Check />
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 3 — how the test runs */}
      <Card
        i={2}
        icon="/hsk-test/icon3.png"
        title="Как проходит тест"
        body="10–20 вопросов от простого к сложному. Каждый ответ считается с весом по сложности, поэтому балл отражает реальный уровень. 5–10 минут, без регистрации."
      >
        <span className="hsk-explain-mock-eyebrow">Пример вопроса</span>
        <p className="hsk-explain-q">{sample.q}</p>
        <ul className="hsk-explain-opts">
          {sample.options.map((opt, i) => (
            <li className={i === sample.correct ? "is-on" : undefined} key={opt}>
              <span className="hsk-explain-opt-dot" aria-hidden />
              <span>{opt}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
