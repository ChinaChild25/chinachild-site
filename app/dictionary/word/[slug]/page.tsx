import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import AudioButton from "@/components/content/AudioButton";
import StrokeOrderPreview from "@/components/content/StrokeOrderPreview";
import {
  getPublicWordBySlug,
  getPublicWordSlugs,
} from "@/lib/content/dictionary";
import { getPublicGrammarRelatedForTerm } from "@/lib/content/grammar";
import {
  formatExampleCountRu,
  formatHskBadge,
  hskVersionSlug,
} from "@/lib/content/labels";
import { platformLinks } from "@/lib/content/platform-links";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import { wordHanziDisplayClass } from "@/lib/content/word-hanzi-size";
import { createBreadcrumbNode } from "@/lib/schema";

// Fully static (no runtime ISR writes): every public word is rendered during the
// deployment build and refreshed only by the next deploy. Search engines can
// crawl the complete sitemap without lazily creating hundreds of cache entries.
export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getPublicWordSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const word = await getPublicWordBySlug(slug);
  if (!word) {
    return {
      ...buildMetadata({
        title: "Слово не найдено | Словарь ChinaChild",
        description: "Запрошенное слово отсутствует в словаре.",
        path: "/dictionary",
      }),
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl("/dictionary") },
    };
  }
  const meaning = word.primarySense ?? word.baseTranslationRu ?? "значение, пиньинь и примеры";
  const pinyin = word.primaryPinyin ? ` (${word.primaryPinyin})` : "";
  return buildMetadata({
    title: `${word.simplified}${pinyin} — ${meaning} | Китайский словарь ChinaChild`,
    description: `${word.simplified}${pinyin}: ${meaning}. Пиньинь, перевод, примеры, аудио и HSK-уровни в словаре ChinaChild.`,
    path: `/dictionary/word/${word.slug}`,
    keywords: [word.simplified, word.primaryPinyin ?? "", "китайский словарь", "перевод"].filter(Boolean),
  });
}

