import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import WordCard from "@/components/content/WordCard";
import DictionarySearch from "@/components/content/DictionarySearch";
import {
  getPublicHskLevelTerms,
  getPublicHskVersions,
} from "@/lib/content/dictionary";
import {
  formatWordCountRu,
  hskVersionLabel,
  hskVersionSlug,
  normalizeHskVersionParam,
} from "@/lib/content/labels";
import { platformLinks } from "@/lib/content/platform-links";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import { createBreadcrumbNode } from "@/lib/schema";

export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ version: string; level: string }>> {
  const versions = await getPublicHskVersions();
  return versions.flatMap((version) =>
    version.decks.map((deck) => ({
      version: hskVersionSlug(version.id),
      level: deck.hskLevel,
    })),
  );
}

type Props = {
  params: Promise<{ version: string; level: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { version: versionParam, level } = await params;
  const sp = await searchParams;
  const query = readParam(sp.q).trim();
  const version = normalizeHskVersionParam(versionParam);
  if (!version) {
    return {
      ...buildMetadata({
        title: "Уровень HSK не найден | ChinaChild",
        description: "Запрошенный уровень HSK не существует.",
        path: "/dictionary/hsk",
      }),
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl("/dictionary/hsk") },
    };
  }
  const versionLabel = hskVersionLabel(version);
  const heading = version === "3.0" ? `Новый HSK ${level}` : `HSK ${level}`;
  const path = `/dictionary/hsk/${versionParam}/${level}`;
  const versions = await getPublicHskVersions();
  const versionSummary = versions.find((candidate) => candidate.id === version);
  const hasLevel = versionSummary?.decks.some((deck) => deck.hskLevel === level) ?? false;
  if (!hasLevel) {
    const versionPath = `/dictionary/hsk/${versionParam}`;
    return {
      ...buildMetadata({
        title: "Уровень HSK не найден | ChinaChild",
        description: "Запрошенный уровень HSK не существует.",
        path: versionPath,
      }),
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl(versionPath) },
    };
  }
  const metadata = buildMetadata({
    title: `${heading} — список слов с пиньинем и переводом | ChinaChild`,
    description: `Полный список слов уровня ${heading} (${versionLabel}). Пиньинь, переводы и примеры — бесплатно и без регистрации.`,
    path,
    keywords: [heading.toLowerCase(), "HSK слова", "китайский словарь", "пиньинь"],
  });
  if (!query) return metadata;
  return {
    ...metadata,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: { canonical: absoluteUrl(path) },
  };
}

export default async function HskLevelPage({ params, searchParams }: Props) {
  const { version: versionParam, level } = await params;
  const sp = await searchParams;
  const version = normalizeHskVersionParam(versionParam);
  if (!version) notFound();
  const query = readParam(sp.q);

  const data = await getPublicHskLevelTerms(version, level, {
    query: query || undefined,
  });
  if (!data) notFound();
  const { deck, terms, totalImported } = data;
  const planned = deck.displayCount ?? 0;
  const heading = version === "3.0" ? `Новый HSK ${level}` : `HSK ${level}`;
  const basePath = `/dictionary/hsk/${versionParam}/${level}`;
  const url = absoluteUrl(basePath);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        name: heading,
        url,
        inLanguage: "ru-RU",
        description: deck.description ?? undefined,
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          { name: "HSK", path: "/dictionary/hsk" },
          { name: hskVersionLabel(version), path: `/dictionary/hsk/${versionParam}` },
          { name: heading, path: basePath },
        ]),
        "@id": `${url}#breadcrumb`,
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          { name: "HSK", path: "/dictionary/hsk" },
          { name: hskVersionLabel(version), path: `/dictionary/hsk/${versionParam}` },
          { name: heading, path: basePath },
        ]}
      />
      <JsonLd data={graph} id={`hsk-${versionParam}-${level}-graph`} />

      <PageHero
        variant="lime"
        eyebrow={hskVersionLabel(version)}
        title={heading}
        description={
          planned > 0
            ? `Список из ${formatWordCountRu(planned)} уровня ${heading}. Пиньинь, переводы и примеры.`
            : `Список слов уровня ${heading} с пиньинем и переводами.`
        }
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все уровни шкалы", href: `/dictionary/hsk/${versionParam}` }}
      />

      <section className="page-shell-wide section-space">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">
              Слова уровня
            </h2>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              {planned > 0 ? `В плане ${formatWordCountRu(planned)}. ` : ""}
              {totalImported > 0
                ? `Уже загружено: ${totalImported}.`
                : "Импорт production-списка скоро."}
            </p>
          </div>
          <DictionarySearch
            basePath={basePath}
            initialQuery={query}
            placeholder="Ищи слово, pinyin или перевод"
          />
        </header>

        {terms.length === 0 ? (
          <p className="text-sm text-[#9a9a9a]">
            {totalImported === 0
              ? "Слова этого уровня появятся после импорта production-словаря."
              : "По этому запросу ничего не нашли. Попробуйте другой."}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {terms.map((word) => (
              <li key={word.id}>
                <WordCard word={word} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-white">
            Учите эти слова на платформе
          </h2>
          <p className="mt-3 text-base leading-7 text-white/85">
            Интерактивные карточки SRS, аудио, тренажёр написания иероглифов и прогресс — всё в одном месте.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={platformLinks.vocabularyHskLevel(versionParam, level)}
              target="_blank"
              rel="noreferrer"
              className="btn-pill btn-white"
            >
              Открыть уровень в платформе
            </a>
            <Link
              href="/free-trial"
              className="btn-pill"
              data-floating-cta-suppress="true"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              Записаться на пробный урок
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
