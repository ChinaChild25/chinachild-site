import { cn } from "@/lib/utils";

const tones = [
  { bg: "var(--violet-soft)", fg: "var(--violet)" },
  { bg: "var(--cream)", fg: "var(--foreground)" },
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
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const tone = pickTone(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize,
      }}
    >
      {initials || "·"}
    </div>
  );
}
