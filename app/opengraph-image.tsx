import { ImageResponse } from "next/og";
import { getOgImageOptions, Logo, OG_FONT_FAMILY } from "@/lib/og-templates";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ChinaChild — онлайн-школа китайского языка";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#5c5cff",
          color: "#ffffff",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <Logo />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 980,
            }}
          >
            Онлайн-школа китайского языка
          </div>
          <div
            style={{
              fontSize: 32,
              opacity: 0.85,
              maxWidth: 920,
              lineHeight: 1.3,
            }}
          >
            Лицензированная программа HSK 1–2 — разговорный уровень за 6 месяцев
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 8,
            }}
          >
            chinachild.ru
          </div>
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 8,
            }}
          >
            HSK 1–6
          </div>
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 8,
            }}
          >
            Лицензия Москвы
          </div>
        </div>
      </div>
    ),
    getOgImageOptions(size),
  );
}
