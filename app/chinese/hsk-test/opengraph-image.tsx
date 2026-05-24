import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          fontFamily: "Inter, sans-serif",
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
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#1b1b1b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              中
            </div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>ChinaChild · HSK+</div>
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
    { ...size },
  );
}

function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "10px 16px",
        background: "rgba(27,27,27,0.08)",
        borderRadius: 999,
        color: "#1b1b1b",
      }}
    >
      {children}
    </div>
  );
}
