import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HSK 1–6 — хаб подготовки ChinaChild";

export default async function LearnHskOgImage() {
  const heroBytes = readFileSync(
    path.join(process.cwd(), "public", "heroes", "hsk.webp"),
  );
  const heroDataUrl = `data:image/webp;base64,${heroBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 80px",
          background: "#d8d3ff",
          color: "#1b1b1b",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#1b1b1b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              ЧЧ
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#1b1b1b" }}>
              ChinaChild
            </div>
          </div>
          <div
            style={{
              padding: "10px 22px",
              background: "rgba(27,27,27,0.08)",
              color: "#1b1b1b",
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Хаб подготовки к экзамену
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 3D-иллюстрация HSK 1134×499 → масштабируем до 940×414 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroDataUrl}
            alt=""
            width={940}
            height={414}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <div style={{ color: "#1b1b1b", opacity: 0.78 }}>
            6 уровней · от A1 до C2 · 150 → 5000 слов
          </div>
          <div style={{ color: "#1b1b1b", fontWeight: 600 }}>
            chinachild.ru / learn / hsk
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
