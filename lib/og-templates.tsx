import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

/* eslint-disable @next/next/no-img-element */

export type CourseOgInput = {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  accentColor: string;
  /** Background tone — passed through inline style */
  background: string;
};

export type GenericOgInput = {
  badge: string;
  title: string;
  subtitle: string;
  footer?: string;
  accentColor?: string;
  background?: string;
};

export type SectionOgInput = GenericOgInput & {
  imagePath: string;
  imageMime?: "image/jpeg" | "image/png";
};

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_FONT_FAMILY = "Inter";

let ogFonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] | null = null;
let logoDataUrl: string | null = null;

function getLogoDataUrl() {
  logoDataUrl ??=
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      readFileSync(path.join(process.cwd(), "public", "brand", "logo.svg"), "utf8"),
    );

  return logoDataUrl;
}

function getOgFonts() {
  ogFonts ??= [
    {
      name: OG_FONT_FAMILY,
      data: readFileSync(path.join(process.cwd(), "public", "fonts", "inter-regular.ttf")),
      weight: 400,
      style: "normal",
    },
    {
      name: OG_FONT_FAMILY,
      data: readFileSync(path.join(process.cwd(), "public", "fonts", "inter-semibold.ttf")),
      weight: 600,
      style: "normal",
    },
    {
      name: OG_FONT_FAMILY,
      data: readFileSync(path.join(process.cwd(), "public", "fonts", "inter-bold.ttf")),
      weight: 700,
      style: "normal",
    },
  ];

  return ogFonts;
}

function readPublicAssetDataUrl(assetPath: string, mime: string) {
  const cleanPath = assetPath.replace(/^\/+/, "");
  const bytes = readFileSync(path.join(process.cwd(), "public", cleanPath));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export function getOgImageOptions(size: { width: number; height: number } = OG_SIZE) {
  return {
    ...size,
    fonts: getOgFonts(),
  };
}

export const Logo = (): ReactElement => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <img
      src={getLogoDataUrl()}
      alt=""
      width={56}
      height={56}
      style={{
        width: 56,
        height: 56,
      }}
    />
    <div style={{ fontSize: 28, fontWeight: 600 }}>ChinaChild</div>
  </div>
);

export function renderCourseOg(input: CourseOgInput) {
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
          background: input.background,
          color: "#1b1b1b",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              padding: "12px 24px",
              background: input.accentColor,
              color: "#ffffff",
              borderRadius: 8,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {input.badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 1040,
            }}
          >
            {input.title}
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.78,
              maxWidth: 940,
              lineHeight: 1.3,
            }}
          >
            {input.subtitle}
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
          <div style={{ opacity: 0.65 }}>chinachild.ru</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.72)",
              color: "#1b1b1b",
              fontWeight: 700,
            }}
          >
            {input.price}
          </div>
        </div>
      </div>
    ),
    getOgImageOptions(),
  );
}

export function renderGenericOg(input: GenericOgInput) {
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
          background: input.background ?? "#f4f0e8",
          color: "#1b1b1b",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              padding: "12px 24px",
              background: input.accentColor ?? "#5c5cff",
              color: "#ffffff",
              borderRadius: 8,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {input.badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 1040,
            }}
          >
            {input.title}
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.78,
              maxWidth: 980,
              lineHeight: 1.3,
            }}
          >
            {input.subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, opacity: 0.65 }}>
          {input.footer ?? "chinachild.ru"}
        </div>
      </div>
    ),
    getOgImageOptions(),
  );
}

export function renderSectionOg(input: SectionOgInput) {
  const imageDataUrl = readPublicAssetDataUrl(input.imagePath, input.imageMime ?? "image/jpeg");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: input.background ?? "#f4f0e8",
          color: "#1b1b1b",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              padding: "12px 24px",
              background: input.accentColor ?? "#5c5cff",
              color: "#ffffff",
              borderRadius: 8,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {input.badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 58,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 610 }}>
            <div
              style={{
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.04em",
              }}
            >
              {input.title}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.78,
                lineHeight: 1.32,
              }}
            >
              {input.subtitle}
            </div>
          </div>

          <img
            src={imageDataUrl}
            alt=""
            width={380}
            height={380}
            style={{
              width: 380,
              height: 380,
              objectFit: "contain",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, opacity: 0.65 }}>
          {input.footer ?? "chinachild.ru"}
        </div>
      </div>
    ),
    getOgImageOptions(),
  );
}
