import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 320,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          borderRadius: 80,
        }}
      >
        中
      </div>
    ),
    { ...size },
  );
}
