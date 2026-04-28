import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const now = new Date().toISOString();

  const entries: UrlEntry[] = [
    { loc: absoluteUrl("/"), lastmod: now, changefreq: "weekly", priority: 1 },

    // Money pages — high priority
    { loc: absoluteUrl("/courses"), lastmod: now, changefreq: "weekly", priority: 0.95 },
    { loc: absoluteUrl("/courses/online-chinese"), lastmod: now, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/hsk-preparation"), lastmod: now, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/chinese-for-adults"), lastmod: now, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/chinese-for-kids"), lastmod: now, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/business-chinese"), lastmod: now, changefreq: "weekly", priority: 0.88 },

    // Trust pages
    { loc: absoluteUrl("/about"), lastmod: now, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/methodology"), lastmod: now, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/results"), lastmod: now, changefreq: "monthly", priority: 0.78 },
    { loc: absoluteUrl("/reviews"), lastmod: now, changefreq: "weekly", priority: 0.78 },

    // Legal
    { loc: absoluteUrl("/privacy-policy"), lastmod: now, changefreq: "yearly", priority: 0.25 },
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
