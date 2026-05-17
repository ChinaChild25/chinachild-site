import Link from "next/link";
import { formatHskBadge, formatWordCountRu, hskVersionSlug } from "@/lib/content/labels";
import type { DictionarySearchResult } from "@/lib/content/types";

const MATCH_LABEL: Record<string, string> = {
  hanzi: "Иероглиф",
  pinyin: "Пиньинь",
  meaning: "Перевод",
  sense: "Значение",
};

export default function DictionarySearchResults({
  result,
}: {
  result: DictionarySearchResult;
}) {
  if (result.hits.length === 0) {
    return (
      <section className="page-shell-wide section-space" aria-live="polite">
        <header className="mb-6">
          <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
            Результаты поиска
          </h2>
          <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
            По запросу{" "}
            <span className="font-medium text-[#262626]">«{result.query}»</span> ничего не найдено.
          </p>
        </header>
        <div className="card-block card-cream-soft max-w-2xl">
          <p className="text-base leading-7 text-[#4b4b4b]">
            Попробуй изменить запрос или открыть HSK-списки целиком. Поиск понимает иероглифы, pinyin
            с тонами и без, тональные числа и русские переводы.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dictionary/hsk/new-hsk/1" className="btn-pill btn-pill-compact btn-ink">
              Открыть Новый HSK 1
            </Link>
            <Link href="/dictionary/hsk/hsk/1" className="btn-pill btn-pill-compact btn-white">
              Открыть HSK 1
            </Link>
            <Link href="/dictionary" className="btn-pill btn-pill-compact btn-white">
              К началу словаря
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell-wide section-space" aria-live="polite">
      <header className="mb-6">
        <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
          Результаты поиска
        </h2>
        <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
          Нашли {formatWordCountRu(result.total)} по запросу{" "}
          <span className="font-medium text-[#262626]">«{result.query}»</span>.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.hits.map((hit) => (
          <li key={hit.id}>
            <Link
              href={`/dictionary/word/${hit.slug}`}
              className="card-block card-cream-soft group flex h-full flex-col transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[2rem] font-medium leading-none text-[#1b1b1b]">
                  {hit.simplified}
                </span>
                <span className="tag-pill text-xs">{MATCH_LABEL[hit.matchedBy] ?? "Совпадение"}</span>
              </div>
              {hit.primaryPinyin ? (
                <p className="mt-2 text-sm text-[#6b6b6b]">{hit.primaryPinyin}</p>
              ) : null}
              {hit.primarySense ? (
                <p className="mt-3 text-sm leading-[1.5] text-[#4b4b4b]">{hit.primarySense}</p>
              ) : null}
              {hit.hskBadges.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {hit.hskBadges.map((badge) => {
                    const label = formatHskBadge(badge.version, badge.level);
                    if (!label) return null;
                    return (
                      <li key={`${badge.version}-${badge.level}`}>
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-[#4b4b4b]">
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <div className="mt-auto pt-4 text-xs font-medium text-[#262626] underline-offset-4 group-hover:underline">
                Открыть слово →
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {result.hits.length >= result.limit ? (
        <p className="mt-6 text-xs text-[#9a9a9a]">
          Показаны первые {result.limit}. Уточни запрос, чтобы увидеть точные совпадения.
        </p>
      ) : null}
    </section>
  );
}
