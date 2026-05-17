import Link from "next/link";
import { formatWordCountRu, hskVersionSlug } from "@/lib/content/labels";
import type { HskDeckSummary } from "@/lib/content/types";

const PALETTE = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
];

export default function HskDeckCard({
  deck,
  paletteIndex,
}: {
  deck: HskDeckSummary;
  paletteIndex: number;
}) {
  const palette = PALETTE[paletteIndex % PALETTE.length];
  const href = `/dictionary/hsk/${hskVersionSlug(deck.hskVersion)}/${deck.hskLevel}`;
  const planned = deck.displayCount ?? 0;
  const imported = deck.importedCount ?? 0;
  const showImported = imported > 0 && imported < planned;

  return (
    <Link
      href={href}
      className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette}`}
    >
      <span className="tag-pill tag-pill-ink self-start">{deck.title}</span>
      <p className="mt-6 text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-[#1b1b1b]">
        {planned > 0 ? formatWordCountRu(planned) : "Скоро"}
      </p>
      {showImported ? (
        <p className="mt-2 text-xs text-[#6b6b6b]">Загружено: {imported}</p>
      ) : null}
      {deck.description ? (
        <p className="mt-3 text-sm leading-[1.5] text-[#4b4b4b]">{deck.description}</p>
      ) : null}
      <div className="mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
        Открыть уровень →
      </div>
    </Link>
  );
}
