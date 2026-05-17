import Link from "next/link";
import type { GrammarArticleCard as GrammarArticleCardType } from "@/lib/content/types";
import { formatHskBadge, tagGroupLabel } from "@/lib/content/labels";

const CARD_PALETTE = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
];

const chipBase =
  "inline-flex items-center rounded-[10px] px-3 py-1.5 text-sm font-medium leading-none";
const chipMuted = "text-sm font-normal text-[#6b6b6b]";

export default function GrammarArticleCard({
  article,
  paletteIndex,
}: {
  article: GrammarArticleCardType;
  paletteIndex: number;
}) {
  const palette = CARD_PALETTE[paletteIndex % CARD_PALETTE.length];
  const badge = formatHskBadge(article.difficultyHskVersion, article.difficultyHskLevel);
  const tagChips = article.tags.slice(0, 3);
  const sectionNames = article.sections.slice(0, 2);

  return (
    <Link
      href={`/grammar/${article.slug}`}
      className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {badge ? (
          <span className={`${chipBase} bg-[#262626] text-white`}>{badge}</span>
        ) : null}
        {sectionNames.map((section) => (
          <span key={section.id} className={`${chipBase} bg-[#f3f0e8] text-[#262626]`}>
            {section.titleRu}
          </span>
        ))}
      </div>
      <h3 className="mt-4 text-[1.35rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
        {article.title}
      </h3>
      {article.summary ? (
        <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{article.summary}</p>
      ) : null}
      {tagChips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tagChips.map((tag) => (
            <li key={tag.id} className={`${chipBase} bg-[#f3f0e8] text-[#262626]`}>
              {tag.labelRu}
              <span className={`ml-1.5 ${chipMuted}`}>· {tagGroupLabel(tag.groupKey)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
        Открыть →
      </div>
    </Link>
  );
}
