import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getOgImageOptions, Logo, OG_FONT_FAMILY } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HSK 1–6 — хаб подготовки ChinaChild";

export default async function LearnHskOgImage() {
  const heroBytes = readFileSync(
    path.join(process.cwd(), "public", "heroes", "hsk-og.png"),
  );
  const heroDataUrl = `data:image/png;base64,${heroBytes.toString("base64")}`;

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
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <div
            style={{
              padding: "10px 22px",
              background: "rgba(27,27,27,0.08)",
              color: "#1b1b1b",
              borderRadius: 8,
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
            paddingTop: 18,
            paddingBottom: 44,
          }}
        >
          <img
            src={heroDataUrl}
            alt=""
            width={880}
            height={393}
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
    getOgImageOptions(size),
  );
}
