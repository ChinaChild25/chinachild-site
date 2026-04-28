import { getAllPosts } from "@/lib/blog";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getAllPosts();
  const now = new Date().toISOString();

  const entries: UrlEntry[] = [
    {
      loc: absoluteUrl("/blog"),
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    },
    ...posts.map((post): UrlEntry => ({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: new Date(post.dateModified).toISOString(),
      changefreq: "monthly",
      priority: 0.7,
    })),
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
