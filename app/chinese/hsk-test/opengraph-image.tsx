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

          <div style={{ display: "flex", gap: 12, fontSize: 22 }}>
            <Chip>HSK 1 · A1</Chip>
            <Chip>HSK 2 · A2</Chip>
            <Chip>HSK 3 · B1</Chip>
            <Chip>HSK 4 · B2</Chip>
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

function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "10px 16px",
        background: "#1b1b1b",
        borderRadius: 8,
        color: "#ffffff",
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
        padding: "10px 18px",
        background: "#1b1b1b",
        borderRadius: 8,
        color: "#ffffff",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}
