import { ImageResponse } from "next/og";
import { getHskTestLevelBySlug, hskTestLevels } from "@/lib/hsk-test/levels";

// Node.js runtime — required because we export generateStaticParams to
// prerender one image per level (edge runtime can't combine the two).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Тест на уровень HSK — ChinaChild";

// Next.js 15 passes route params as a Promise — must await them inside the
// generator. Without this, params.level is undefined and the image falls
// back to level 1 silently for every per-level page.
type Params = { params: Promise<{ level: string }> };

export async function generateStaticParams() {
  return hskTestLevels.map((l) => ({ level: l.slug }));
}

export default async function HskLevelOgImage({ params }: Params) {
  const { level } = await params;
  const meta = getHskTestLevelBySlug(level) ?? hskTestLevels[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 72,
          background: meta.color.base,
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
              {`Онлайн-тест · CEFR ${meta.cefr}`}
            </div>
            <div
              style={{
                fontSize: 84,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {`Тест HSK ${meta.level}`}
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.35,
                maxWidth: 720,
                color: "#1b1b1b",
              }}
            >
              {meta.blurb}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, fontSize: 22 }}>
            <Chip>{meta.vocabSize}</Chip>
            <Chip>{meta.hanziCount}</Chip>
            <Chip>{meta.hours}</Chip>
          </div>
        </div>

        <div
          style={{
            width: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 320,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: meta.color.deep,
          }}
        >
          {meta.level}
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
        background: "rgba(27,27,27,0.10)",
        borderRadius: 999,
        color: "#1b1b1b",
      }}
    >
      {children}
    </div>
  );
}
