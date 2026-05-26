import { getBlogPostBySlug, getBlogPostSlugs } from "@/lib/blog";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Блог ChinaChild";

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function BlogOgImage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  const title = post?.title ?? "Блог ChinaChild";

  return renderGenericOg({
    badge: "Блог",
    title,
    subtitle: post?.description ?? "Статья о китайском языке и обучении в ChinaChild.",
    footer: "chinachild.ru / blog",
    background: "#efeae0",
    cta: "Читать статью",
  });
}
