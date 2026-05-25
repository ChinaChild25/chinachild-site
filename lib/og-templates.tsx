import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

export type CourseOgInput = {
  badge: string;
  title: string;
  subtitle: string;
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

export const OG_SIZE = { width: 1200, height: 630 } as const;

const Logo = (): ReactElement => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "#5c5cff",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
        fontWeight: 700,
      }}
    >
      中
    </div>
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
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              padding: "12px 24px",
              background: input.accentColor,
              color: "#ffffff",
              borderRadius: 999,
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
            gap: 12,
            fontSize: 22,
            opacity: 0.65,
          }}
        >
          chinachild.ru
        </div>
      </div>
    ),
    { ...OG_SIZE },
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
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              padding: "12px 24px",
              background: input.accentColor ?? "#5c5cff",
              color: "#ffffff",
              borderRadius: 999,
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
    { ...OG_SIZE },
  );
}
