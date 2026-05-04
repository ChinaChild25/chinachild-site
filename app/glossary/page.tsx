import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Глоссарий китайского языка — термины и понятия | ChinaChild",
    description:
      "Глоссарий ChinaChild: HSK, пиньинь, путунхуа, тоны и другие ключевые термины китайского языка. Краткие определения с подробным разбором.",
    path: "/glossary",
    keywords: [
      "глоссарий китайского",
      "термины китайского языка",
      "HSK что это",
      "пиньинь что это",
      "путунхуа",
    ],
  });
}

const palette = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
];

export default async function GlossaryPage() {
  const terms = await getAllGlossaryTerms();

  const glossarySchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${absoluteUrl("/glossary")}#defined-term-set`,
    name: "Глоссарий китайского языка ChinaChild",
    description:
      "Краткий справочник терминов китайского языка: HSK, пиньинь, путунхуа, тоны и другое.",
    url: absoluteUrl("/glossary"),
    inLanguage: "ru-RU",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absoluteUrl(`/glossary/${t.slug}`)}#defined-term`,
      name: t.term,
      description: t.shortDefinition,
      url: absoluteUrl(`/glossary/${t.slug}`),
      inLanguage: "ru-RU",
    })),
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Глоссарий", path: "/glossary" },
        ]}
      />
      <JsonLd data={glossarySchema} id="glossary-defined-term-set" />
      <PageHero
        variant="lime"
        eyebrow="Глоссарий"
        title="Термины и понятия китайского языка"
        description="Краткий справочник с определениями ключевых терминов: HSK, пиньинь, путунхуа, тоны и другое. Каждый термин ведёт на отдельную страницу с разбором."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
        illustration="/heroes/glossary.webp"
        illustrationAlt="Иероглиф 汉"
        illustrationWidth={1201}
        illustrationHeight={1065}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {terms.map((term, idx) => (
            <Reveal key={term.slug}>
              <Link
                href={`/glossary/${term.slug}`}
                className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
              >
                <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
                  {term.term}
                </h2>
                <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                  {term.shortDefinition}
                </p>
                <div className="mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
                  Открыть →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
