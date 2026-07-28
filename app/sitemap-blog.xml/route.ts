import { getAllPosts } from "@/lib/blog";
import { BLOG_HUBS } from "@/lib/blog-hubs";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getAllPosts();
  const latestPostModified = (matchingPosts = posts) =>
    matchingPosts.reduce(
      (latest, post) =>
        post.dateModified > latest ? post.dateModified : latest,
      "1970-01-01T00:00:00.000Z",
    );

  const entries: UrlEntry[] = [
    {
      loc: absoluteUrl("/blog"),
      lastmod: latestPostModified(),
      changefreq: "weekly",
      priority: 0.8,
    },
    // Hub-spoke: category-страницы блога — pillar-контент с собственным
    // SEO-текстом и листингом spoke-статей.
    ...BLOG_HUBS.map((hub): UrlEntry => ({
      loc: absoluteUrl(`/blog/category/${hub.slug}`),
      lastmod: latestPostModified(posts.filter((post) => post.category === hub.category)),
      changefreq: "weekly",
      priority: 0.7,
    })),
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
