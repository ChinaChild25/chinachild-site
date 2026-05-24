"use client";

import { forwardRef } from "react";
import { getHskTestLevel } from "@/lib/hsk-test/levels";
import type { HskTestLevel, HskTestResult } from "@/lib/hsk-test/types";

type CertificateProps = {
  result: HskTestResult;
  name?: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const LEVEL_HANZI: Record<HskTestLevel, string> = {
  1: "你",
  2: "学",
  3: "想",
  4: "题",
};

/**
 * Certificate card shown both on-screen and captured for PNG export.
 *
 * For PNG export we cannot use HanziStroke (hanzi-writer streams an animated
 * SVG and captures mid-stroke states as blurry blobs in html-to-image).
 * Instead we render the hanzi as a single large Unicode glyph positioned
 * inside the card's safe area — captures clean at any pixel ratio.
 */
const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  function Certificate({ result, name }, ref) {
    const meta = getHskTestLevel(result.recommendedLevel);
    const pct = Math.round(result.score * 100);

    return (
      <div ref={ref} className="hsk-test-cert">
        <div className="hsk-test-cert-body">
          <span className="hsk-test-cert-eyebrow">Сертификат ChinaChild · HSK+</span>
          <div className="hsk-test-cert-level">HSK {result.recommendedLevel}</div>
          <div className="hsk-test-cert-name">
            {name ? name : "Ваш уровень китайского"}
          </div>
          <div className="hsk-test-cert-score">
            {result.correctCount} из {result.totalCount} верно · {pct}%
          </div>
          <div className="hsk-test-cert-row">
            <span className="hsk-test-cert-chip">CEFR {meta.cefr}</span>
            <span className="hsk-test-cert-chip">{meta.vocabSize}</span>
            <span className="hsk-test-cert-chip">{formatDate(result.date)}</span>
          </div>
        </div>
        <div
          className="hsk-test-cert-hanzi-static"
          style={{ color: meta.color.deep }}
          aria-hidden
        >
          {LEVEL_HANZI[result.recommendedLevel]}
        </div>
      </div>
    );
  },
);

export default Certificate;