export default async function WordDetailPage({ params }: Props) {
  const { slug } = await params;
  const word = await getPublicWordBySlug(slug);
  if (!word) notFound();

  const relatedGrammar = await getPublicGrammarRelatedForTerm({
    slug: word.slug,
    simplified: word.simplified,
    defaultDisplay: word.defaultDisplay,
  });

  const url = absoluteUrl(`/dictionary/word/${word.slug}`);
  const firstHsk = word.hskBadges[0];
  const alternateNames = [word.traditional, word.primaryPinyin].filter(Boolean);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${url}#term`,
        name: word.simplified,
        alternateName: alternateNames.length > 0 ? alternateNames : undefined,
        description: word.primarySense ?? word.baseTranslationRu ?? undefined,
        url,
        inLanguage: ["zh", "ru-RU"],
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Китайский словарь ChinaChild",
          url: absoluteUrl("/dictionary"),
        },
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          { name: word.simplified, path: `/dictionary/word/${word.slug}` },
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
          { name: word.simplified, path: `/dictionary/word/${word.slug}` },
        ]}
      />
      <JsonLd data={graph} id={`word-${word.slug}-graph`} />

      <article className="page-shell-wide section-space pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <header className="card-block card-block-lg flex h-full flex-col bg-white text-center lg:text-left">
            {word.hskBadges.length > 0 || word.frequencyRank ? (
              <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-end">
                {word.hskBadges.map((badge) => {
                  const label = formatHskBadge(badge.version, badge.level);
                  if (!label) return null;
                  return (
                    <Link
                      key={`${badge.version}-${badge.level}`}
                      href={`/dictionary/hsk/${hskVersionSlug(badge.version)}/${badge.level}`}
                      className="inline-flex items-center rounded-[10px] bg-[#f8f7f2] px-3 py-1.5 text-sm font-medium text-[#262626] transition-colors hover:bg-[#ece8df]"
                    >
                      {label}
                    </Link>
                  );
                })}
                {word.frequencyRank ? (
                  <span className="inline-flex items-center rounded-[10px] border border-[#e8e3da] bg-white px-3 py-1.5 text-sm font-medium text-[#4b4b4b]">
                    Частотность #{word.frequencyRank}
                  </span>
                ) : null}
              </div>
            ) : null}
            <p className={`${wordHanziDisplayClass} text-[#1b1b1b]`}>
              {word.simplified}
            </p>
            {word.traditional && word.traditional !== word.simplified ? (
              <p className="mt-3 text-sm text-[#9a9a9a]">
                Традиционное написание: <span className="text-[#4b4b4b]">{word.traditional}</span>
              </p>
            ) : null}
            {word.primaryPinyin || word.audioUrl ? (
              <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-4 lg:justify-end">
                {word.primaryPinyin ? (
                  <p className="text-2xl font-medium text-[#262626]">{word.primaryPinyin}</p>
                ) : null}
                {word.audioUrl ? (
                  <AudioButton
                    src={word.audioUrl}
                    ariaLabel="Прослушать слово"
                    size="md"
                    variant="primary"
                  />
                ) : null}
              </div>
            ) : null}
          </header>

          <StrokeOrderPreview
            characters={word.characters.map(({ hanzi, strokes, medians }) => ({
              hanzi,
              strokes,
              medians,
            }))}
            className="h-full"
          />

          {word.senses.length > 0 ? (
            <section className="card-block h-full bg-white">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Значения</h2>
              <ol className="mt-4 space-y-3 text-base leading-7 text-[#262626]">
                {word.senses.map((sense, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#9a9a9a]">{index + 1}.</span>
                    <span>{sense.definition}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : word.baseTranslationRu ? (
            <section className="card-block h-full bg-white">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Значение</h2>
              <p className="mt-4 text-base leading-7 text-[#262626]">{word.baseTranslationRu}</p>
            </section>
          ) : null}

          {word.characters.length > 0 ? (
            <section className="card-block h-full bg-white">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                Иероглифы в слове
              </h2>
              <ul className="mt-4 flex flex-wrap gap-4">
                {word.characters.map((char) => (
                  <li key={char.hanzi}>
                    <span className="text-4xl font-medium text-[#1b1b1b]">{char.hanzi}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {word.pronunciations.length > 1 ? (
          <section className="card-block mt-8 bg-white">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Произношение</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {word.pronunciations.map((pron, index) => (
                <li key={index} className="tag-pill bg-[#f8f7f2]">
                  {pron.pinyinDisplay}
                  {pron.isPrimary ? " · основное" : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {word.examples.length > 0 ? (
            <section>
              <h2 className="text-[1.35rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                Примеры — {formatExampleCountRu(word.examples.length)}
              </h2>
              <ol className="mt-4 space-y-3">
                {word.examples.map((example, index) => (
                  <li
                    key={index}
                    className="content-surface-card flex items-start justify-between gap-3 rounded-[var(--radius-card-md)] bg-white px-5 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[1.35rem] font-medium leading-snug text-[#1b1b1b]">
                        {example.hanzi}
                      </p>
                      {example.pinyin ? (
                        <p className="mt-1.5 text-sm italic text-[#5a5a5a]">{example.pinyin}</p>
                      ) : null}
                      {example.translationRu ? (
                        <p className="mt-2 text-[15px] leading-[1.55] text-[#3a3a3a]">
                          {example.translationRu}
                        </p>
                      ) : null}
                    </div>
                    {example.audioUrl ? (
                      <AudioButton
                        src={example.audioUrl}
                        ariaLabel="Прослушать пример"
                        size="md"
                        variant="primary"
                        className="mt-1"
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {relatedGrammar.length > 0 ? (
            <section>
              <h2 className="text-[1.35rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                Связанные правила
              </h2>
              <ul className="mt-4 grid gap-3">
                {relatedGrammar.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/grammar/${article.slug}`}
                      className="card-block card-sky group flex h-full flex-col transition hover:-translate-y-0.5"
                    >
                      <p className="text-base font-medium leading-tight text-[#1b1b1b]">
                        {article.title}
                      </p>
                      {article.summary ? (
                        <p className="mt-2 text-sm leading-[1.5] text-[#4b4b4b]">{article.summary}</p>
                      ) : null}
                      <span className="mt-auto pt-3 text-xs font-medium text-[#262626] underline-offset-4 group-hover:underline">
                        Открыть правило →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="mt-12">
          <div className="card-block card-block-lg card-ink">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-white">
              Учите это слово в платформе
            </h2>
            <p className="mt-3 text-base leading-7 text-white/85">
              Сохраняйте слова в карточки, повторяйте их по SRS, тренируйте письмо и следите за личным прогрессом.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={platformLinks.vocabularyWord(word.slug)}
                target="_blank"
                rel="noreferrer"
                className="btn-pill btn-white"
              >
                Добавить в карточки на платформе
              </a>
              <a
                href={platformLinks.vocabularyTrain()}
                target="_blank"
                rel="noreferrer"
                className="btn-pill"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                Тренировать написание
              </a>
              {firstHsk ? (
                <Link
                  href={`/dictionary/hsk/${hskVersionSlug(firstHsk.version)}/${firstHsk.level}`}
                  className="btn-pill"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  Назад к уровню
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}
