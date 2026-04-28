import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ffffff",
              color: "#5c5cff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            中
          </div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>ChinaChild</div>
        </div>

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
              borderRadius: 999,
            }}
          >
            chinachild.ru
          </div>
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
            }}
          >
            HSK 1–6
          </div>
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
            }}
          >
            Лицензия Москвы
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
