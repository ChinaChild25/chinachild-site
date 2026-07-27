import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import GrammarBlockRenderer from "@/components/content/GrammarBlockRenderer";
import { getPublicGrammarArticleBySlug, getPublicGrammarSlugs } from "@/lib/content/grammar";
import { formatHskBadge, tagGroupLabel } from "@/lib/content/labels";
import { platformLinks } from "@/lib/content/platform-links";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import { createBreadcrumbNode } from "@/lib/schema";

export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getPublicGrammarSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicGrammarArticleBySlug(slug);
  if (!article) {
    return {
      ...buildMetadata({
        title: "Статья не найдена | Грамматика ChinaChild",
        description: "Запрошенная статья отсутствует в справочнике.",
        path: "/grammar",
      }),
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl("/grammar") },
    };
  }
  const description =
    article.summary ?? `Правило китайской грамматики: ${article.title}. Объяснение и примеры.`;
  return buildMetadata({
    title: `${article.title} — грамматика китайского | ChinaChild`,
    description,
    path: `/grammar/${article.slug}`,
    keywords: [
      article.title.toLowerCase(),
      "китайская грамматика",
      ...article.tags.map((tag) => tag.labelRu.toLowerCase()),
    ],
  });
}

export default async function GrammarArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublicGrammarArticleBySlug(slug);
  if (!article) notFound();

  const url = absoluteUrl(`/grammar/${article.slug}`);
  const badge = formatHskBadge(article.difficultyHskVersion, article.difficultyHskLevel);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#article`,
        name: article.title,
        description: article.summary ?? undefined,
        url,
        inLanguage: "ru-RU",
        learningResourceType: "Правило грамматики",
        educationalLevel: badge ?? undefined,
        keywords: article.tags.map((tag) => tag.labelRu).join(", "),
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Грамматика", path: "/grammar" },
          { name: article.title, path: `/grammar/${article.slug}` },
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
          { name: "Грамматика", path: "/grammar" },
          { name: article.title, path: `/grammar/${article.slug}` },
        ]}
      />
      <JsonLd data={graph} id={`grammar-${article.slug}-graph`} />

      <article className="page-shell section-space pt-10" itemScope itemType="https://schema.org/LearningResource">
        <header className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag-pill bg-[#f1eee2]">Грамматика</span>
            {badge ? (
              <span className="tag-pill bg-[#262626] text-white">{badge}</span>
            ) : null}
            {article.sections.slice(0, 2).map((section) => (
              <span key={section.id} className="tag-pill bg-[#f1eee2]">
                {section.titleRu}
              </span>
            ))}
          </div>
          <h1
            className="mt-6 text-[2.4rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]"
            itemProp="name"
          >
            {article.title}
          </h1>
          {article.summary ? (
            <p className="mt-5 text-lg leading-[1.55] text-[#4b4b4b]" itemProp="description">
              {article.summary}
            </p>
          ) : null}
          {article.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {article.tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/grammar/tags/${tag.slug}`}
                    className="inline-flex items-center rounded-[10px] bg-[#f8f7f2] px-4 py-2 text-[15px] font-medium leading-none text-[#262626] transition-colors hover:bg-[#ece8df]"
                  >
                    {tag.labelRu}
                    <span className="ml-1.5 text-sm font-normal text-[#6b6b6b]">
                      · {tagGroupLabel(tag.groupKey)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <section className="mt-12">
          <GrammarBlockRenderer blocks={article.blocks} />
        </section>

        <aside className="mx-auto mt-12 max-w-3xl">
          <div className="card-block card-block-lg card-ink">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-white">
              Тренируйте это правило в платформе
            </h2>
            <p className="mt-3 text-base leading-7 text-white/85">
              В личном кабинете доступны интерактивные упражнения, аудио и карточки SRS — закрепите тему за неделю.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={platformLinks.grammarArticle(article.slug)}
                target="_blank"
                rel="noreferrer"
                className="btn-pill btn-white"
              >
                Открыть на платформе
              </a>
              <Link
                href="/free-trial"
                className="btn-pill"
                data-floating-cta-suppress="true"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                }}
              >
                Записаться на пробный урок
              </Link>
              <Link
                href="/grammar"
                className="btn-pill"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                }}
              >
                Все правила
              </Link>
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}
