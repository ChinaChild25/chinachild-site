import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";
import { getAllGlossaryTerms } from "@/lib/glossary";

export const dynamic = "force-static";

export async function GET() {
  const now = new Date().toISOString();
  const glossary = await getAllGlossaryTerms();

  const entries: UrlEntry[] = [
    { loc: absoluteUrl("/"), lastmod: now, changefreq: "weekly", priority: 1 },

    // Money pages — high priority
    { loc: absoluteUrl("/courses"), lastmod: now, changefreq: "weekly", priority: 0.95 },
    { loc: absoluteUrl("/courses/online-chinese"), lastmod: now, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/hsk-preparation"), lastmod: now, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/chinese-for-adults"), lastmod: now, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/chinese-for-kids"), lastmod: now, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/business-chinese"), lastmod: now, changefreq: "weekly", priority: 0.88 },

    // City landings (geo-targeted)
    { loc: absoluteUrl("/cities/moscow"), lastmod: now, changefreq: "monthly", priority: 0.85 },

    // Trust pages
    { loc: absoluteUrl("/about"), lastmod: now, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/methodology"), lastmod: now, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/results"), lastmod: now, changefreq: "monthly", priority: 0.78 },
    { loc: absoluteUrl("/reviews"), lastmod: now, changefreq: "weekly", priority: 0.78 },

    // Glossary — long-tail informational lane
    { loc: absoluteUrl("/glossary"), lastmod: now, changefreq: "monthly", priority: 0.7 },
    ...glossary.map<UrlEntry>((term) => ({
      loc: absoluteUrl(`/glossary/${term.slug}`),
      lastmod: term.updatedAt,
      changefreq: "monthly" as const,
      priority: 0.55,
    })),

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
