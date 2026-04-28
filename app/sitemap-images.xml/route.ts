import { getAllPosts } from "@/lib/blog";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * Image sitemap — declares the OG image associated with every URL so search
 * engines (Yandex, Google) can show them as preview thumbnails in SERP.
 */
export async function GET() {
  const posts = await getAllPosts();
  const now = new Date().toISOString();

  const homeImg = absoluteUrl("/opengraph-image");

  const entries: UrlEntry[] = [
    {
      loc: absoluteUrl("/"),
      lastmod: now,
      images: [{ loc: homeImg, title: "ChinaChild — онлайн-школа китайского языка" }],
    },
    ...[
      "/about",
      "/methodology",
      "/results",
      "/reviews",
      "/courses",
      "/courses/online-chinese",
      "/courses/hsk-preparation",
      "/courses/chinese-for-adults",
      "/courses/chinese-for-kids",
      "/courses/business-chinese",
    ].map((path): UrlEntry => ({
      loc: absoluteUrl(path),
      lastmod: now,
      images: [{ loc: homeImg, title: "ChinaChild — онлайн-школа китайского языка" }],
    })),
    ...posts.map((post): UrlEntry => ({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: new Date(post.dateModified).toISOString(),
      images: [
        {
          loc: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
          title: post.title,
          caption: post.description,
        },
      ],
    })),
  ];

  return new Response(renderSitemap(entries, true), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
