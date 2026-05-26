import { ImageResponse } from "next/og";
import { getOgImageOptions, Logo, OG_FONT_FAMILY } from "@/lib/og-templates";
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
            <Cta>Пройти тест</Cta>
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
