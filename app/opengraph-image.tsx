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
            justifyContent: "space-between",
            gap: 24,
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.85 }}>
            chinachild.ru · HSK 1–6 · Лицензия Москвы
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              padding: "12px 24px",
              background: "#1b1b1b",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Записаться
          </div>
        </div>
      </div>
    ),
    getOgImageOptions(size),
  );
}
