import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Блог ChinaChild";

type Params = { params: Promise<{ slug: string }> };

export default async function BlogOgImage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  const title = post?.title ?? "Блог ChinaChild";
  const category = post?.category ?? "Блог";

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
          background: "#efeae0",
          color: "#1b1b1b",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          <div
            style={{
              padding: "10px 22px",
              background: "#ffffff",
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.035em",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#6b6b6b",
          }}
        >
          chinachild.ru / blog
        </div>
      </div>
    ),
    { ...size },
  );
}
