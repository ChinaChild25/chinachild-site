import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import HskDeckCard from "@/components/content/HskDeckCard";
import DictionaryAboutInfo from "@/components/content/DictionaryAboutInfo";
import DictionaryHomeSearch from "@/components/content/DictionaryHomeSearch";
import DictionarySearchResults from "@/components/content/DictionarySearchResults";
import {
  getPublicDictionaryHomeData,
  searchPublicDictionary,
} from "@/lib/content/dictionary";
import { formatWordCountRu } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";

export const revalidate = 300;

type SP = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const query = readParam(sp.q).trim();
  const base = buildMetadata({
    title: query
      ? `Поиск по словарю — «${query}» | ChinaChild`
      : "Китайский словарь — HSK списки слов, пиньинь, переводы | ChinaChild",
    description: query
      ? `Результаты поиска по китайскому словарю ChinaChild: «${query}». Иероглифы, пиньинь, переводы и примеры.`
      : "Бесплатный китайский словарь ChinaChild: HSK 1–6 и Новый HSK 3.0, пиньинь, значения, примеры, аудио и карточки слов. Поиск по иероглифу и переводу.",
    path: query ? `/dictionary?q=${encodeURIComponent(query)}` : "/dictionary",
    keywords: query
      ? [query, "поиск китайский словарь", "китайские слова"]
      : ["китайский словарь", "HSK словарь", "Новый HSK", "пиньинь", "китайские иероглифы"],
  });
  // Search result pages are noindex to avoid generating low-value indexed
  // pages for every random query. The dictionary landing without a query
  // remains indexable.
  if (query) {
    return {
      ...base,
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl("/dictionary") },
    };
  }
  return base;
}

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const query = readParam(sp.q).trim();
  const [data, searchResult] = await Promise.all([
    getPublicDictionaryHomeData(),
    query ? searchPublicDictionary(query, 24) : Promise.resolve(null),
  ]);
  const versions = data.versions;

  const collectionSchema = query
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/dictionary")}#collection`,
        name: "Китайский словарь",
        url: absoluteUrl("/dictionary"),
        inLanguage: "ru-RU",
        description:
          "Списки слов HSK 1–6 и Нового HSK 1–7/9 с пиньинем и переводами. Бесплатный справочник китайских слов и иероглифов.",
      };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          ...(query ? [{ name: `Поиск: «${query}»`, path: `/dictionary?q=${encodeURIComponent(query)}` }] : []),
        ]}
      />
      {collectionSchema ? <JsonLd data={collectionSchema} id="dictionary-collection" /> : null}

      <PageHero
        variant="cream"
        eyebrow="Словарь"
        title="Китайский словарь"
        description="HSK-списки, pinyin, значения, примеры и карточки слов. Бесплатно, на русском."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Глоссарий терминов", href: "/glossary" }}
      />

      <section className="page-shell-wide section-space">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center">
          <DictionaryHomeSearch
            initialQuery={query}
            placeholder="Ищи слово, иероглиф, pinyin или перевод"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="text-xs text-[#9a9a9a]">
              Понимает иероглифы, pinyin с тонами, без тонов и тональные числа, а также русские
              переводы.
            </p>
            {!query ? <DictionaryAboutInfo /> : null}
          </div>
        </div>
      </section>

      {searchResult ? <DictionarySearchResults result={searchResult} /> : null}

      {!query
        ? versions.map((version) => {
            if (version.decks.length === 0) {
              return (
                <section key={version.id} className="page-shell-wide section-space">
                  <header className="mb-6">
                    <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
                      {version.label}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#4b4b4b]">{version.description}</p>
                  </header>
                  <p className="text-sm text-[#9a9a9a]">
                    Списки этого уровня появятся после импорта production-словаря.
                  </p>
                </section>
              );
            }
            return (
              <section key={version.id} className="page-shell-wide section-space">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-2xl">
                    <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
                      {version.label}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#4b4b4b]">{version.description}</p>
                  </div>
                  <p className="text-sm text-[#9a9a9a]">
                    Всего по плану: {formatWordCountRu(version.totalPlanned)}.
                    {version.totalImported > 0 ? ` Загружено: ${version.totalImported}.` : null}
                  </p>
                </header>
                <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {version.decks.map((deck, index) => (
                    <li key={deck.id}>
                      <HskDeckCard deck={deck} paletteIndex={index} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        : null}

      {!query ? (
        <section className="page-shell-wide section-space">
          <div className="card-block card-block-lg card-violet-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              1000 самых частотных китайских слов
            </h2>
            <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
              Частотный список появится после импорта production-словаря. Сейчас вы можете изучать
              слова по уровням HSK выше — они охватывают основу активного словарного запаса.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dictionary/hsk/new-hsk/1" className="btn-pill btn-ink">
                Начать с Нового HSK 1
              </Link>
              <Link href="/dictionary/hsk" className="btn-pill btn-white">
                Все версии HSK
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
