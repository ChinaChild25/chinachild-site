import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { getPublicHskVersions } from "@/lib/content/dictionary";
import { formatWordCountRu, hskVersionSlug } from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import { createBreadcrumbNode } from "@/lib/schema";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "HSK словарь — Новый HSK 3.0 и HSK 2.0 | ChinaChild",
    description:
      "Списки слов HSK по обеим шкалам: Новый HSK 3.0 (уровни 1–6 и 7–9) и классический HSK 2.0 (HSK 1–6). Бесплатные карточки с пиньинем и переводом.",
    path: "/dictionary/hsk",
  });
}

export default async function DictionaryHskPage() {
  const versions = await getPublicHskVersions();
  const url = absoluteUrl("/dictionary/hsk");
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        name: "HSK — шкалы и уровни",
        url,
        inLanguage: "ru-RU",
        description: "Списки слов по шкалам Новый HSK 3.0 и HSK 2.0.",
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          { name: "HSK", path: "/dictionary/hsk" },
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
        ]}
      />
      <JsonLd data={graph} id="dictionary-hsk-graph" />
      <PageHero
        variant="violet"
        eyebrow="HSK"
        title="HSK — шкалы и уровни"
        description="Выберите шкалу: новая редакция HSK 3.0 или классическая HSK 2.0."
        secondaryCta={{ label: "К словарю", href: "/dictionary" }}
      />

      <section className="page-shell-wide section-space grid gap-5 md:grid-cols-2">
        {versions.map((version) => (
          <Link
            key={version.id}
            href={`/dictionary/hsk/${hskVersionSlug(version.id)}`}
            className="card-block card-block-lg card-cream group flex h-full flex-col transition hover:-translate-y-1"
          >
            <span className="inline-flex items-center self-start rounded-[10px] bg-[#262626] px-3 py-1.5 text-sm font-medium leading-none text-white">
              {version.label}
            </span>
            <h2 className="mt-6 text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-[#1b1b1b]">
              {version.label}
            </h2>
            <p className="mt-3 text-base leading-7 text-[#4b4b4b]">{version.description}</p>
            <p className="mt-4 text-sm text-[#6b6b6b]">
              {formatWordCountRu(version.totalPlanned)} в плане
              {version.totalImported > 0 ? `, загружено ${version.totalImported}` : ""}.
            </p>
            <div className="mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
              Открыть шкалу →
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
