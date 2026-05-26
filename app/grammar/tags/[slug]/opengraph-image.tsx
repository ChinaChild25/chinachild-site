import { getPublicGrammarTagBySlug, getPublicGrammarTags } from "@/lib/content/grammar";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Тег грамматики китайского языка ChinaChild";

export async function generateStaticParams() {
  const groups = await getPublicGrammarTags();
  return groups.flatMap((group) => group.tags.map((tag) => ({ slug: tag.slug })));
}

type Params = { params: Promise<{ slug: string }> };

export default async function GrammarTagOgImage({ params }: Params) {
  const { slug } = await params;
  const { tag } = await getPublicGrammarTagBySlug(slug);

  return renderGenericOg({
    badge: "Грамматика",
    title: tag?.labelRu ?? "Тег грамматики",
    subtitle: "Подборка статей и правил китайской грамматики по теме.",
    footer: `chinachild.ru / grammar / tags / ${slug}`,
    background: "#e7e6ff",
    cta: "Открыть подборку",
  });
}
