import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import GrammarArticleCard from "@/components/content/GrammarArticleCard";
import { getPublicGrammarTagBySlug, getPublicGrammarTags } from "@/lib/content/grammar";
import { formatArticleCountRu, tagGroupLabel } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const groups = await getPublicGrammarTags();
  return groups.flatMap((group) => group.tags.map((tag) => ({ slug: tag.slug })));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tag } = await getPublicGrammarTagBySlug(slug);
  if (!tag) {
    return buildMetadata({
      title: "Тег не найден | Грамматика ChinaChild",
      description: "Запрошенный тег отсутствует.",
      path: `/grammar/tags/${slug}`,
    });
  }
  return buildMetadata({
    title: `${tag.labelRu} — грамматика китайского | ChinaChild`,
    description: `Подборка статей грамматики по тегу «${tag.labelRu}». Группа: ${tagGroupLabel(tag.groupKey)}.`,
    path: `/grammar/tags/${tag.slug}`,
  });
}

export default async function GrammarTagPage({ params }: Props) {
  const { slug } = await params;
  const { tag, articles } = await getPublicGrammarTagBySlug(slug);
  if (!tag) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Грамматика", path: "/grammar" },
          { name: "Теги", path: "/grammar/tags" },
          { name: tag.labelRu, path: `/grammar/tags/${tag.slug}` },
        ]}
      />
      <PageHero
        variant="lime"
        eyebrow={tagGroupLabel(tag.groupKey)}
        title={tag.labelRu}
        description={`Подборка из ${formatArticleCountRu(articles.length)} по тегу «${tag.labelRu}».`}
        secondaryCta={{ label: "Все теги", href: "/grammar/tags" }}
      />

      <section className="page-shell-wide section-space">
        {articles.length === 0 ? (
          <p className="text-sm text-[#9a9a9a]">По этому тегу пока нет опубликованных статей.</p>
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
