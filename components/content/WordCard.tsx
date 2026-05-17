import Link from "next/link";
import type { WordCard as WordCardType } from "@/lib/content/types";

export default function WordCard({ word }: { word: WordCardType }) {
  return (
    <Link
      href={`/dictionary/word/${word.slug}`}
      className="card-block card-cream-soft group flex h-full flex-col transition hover:-translate-y-0.5"
    >
      <p className="text-[2rem] font-medium leading-none text-[#1b1b1b]">{word.simplified}</p>
      {word.primaryPinyin ? (
        <p className="mt-2 text-sm text-[#6b6b6b]">{word.primaryPinyin}</p>
      ) : null}
      {word.primarySense ? (
        <p className="mt-3 text-sm leading-[1.5] text-[#4b4b4b]">{word.primarySense}</p>
      ) : null}
      {word.frequencyRank ? (
        <p className="mt-2 text-xs text-[#9a9a9a]">#{word.frequencyRank} в частотном списке</p>
      ) : null}
      <div className="mt-auto pt-4 text-xs font-medium text-[#262626] underline-offset-4 group-hover:underline">
        Открыть слово →
      </div>
    </Link>
  );
}
