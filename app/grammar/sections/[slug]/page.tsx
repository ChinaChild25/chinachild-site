import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import GrammarArticleCard from "@/components/content/GrammarArticleCard";
import {
  getPublicGrammarSectionBySlug,
  getPublicGrammarSections,
} from "@/lib/content/grammar";
import { formatArticleCountRu } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";

export const revalidate = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const sections = await getPublicGrammarSections();
  return sections.map((section) => ({ slug: section.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { section } = await getPublicGrammarSectionBySlug(slug);
  if (!section) {
    return {
      ...buildMetadata({
        title: "Раздел не найден | Грамматика ChinaChild",
        description: "Запрошенный раздел отсутствует.",
        path: "/grammar",
      }),
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      alternates: { canonical: absoluteUrl("/grammar") },
    };
  }
  return buildMetadata({
    title: `Раздел «${section.titleRu}» — грамматика китайского | ChinaChild`,
    description:
      section.descriptionRu ??
      `Подборка статей грамматики раздела «${section.titleRu}». Бесплатно, на русском, с примерами.`,
    path: `/grammar/sections/${section.slug}`,
  });
}

export default async function GrammarSectionPage({ params }: Props) {
  const { slug } = await params;
  const { section, articles } = await getPublicGrammarSectionBySlug(slug);
  if (!section) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Грамматика", path: "/grammar" },
          { name: section.titleRu, path: `/grammar/sections/${section.slug}` },
        ]}
      />
      <PageHero
        variant="sky"
        eyebrow="Раздел грамматики"
        title={section.titleRu}
        description={section.descriptionRu ?? `Статей в разделе: ${formatArticleCountRu(articles.length)}.`}
        secondaryCta={{ label: "Назад к грамматике", href: "/grammar" }}
      />

      <section className="page-shell-wide section-space">
        {articles.length === 0 ? (
          <p className="text-sm text-[#9a9a9a]">В этом разделе пока нет опубликованных статей.</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => (
              <li key={article.id}>
                <GrammarArticleCard article={article} paletteIndex={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
