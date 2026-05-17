import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import HskDeckCard from "@/components/content/HskDeckCard";
import {
  getPublicHskLevels,
  getPublicHskVersions,
} from "@/lib/content/dictionary";
import {
  formatWordCountRu,
  hskVersionLabel,
  hskVersionSlug,
  normalizeHskVersionParam,
} from "@/lib/content/labels";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ version: string }>> {
  const versions = await getPublicHskVersions();
  return versions.map((version) => ({ version: hskVersionSlug(version.id) }));
}

type Props = { params: Promise<{ version: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version: versionParam } = await params;
  const version = normalizeHskVersionParam(versionParam);
  if (!version) {
    return buildMetadata({
      title: "Шкала HSK не найдена | ChinaChild",
      description: "Запрошенная шкала HSK не существует.",
      path: `/dictionary/hsk/${versionParam}`,
    });
  }
  return buildMetadata({
    title: `${hskVersionLabel(version)} — все уровни словаря | ChinaChild`,
    description: `Все уровни ${hskVersionLabel(version)}: слова, пиньинь, переводы. Бесплатный справочник ChinaChild.`,
    path: `/dictionary/hsk/${versionParam}`,
  });
}

export default async function HskVersionPage({ params }: Props) {
  const { version: versionParam } = await params;
  const version = normalizeHskVersionParam(versionParam);
  if (!version) notFound();
  const decks = await getPublicHskLevels(version);

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Словарь", path: "/dictionary" },
          { name: "HSK", path: "/dictionary/hsk" },
          { name: hskVersionLabel(version), path: `/dictionary/hsk/${versionParam}` },
        ]}
      />
      <PageHero
        variant="violet"
        eyebrow="HSK"
        title={hskVersionLabel(version)}
        description={`Все уровни шкалы ${hskVersionLabel(version)} — кликните по карточке, чтобы открыть список слов.`}
        secondaryCta={{ label: "Все шкалы HSK", href: "/dictionary/hsk" }}
      />

      <section className="page-shell-wide section-space">
        {decks.length === 0 ? (
          <p className="text-sm text-[#9a9a9a]">Уровни для этой шкалы ещё не подготовлены.</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-[#6b6b6b]">
              Всего по плану: {formatWordCountRu(decks.reduce((sum, d) => sum + (d.displayCount ?? 0), 0))}.
            </p>
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {decks.map((deck, index) => (
                <li key={deck.id}>
                  <HskDeckCard deck={deck} paletteIndex={index} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
