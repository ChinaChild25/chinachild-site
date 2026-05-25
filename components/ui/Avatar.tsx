import Image from "next/image";
import { cn } from "@/lib/utils";

const tones = [
  { bg: "var(--violet-soft)", fg: "var(--violet)" },
  { bg: "#d8e9ff", fg: "#2a4a6e" },
  { bg: "var(--lime-soft)", fg: "#3a4d12" },
  { bg: "var(--sky)", fg: "#2a4a6e" },
  { bg: "var(--peach-soft)", fg: "#a04020" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function pickTone(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return tones[hash % tones.length];
}

export default function Avatar({
  name,
  className,
  size = 56,
  src,
  alt,
  title,
}: {
  name: string;
  className?: string;
  size?: number;
  /** Optional image URL (e.g. /team/<slug>.webp). When provided, renders
      the photo via next/image; otherwise falls back to coloured initials. */
  src?: string;
  /** SEO/E-E-A-T alt text. Defaults to `name` if not provided. */
  alt?: string;
  /** Tooltip on hover. */
  title?: string;
}) {
  const tone = pickTone(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);
  const altText = alt ?? name;

  if (src && src.length > 0) {
    return (
      <div
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          className,
        )}
        style={{ width: size, height: size, background: tone.bg }}
        title={title}
      >
        <Image
          src={src}
          alt={altText}
          width={size}
          height={size}
          // sizes явно указан, чтобы next/image сгенерировал responsive
          // набор: 1× для отображаемого размера + 2× для retina/HiDPI.
          // Без sizes Next.js серверит один resolution.
          sizes={`${size * 2}px`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={altText}
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight",
        className,
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: tone.bg,
        color: tone.fg,
        fontSize,
      }}
    >
      {initials || "·"}
    </div>
  );
}
