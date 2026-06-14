"use client";

import { useState } from "react";

type TestArtProps = {
  /** Asset base name — resolves to /hsk-test/<name>.<format>. */
  name: string;
  /** Empty alt = decorative (default). Pass alt to make it a real image. */
  alt?: string;
  className?: string;
  /** Decorative glyph shown in the placeholder before the real PNG exists. */
  glyph?: string;
};

const WEBP_ASSETS = new Set([
  "result-photo",
  "rings",
  "result-shapes",
  "shape-masks",
  "shape-spinner",
  "shape-folder",
  "shape-toggle",
]);

/**
 * Illustration slot for the HSK-test funnel.
 *
 * Renders /hsk-test/<name>.png if it exists; otherwise falls back to a tasteful
 * CSS placeholder (soft gradient panel + a large hanzi glyph + the asset name).
 * Drop a PNG/WebP named `<name>.png` into public/hsk-test/ and it appears with
 * no code change. See public/hsk-test/README.md for the asset list.
 */
export default function TestArt({ name, alt = "", className, glyph }: TestArtProps) {
  const [failed, setFailed] = useState(false);
  const format = WEBP_ASSETS.has(name) ? "webp" : "png";

  if (failed) {
    return (
      <div
        className={`hsk-art hsk-art-ph${className ? ` ${className}` : ""}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <span className="hsk-art-ph-glyph">{glyph ?? "汉"}</span>
        <span className="hsk-art-ph-name">{name}</span>
      </div>
    );
  }

  return (
    // Plain <img>: the file may not exist yet (graceful onError fallback) and
    // its intrinsic size is unknown, so next/image isn't a fit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/hsk-test/${name}.${format}`}
      alt={alt}
      className={`hsk-art hsk-art-img${className ? ` ${className}` : ""}`}
      onError={() => setFailed(true)}
      loading="lazy"
      draggable={false}
    />
  );
}
