import { ImageResponse } from "next/og";
import { getOgImageOptions, Logo, OG_FONT_FAMILY } from "@/lib/og-templates";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Тест на уровень HSK онлайн — ChinaChild";

export default async function HskTestOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 72,
          background: "#d8d3ff",
          color: "#1b1b1b",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo />
            <div
              style={{
                padding: "12px 24px",
                background: "#1b1b1b",
                color: "#ffffff",
                borderRadius: 8,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Тест HSK
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 22,
                opacity: 0.7,
              }}
            >
              Бесплатный онлайн-тест
            </div>
            <div
              style={{
                fontSize: 76,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                maxWidth: 760,
              }}
            >
              Тест на уровень HSK 1–4 за 10 минут
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.35,
                maxWidth: 720,
                color: "#2a2a2a",
              }}
            >
              Лексика · грамматика · чтение · понимание. Без регистрации, с разбором по навыкам.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 10,
                border: "1px solid rgba(255, 255, 255, 0.62)",
                borderRadius: 16,
                background: "rgba(255, 255, 255, 0.32)",
              }}
            >
              <LevelChip>HSK 1 · A1</LevelChip>
              <LevelChip>HSK 2 · A2</LevelChip>
              <LevelChip>HSK 3 · B1</LevelChip>
              <LevelChip>HSK 4 · B2</LevelChip>
            </div>
            <Cta>Пройти тест</Cta>
          </div>
        </div>

        <div
          style={{
            width: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 280,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "#1b1b1b",
            opacity: 0.92,
          }}
        >
          中
        </div>
      </div>
    ),
    getOgImageOptions(size),
  );
}

function LevelChip({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "8px 13px",
        background: "rgba(255, 255, 255, 0.54)",
        borderRadius: 9,
        color: "#1b1b1b",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function Cta({ children }: { children: string }) {
  return (
    <div
      style={{
        width: 168,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px 24px",
        background: "#1b1b1b",
        borderRadius: 8,
        color: "#ffffff",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
