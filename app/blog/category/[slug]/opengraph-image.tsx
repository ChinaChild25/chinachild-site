import { BLOG_HUBS, getHubBySlug } from "@/lib/blog-hubs";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Раздел блога ChinaChild";

export function generateStaticParams() {
  return BLOG_HUBS.map((hub) => ({ slug: hub.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function BlogCategoryOgImage({ params }: Params) {
  const { slug } = await params;
  const hub = getHubBySlug(slug);

  return renderGenericOg({
    badge: "Блог",
    title: hub?.heading ?? "Блог ChinaChild",
    subtitle: hub?.description ?? "Статьи о китайском языке, HSK и методике обучения.",
    footer: hub ? `chinachild.ru / blog / ${hub.slug}` : "chinachild.ru / blog",
    background: "#eef5c8",
    cta: "Читать статьи",
  });
}
