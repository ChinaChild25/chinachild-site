import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import GrammarArticleCard from "@/components/content/GrammarArticleCard";
import GrammarFilterBar from "@/components/content/GrammarFilterBar";
import GrammarLoadMore from "@/components/content/GrammarLoadMore";
import { getPublicGrammarHomeData } from "@/lib/content/grammar";
import { formatArticleCountRu } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";

export const revalidate = 86400;

export async function generateMetadata({ searchParams }: GrammarPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = readParam(params.q).trim();
  const tags = readParam(params.tags).trim();
  const limit = readParam(params.limit).trim();
  const hasFilters = Boolean(query || tags || limit);
  const metadata = buildMetadata({
    title: "Грамматика китайского языка — справочник и правила | ChinaChild",
    description:
      "Бесплатный справочник по грамматике китайского: схемы, конструкции, исключения, примеры с пиньинем и переводом. Уровни HSK 1–6 и Новый HSK 3.0.",
    path: "/grammar",
    keywords: [
      "грамматика китайского",
      "китайский язык правила",
      "HSK грамматика",
      "счётные слова",
      "порядок слов в китайском",
    ],
  });
  if (!hasFilters) return metadata;
  return {
    ...metadata,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: { canonical: absoluteUrl("/grammar") },
  };
}

type GrammarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function readNumberParam(value: string | string[] | undefined, fallback: number): number {
  const raw = readParam(value);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(parsed, 105));
}

export default async function GrammarPage({ searchParams }: GrammarPageProps) {
  const params = await searchParams;
  const query = readParam(params.q);
  const tagSlugs = readParam(params.tags).split(",").filter(Boolean);
  const limit = readNumberParam(params.limit, 21);

  const data = await getPublicGrammarHomeData({
    query: query || undefined,
    tagSlugs,
    limit,
  });

  const featuredTopics = data.featuredTopics;
  const articles = data.articles;
  const remaining = Math.max(0, data.totalArticles - articles.length);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/grammar")}#collection`,
    name: "Грамматика китайского языка",
    url: absoluteUrl("/grammar"),
    inLanguage: "ru-RU",
    description:
      "Справочник правил, схем и примеров грамматики китайского языка. Бесплатные материалы для самостоятельного изучения и подготовки к HSK.",
    hasPart: articles.map((article) => ({
      "@type": "LearningResource",
      "@id": `${absoluteUrl(`/grammar/${article.slug}`)}#article`,
      name: article.title,
      url: absoluteUrl(`/grammar/${article.slug}`),
      inLanguage: "ru-RU",
    })),
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Грамматика", path: "/grammar" },
        ]}
      />
      <JsonLd data={collectionSchema} id="grammar-collection" />
      <PageHero
        variant="violet"
        eyebrow="Грамматика"
        title="Грамматика китайского языка"
        description="Правила, схемы, примеры и объяснения для изучающих китайский. Структурированный справочник: от порядка слов до сложных конструкций."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все термины и понятия", href: "/glossary" }}
      />

      <section className="page-shell-wide section-space">
        <header className="mb-8 max-w-2xl">
          <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
            С чего начать
          </h2>
          <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
            Шесть базовых тем, без которых не обойтись на старте.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredTopics.map((topic, index) =>
            topic.article ? (
              <GrammarArticleCard
                key={topic.key}
                article={{ ...topic.article, title: topic.title, summary: topic.description }}
                paletteIndex={index}
              />
            ) : (
              <div
                key={topic.key}
                className={`card-block opacity-80 ${[
                  "card-violet-soft",
                  "card-cream",
                  "card-lime-soft",
                  "card-sky",
                  "card-peach-soft",
                  "card-cream-soft",
                ][index % 6]}`}
              >
                <div className="flex flex-wrap gap-2">
                  {topic.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center rounded-[10px] bg-white/95 px-3 py-1.5 text-sm font-medium leading-none text-[#262626]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-[1.35rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
                  {topic.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{topic.description}</p>
                <p className="mt-6 text-xs text-[#9a9a9a]">Статья скоро появится.</p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <header className="mx-auto mb-6 flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.015em] text-[#1b1b1b]">
            Все правила
          </h2>
          <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
            Найдено {formatArticleCountRu(data.totalArticles)}. Используйте теги и поиск, чтобы
            сузить выборку.
          </p>
          <Link href="/grammar/tags" className="btn-pill btn-pill-compact btn-white mt-4">
            Все теги
          </Link>
        </header>

        <GrammarFilterBar groups={data.filters} initialQuery={query} />

        {articles.length === 0 ? (
          <p className="mt-12 text-sm text-[#9a9a9a]">
            Ничего не нашли. Попробуйте сбросить фильтры или другой запрос.
          </p>
        ) : (
          <>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article, index) => (
                <li key={article.id}>
                  <GrammarArticleCard article={article} paletteIndex={index} />
                </li>
              ))}
            </ul>
            {remaining > 0 ? (
              <GrammarLoadMore nextLimit={limit + 21} remaining={remaining} />
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
