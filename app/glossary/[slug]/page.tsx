import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { getAllGlossaryTerms, getGlossarySlugs, getGlossaryTermBySlug } from "@/lib/glossary";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import { createBreadcrumbNode } from "@/lib/schema";

type GlossaryTermPageProps = {
  params: Promise<{ slug: string }>;
};

// ISR: refresh each term once per day so updatedAt bumps without a redeploy.
export const revalidate = 86400;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getGlossarySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GlossaryTermPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await getGlossaryTermBySlug(slug);
  if (!term) {
    return buildMetadata({
      title: "Термин не найден | Глоссарий ChinaChild",
      description: "Запрошенный термин отсутствует в глоссарии.",
      path: `/glossary/${slug}`,
    });
  }
  return buildMetadata({
    title: `${term.term} — что это в китайском языке | Глоссарий ChinaChild`,
    description: term.shortDefinition,
    path: `/glossary/${term.slug}`,
    keywords: [term.term.toLowerCase(), `${term.term.toLowerCase()} что это`, "китайский язык"],
  });
}

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { slug } = await params;
  const term = await getGlossaryTermBySlug(slug);
  if (!term) notFound();

  const allTerms = await getAllGlossaryTerms();
  const related = term.related
    .map((rs) => allTerms.find((t) => t.slug === rs))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const url = absoluteUrl(`/glossary/${term.slug}`);
  const articleId = `${url}#defined-term`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": articleId,
        name: term.term,
        description: term.shortDefinition,
        url,
        inLanguage: "ru-RU",
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Глоссарий ChinaChild",
          url: absoluteUrl("/glossary"),
        },
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Глоссарий", path: "/glossary" },
          { name: term.term, path: `/glossary/${term.slug}` },
        ]),
        "@id": `${articleId}#breadcrumb`,
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Глоссарий", path: "/glossary" },
          { name: term.term, path: `/glossary/${term.slug}` },
        ]}
      />
      <JsonLd data={graph} id={`glossary-${term.slug}-graph`} />

      <article className="page-shell section-space pt-10" itemScope itemType="https://schema.org/DefinedTerm">
        <header className="mx-auto max-w-3xl">
          <span className="tag-pill">Глоссарий</span>
          <h1
            className="mt-6 text-[2.4rem] font-bold leading-[1.04] tracking-[-0.04em] text-[#1b1b1b] sm:text-[3rem]"
            itemProp="name"
          >
            {term.term}
          </h1>
          <p className="mt-5 text-lg leading-7 text-[#4b4b4b]" itemProp="description">
            {term.shortDefinition}
          </p>
          <p className="mt-6 text-xs text-[#9a9a9a]">
            Обновлено{" "}
            <time dateTime={term.updatedAt} itemProp="dateModified">
              {new Date(term.updatedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        </header>

        <div className="prose-article mx-auto mt-12 max-w-3xl">
          {term.body.split(/\n\n+/).map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {related.length > 0 ? (
          <aside className="mx-auto mt-16 max-w-3xl">
            <div className="card-block card-cream">
              <h2 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                Связанные термины
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/glossary/${r.slug}`}
                      className="tag-pill underline-offset-4 hover:underline"
                    >
                      {r.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}

        {/* CTA block — every glossary term links back to the money pages.
            Builds an internal cluster: term → course → enrollment. */}
        <aside className="mx-auto mt-8 max-w-3xl">
          <div className="card-block card-block-lg card-violet">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-white">
              Хотите освоить {term.term} на практике?
            </h2>
            <p className="mt-3 text-base leading-7 text-white/85">
              Запишитесь на бесплатный пробный урок — преподаватель оценит ваш уровень
              и подберёт подходящий курс.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/courses/online-chinese"
                className="btn-pill btn-white"
              >
                Курс с нуля
              </Link>
              <Link
                href="/courses/hsk-preparation"
                className="btn-pill"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                }}
              >
                Подготовка к HSK
              </Link>
              <Link
                href="/glossary"
                className="btn-pill"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                }}
              >
                Все термины
              </Link>
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}
