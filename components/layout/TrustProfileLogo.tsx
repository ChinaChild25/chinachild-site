"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type TrustLogoAsset = {
  onDark?: string;
  onLight?: string;
  fallback: string;
  width: number;
  height: number;
  invertOnDark?: boolean;
};

type TrustProfileLogoProps = {
  label: string;
  logo: TrustLogoAsset;
  surface?: "dark" | "light";
};

export default function TrustProfileLogo({
  label,
  logo,
  surface = "dark",
}: TrustProfileLogoProps) {
  const [failedSrcs, setFailedSrcs] = useState<string[]>([]);
  const sources = useMemo(
    () =>
      surface === "dark"
        ? [logo.onDark, logo.fallback, logo.onLight].filter(Boolean)
        : [logo.onLight, logo.fallback, logo.onDark].filter(Boolean),
    [logo.fallback, logo.onDark, logo.onLight, surface],
  ) as string[];
  const src = sources.find((candidate) => !failedSrcs.includes(candidate));
  const visualHeight = 24;
  const visualWidth = Math.round((logo.width / logo.height) * visualHeight);
  const shouldInvert = surface === "dark" && logo.invertOnDark;

  if (!src) {
    return (
      <span aria-hidden className="text-sm font-semibold leading-none">
        {label}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="relative block shrink-0"
      style={{ height: visualHeight, width: visualWidth }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${visualWidth}px`}
        className={[
          "object-contain",
          shouldInvert ? "brightness-0 invert" : "",
        ].join(" ")}
        unoptimized
        onError={() => setFailedSrcs((prev) => [...prev, src])}
      />
    </span>
  );
}
