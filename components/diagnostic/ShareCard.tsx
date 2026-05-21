"use client";

import { useMemo, useState } from "react";
import type { DiagnosticResult, SkillProfile } from "@/lib/diagnostic/types";
import { ARCHETYPES } from "@/lib/diagnostic/archetypes";
import { track } from "@/lib/diagnostic/analytics";

interface Props {
  result: DiagnosticResult;
  siteUrl: string;
}

type Format = "story" | "square";

/**
 * Генерирует PNG-карточку из in-memory SVG, без сторонних библиотек.
 * SVG строится строкой, рендерится в Image, рисуется на canvas, toBlob → download.
 */
export default function ShareCard({ result, siteUrl }: Props) {
  const [busy, setBusy] = useState<Format | null>(null);
  const archetype = ARCHETYPES[result.archetype];

  const radarPath = useMemo(() => buildRadarPath(result.skills, 540, 540), [result.skills]);

  const download = async (format: Format) => {
    setBusy(format);
    try {
      const svg = buildSvgString({
        format,
        archetypeZh: archetype.zh,
        archetypeRu: archetype.ru,
        hsk: result.hsk,
        skills: result.skills,
        percentile: result.percentileVsCohort,
        url: `${siteUrl}/diagnostic?utm_source=share-card&utm_medium=${format}`,
      });
      const png = await svgToPng(svg, format);
      const blobUrl = URL.createObjectURL(png);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `chinese-fingerprint-${format}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      track({ name: "share_card_downloaded", params: { format } });
    } catch (err) {
      console.error("[share-card] export failed", err);
    } finally {
      setBusy(null);
    }
  };

  // Локальный preview радара
  return (
    <div>
      <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
        <button
          type="button"
          className="d-btn d-btn-compact"
          onClick={() => download("square")}
          disabled={busy !== null}
        >
          {busy === "square" ? "Готовлю…" : "Скачать карточку 1080×1080"}
        </button>
        <button
          type="button"
          className="d-btn d-btn-secondary d-btn-compact"
          onClick={() => download("story")}
          disabled={busy !== null}
        >
          {busy === "story" ? "Готовлю…" : "Скачать сториз 1080×1920"}
        </button>
      </div>
      <p className="d-small" style={{ maxWidth: 480 }}>
        Карточка готова для Instagram-сториз и Telegram. На ней ваш архетип, HSK,
        радар сильных навыков и QR-ссылка для друзей.
      </p>
      {/* Скрытый preview — используется только как «визуальная отладка» через CSS,
          в DOM остаётся для крайних кейсов, но display:none по умолчанию. */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <path d={radarPath} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG-builder + конвертер
// ---------------------------------------------------------------------------

function buildSvgString(opts: {
  format: Format;
  archetypeZh: string;
  archetypeRu: string;
  hsk: number;
  skills: SkillProfile;
  percentile: number;
  url: string;
}): string {
  const W = 1080;
  const H = opts.format === "story" ? 1920 : 1080;
  const isStory = opts.format === "story";

  const radarSize = isStory ? 620 : 520;
  const radarOffset = isStory ? 760 : 420;
  const radarCx = W / 2;
  const radarCy = radarOffset + radarSize / 2;
  const radarR = radarSize * 0.36;

  const angles = [0, 1, 2, 3, 4, 5].map((i) => -Math.PI / 2 + (i * Math.PI * 2) / 6);
  const axisKeys: (keyof SkillProfile)[] = ["hanzi", "tones", "grammar", "reading", "speed", "listening"];
  const axisLabels = ["字", "音", "语", "读", "速", "听"];

  const valuePts = axisKeys.map((k, i) => {
    const v = Math.max(0, Math.min(100, opts.skills[k])) / 100;
    const x = radarCx + radarR * v * Math.cos(angles[i]);
    const y = radarCy + radarR * v * Math.sin(angles[i]);
    return { x, y };
  });
  const valuePath = valuePts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const gridPolys = [0.25, 0.5, 0.75, 1].map((g) =>
    angles
      .map((a) => `${(radarCx + radarR * g * Math.cos(a)).toFixed(1)},${(radarCy + radarR * g * Math.sin(a)).toFixed(1)}`)
      .join(" "),
  );

  const labelEls = axisLabels.map((zh, i) => {
    const r = radarR + 36;
    const x = radarCx + r * Math.cos(angles[i]);
    const y = radarCy + r * Math.sin(angles[i]);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="24" fill="#0a0a0a" font-family="'Noto Sans SC','PingFang SC',sans-serif" text-anchor="middle" dominant-baseline="middle">${zh}</text>`;
  }).join("");

  const heroY = isStory ? 220 : 120;
  const hskY = heroY + 280;
  const archeY = heroY + 110;
  const archeRuY = heroY + 200;
  const percentileY = isStory ? 1500 : 880;
  const urlY = H - 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f5f0e8"/>

  <text x="${W / 2}" y="${archeY}" font-family="'Noto Sans SC','PingFang SC',sans-serif" font-size="${isStory ? 100 : 84}" font-weight="400" letter-spacing="-2" text-anchor="middle" fill="#0a0a0a">${esc(opts.archetypeZh)}</text>
  <text x="${W / 2}" y="${archeRuY}" font-size="${isStory ? 56 : 48}" text-anchor="middle" fill="#7a7a7a" letter-spacing="-1">${esc(opts.archetypeRu)}</text>

  <rect x="${W / 2 - 130}" y="${hskY - 80}" width="260" height="120" rx="60" fill="#d8d3ff"/>
  <text x="${W / 2}" y="${hskY + 4}" font-size="${isStory ? 76 : 64}" font-weight="400" text-anchor="middle" fill="#0a0a0a">HSK ${opts.hsk}</text>

  ${gridPolys.map((pts) => `<polygon points="${pts}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>`).join("")}
  ${angles
    .map((a) => {
      const x = radarCx + radarR * Math.cos(a);
      const y = radarCy + radarR * Math.sin(a);
      return `<line x1="${radarCx}" y1="${radarCy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>`;
    })
    .join("")}
  <path d="${valuePath}" fill="rgba(92,92,255,0.18)" stroke="#5c5cff" stroke-width="3" stroke-linejoin="round"/>
  ${valuePts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#5c5cff"/>`).join("")}
  ${labelEls}

  <text x="${W / 2}" y="${percentileY}" font-size="${isStory ? 36 : 30}" text-anchor="middle" fill="#0a0a0a">Сильнее ${opts.percentile}% изучающих с тем же стажем</text>

  <line x1="${W / 2 - 200}" y1="${urlY - 70}" x2="${W / 2 + 200}" y2="${urlY - 70}" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>
  <text x="${W / 2}" y="${urlY - 30}" font-size="26" text-anchor="middle" fill="#7a7a7a">Узнайте свой архетип китаиста:</text>
  <text x="${W / 2}" y="${urlY + 10}" font-size="${isStory ? 32 : 28}" text-anchor="middle" fill="#0a0a0a" font-weight="500">${esc(opts.url.replace(/^https?:\/\//, ""))}</text>
</svg>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function svgToPng(svg: string, format: Format): Promise<Blob> {
  const W = 1080;
  const H = format === "story" ? 1920 : 1080;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e instanceof Event ? new Error("image load failed") : new Error(String(e)));
    img.src = src;
  });
}

function buildRadarPath(skills: SkillProfile, w: number, h: number) {
  // Reuse same math as inside buildSvgString — keeps a no-op preview path
  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.36;
  const axisKeys: (keyof SkillProfile)[] = ["hanzi", "tones", "grammar", "reading", "speed", "listening"];
  const angles = axisKeys.map((_, i) => -Math.PI / 2 + (i * Math.PI * 2) / 6);
  const pts = axisKeys.map((k, i) => {
    const v = Math.max(0, Math.min(100, skills[k])) / 100;
    return { x: cx + r * v * Math.cos(angles[i]), y: cy + r * v * Math.sin(angles[i]) };
  });
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
}
