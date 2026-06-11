import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import { getPublicGrammarTags } from "@/lib/content/grammar";
import { formatArticleCountRu } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Теги грамматики китайского — навигация по правилам | ChinaChild",
    description:
      "Все теги справочника по грамматике китайского языка: HSK, Новый HSK, части речи, типы предложений, фразы.",
    path: "/grammar/tags",
  });
}

export default async function GrammarTagsPage() {
  const groups = await getPublicGrammarTags();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Грамматика", path: "/grammar" },
          { name: "Теги", path: "/grammar/tags" },
        ]}
      />
      <PageHero
        variant="cream"
        eyebrow="Грамматика"
        title="Теги по грамматике"
        description="Сгруппированный список тегов справочника. Нажмите на тег, чтобы посмотреть подборку правил."
        secondaryCta={{ label: "Назад к грамматике", href: "/grammar" }}
      />

      <section className="page-shell-wide section-space space-y-12">
        {groups.length === 0 ? (
          <p className="text-sm text-[#9a9a9a]">Теги ещё не загружены.</p>
        ) : (
          groups.map((group) => (
            <div key={group.key}>
              <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                {group.label}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {group.tags.map((tag) => (
                  <li key={tag.id}>
                    <Link
                      href={`/grammar/tags/${tag.slug}`}
                      className="tag-pill bg-white transition hover:-translate-y-0.5"
                    >
                      {tag.labelRu}
                      <span className="ml-2 text-xs text-[#9a9a9a]">
                        {formatArticleCountRu(tag.articleCount)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
