import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5c5cff",
          color: "#ffffff",
          fontSize: 116,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
        }}
      >
        中
      </div>
    ),
    { ...size },
  );
}
