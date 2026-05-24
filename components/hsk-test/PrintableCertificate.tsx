"use client";

import { forwardRef } from "react";
import { getHskTestLevel } from "@/lib/hsk-test/levels";
import type { HskTestLevel, HskTestResult } from "@/lib/hsk-test/types";

type Props = {
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
 * The certificate version that gets captured for the PNG download. Lives
 * offscreen via .hsk-test-print-stage so it doesn't affect layout. Uses
 * fixed pixel dimensions (1414×1000, the A4-landscape ratio at ~120dpi)
 * so the exported PNG is print-ready and looks the same on every screen.
 *
 * Why a separate component? The on-screen cert is compact (preview-sized);
 * the PNG needs to be a beautiful standalone artifact — bigger hanzi,
 * branded letterhead with the ChinaChild logo, more breathing room.
 */
const PrintableCertificate = forwardRef<HTMLDivElement, Props>(
  function PrintableCertificate({ result, name }, ref) {
    const meta = getHskTestLevel(result.recommendedLevel);
    const pct = Math.round(result.score * 100);
    const hanzi = LEVEL_HANZI[result.recommendedLevel];

    return (
      <div
        ref={ref}
        className="hsk-test-printable-cert"
        style={{ background: meta.color.base }}
      >
        {/* Massive hanzi as a background watermark — print-safe (Unicode
            glyph, no SVG animation), positioned with positive offsets so
            html-to-image can capture it cleanly. */}
        <span
          className="hsk-test-printable-cert-hanzi"
          style={{ color: meta.color.deep }}
          aria-hidden
        >
          {hanzi}
        </span>

        {/* Letterhead — logo + brand wordmark */}
        <div className="hsk-test-printable-cert-head">
          <div className="hsk-test-printable-cert-brand">
            <span className="hsk-test-printable-cert-logo" aria-hidden>
              {/* Inlined ChinaChild logo so html-to-image doesn't have to
                  fetch an external SVG (cross-origin issues during capture). */}
              <svg viewBox="0 0 150 150" width="64" height="64">
                <circle
                  cx="75"
                  cy="75"
                  r="72.75"
                  fill="#1A1A1A"
                  stroke="#1A1A1A"
                  strokeWidth="4.5"
                />
                <path
                  d="M67.33 111H55.42V89.22c-3.31 1.16-6.36 2.02-9.15 2.6-2.74.58-5.5.87-8.29.87-5.26 0-9.39-1.26-12.39-3.79-2.95-2.57-4.42-6.23-4.42-10.96V54.67h11.91v19.88c0 2.74.63 4.79 1.89 6.16 1.26 1.37 3.39 2.05 6.39 2.05 2.21 0 4.42-.24 6.63-.71 2.21-.48 4.68-1.19 7.41-2.13V54.67h11.92zM124.73 111h-11.91V89.22c-3.31 1.16-6.36 2.02-9.15 2.6-2.74.58-5.5.87-8.28.87-5.26 0-9.39-1.26-12.39-3.79-2.95-2.57-4.42-6.23-4.42-10.96V54.67h11.92v19.88c0 2.74.63 4.79 1.89 6.16 1.26 1.37 3.39 2.05 6.39 2.05 2.21 0 4.42-.24 6.63-.71 2.21-.48 4.68-1.19 7.41-2.13V54.67h11.91z"
                  fill="#FEFEFE"
                />
              </svg>
            </span>
            <div className="hsk-test-printable-cert-brandname">
              <div className="hsk-test-printable-cert-brand-title">ChinaChild</div>
              <div className="hsk-test-printable-cert-brand-sub">
                Школа китайского языка · HSK+
              </div>
            </div>
          </div>
          <div className="hsk-test-printable-cert-date">
            {formatDate(result.date)}
          </div>
        </div>

        {/* Body — the actual award */}
        <div className="hsk-test-printable-cert-body">
          <div className="hsk-test-printable-cert-eyebrow">
            Сертификат прохождения теста
          </div>
          <div className="hsk-test-printable-cert-name">
            {name || "Ученик ChinaChild"}
          </div>
          <div className="hsk-test-printable-cert-statement">
            подтвердил(а) уровень владения китайским языком
          </div>
          <div className="hsk-test-printable-cert-level">
            HSK {result.recommendedLevel}
            <span className="hsk-test-printable-cert-level-cefr">
              · CEFR {meta.cefr}
            </span>
          </div>
        </div>

        {/* Footer — metrics + sign-off */}
        <div className="hsk-test-printable-cert-foot">
          <div className="hsk-test-printable-cert-metric">
            <span className="hsk-test-printable-cert-metric-label">
              Правильных ответов
            </span>
            <span className="hsk-test-printable-cert-metric-value">
              {result.correctCount} из {result.totalCount}
            </span>
          </div>
          <div className="hsk-test-printable-cert-metric">
            <span className="hsk-test-printable-cert-metric-label">Балл</span>
            <span className="hsk-test-printable-cert-metric-value">{pct}%</span>
          </div>
          <div className="hsk-test-printable-cert-metric">
            <span className="hsk-test-printable-cert-metric-label">
              Объём программы
            </span>
            <span className="hsk-test-printable-cert-metric-value">
              {meta.vocabSize}
            </span>
          </div>
        </div>

        <div className="hsk-test-printable-cert-signoff">
          chinachild.ru · Лицензированная онлайн-школа
        </div>
      </div>
    );
  },
);

export default PrintableCertificate;
