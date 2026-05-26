import {
  getPublicGrammarSectionBySlug,
  getPublicGrammarSections,
} from "@/lib/content/grammar";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Раздел грамматики китайского языка ChinaChild";

export async function generateStaticParams() {
  const sections = await getPublicGrammarSections();
  return sections.map((section) => ({ slug: section.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function GrammarSectionOgImage({ params }: Params) {
  const { slug } = await params;
  const { section } = await getPublicGrammarSectionBySlug(slug);

  return renderGenericOg({
    badge: "Раздел",
    title: section?.titleRu ?? "Раздел грамматики",
    subtitle: section?.descriptionRu ?? "Навигация по темам грамматики китайского языка.",
    footer: `chinachild.ru / grammar / sections / ${slug}`,
    accentColor: "#1b1b1b",
    background: "#f4f0e8",
  });
}
