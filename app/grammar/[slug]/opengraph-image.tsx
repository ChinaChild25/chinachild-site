import {
  getPublicGrammarArticleBySlug,
  getPublicGrammarSlugs,
} from "@/lib/content/grammar";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Статья по грамматике китайского языка ChinaChild";

export async function generateStaticParams() {
  const slugs = await getPublicGrammarSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function GrammarArticleOgImage({ params }: Params) {
  const { slug } = await params;
  const article = await getPublicGrammarArticleBySlug(slug);

  return renderGenericOg({
    badge: "Грамматика",
    title: article?.title ?? "Грамматика китайского",
    subtitle: article?.summary ?? "Разбор правила с примерами для изучающих китайский язык.",
    footer: `chinachild.ru / grammar / ${slug}`,
    accentColor: "#3a4d12",
    background: "#eef5c8",
  });
}
