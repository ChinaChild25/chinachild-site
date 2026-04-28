import { stat } from "node:fs/promises";
import path from "node:path";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { teachers } from "@/lib/site-data";

export const dynamic = "force-static";

async function fileMtime(relPath: string, fallback: string): Promise<string> {
  try {
    const s = await stat(path.join(process.cwd(), relPath));
    return s.mtime.toISOString();
  } catch {
    return fallback;
  }
}

export async function GET() {
  const now = new Date().toISOString();
  const glossary = await getAllGlossaryTerms();

  // Use real file mtime when available — gives Yandex/Google a credible
  // lastmod signal instead of the same now-stamp on every page.
  const [
    homeMtime,
    coursesIndexMtime,
    onlineMtime,
    hskMtime,
    adultsMtime,
    kidsMtime,
    businessMtime,
    moscowMtime,
    zayavkaMtime,
    aboutMtime,
    methodologyMtime,
    resultsMtime,
    reviewsMtime,
    glossaryIndexMtime,
    teamIndexMtime,
    privacyMtime,
  ] = await Promise.all([
    fileMtime("app/page.tsx", now),
    fileMtime("app/courses/page.tsx", now),
    fileMtime("app/courses/online-chinese/page.tsx", now),
    fileMtime("app/courses/hsk-preparation/page.tsx", now),
    fileMtime("app/courses/chinese-for-adults/page.tsx", now),
    fileMtime("app/courses/chinese-for-kids/page.tsx", now),
    fileMtime("app/courses/business-chinese/page.tsx", now),
    fileMtime("app/cities/moscow/page.tsx", now),
    fileMtime("app/zayavka/page.tsx", now),
    fileMtime("app/about/page.tsx", now),
    fileMtime("app/methodology/page.tsx", now),
    fileMtime("app/results/page.tsx", now),
    fileMtime("app/reviews/page.tsx", now),
    fileMtime("app/glossary/page.tsx", now),
    fileMtime("app/team/page.tsx", now),
    fileMtime("app/privacy-policy/page.tsx", now),
  ]);

  const entries: UrlEntry[] = [
    { loc: absoluteUrl("/"), lastmod: homeMtime, changefreq: "weekly", priority: 1 },

    // Money pages — high priority
    { loc: absoluteUrl("/courses"), lastmod: coursesIndexMtime, changefreq: "weekly", priority: 0.95 },
    { loc: absoluteUrl("/courses/online-chinese"), lastmod: onlineMtime, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/hsk-preparation"), lastmod: hskMtime, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/chinese-for-adults"), lastmod: adultsMtime, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/chinese-for-kids"), lastmod: kidsMtime, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/business-chinese"), lastmod: businessMtime, changefreq: "weekly", priority: 0.88 },

    // City landings (geo-targeted)
    { loc: absoluteUrl("/cities/moscow"), lastmod: moscowMtime, changefreq: "monthly", priority: 0.85 },

    // Lead capture (high-intent landing for direct ads/cards)
    { loc: absoluteUrl("/zayavka"), lastmod: zayavkaMtime, changefreq: "monthly", priority: 0.86 },

    // Trust pages
    { loc: absoluteUrl("/about"), lastmod: aboutMtime, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/methodology"), lastmod: methodologyMtime, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/results"), lastmod: resultsMtime, changefreq: "monthly", priority: 0.78 },
    { loc: absoluteUrl("/reviews"), lastmod: reviewsMtime, changefreq: "weekly", priority: 0.78 },

    // Team — E-E-A-T, author profiles
    { loc: absoluteUrl("/team"), lastmod: teamIndexMtime, changefreq: "monthly", priority: 0.72 },
    ...teachers.map<UrlEntry>((t) => ({
      loc: absoluteUrl(`/team/${t.slug}`),
      lastmod: teamIndexMtime,
      changefreq: "monthly" as const,
      priority: 0.6,
    })),

    // Glossary — long-tail informational lane
    { loc: absoluteUrl("/glossary"), lastmod: glossaryIndexMtime, changefreq: "monthly", priority: 0.7 },
    ...glossary.map<UrlEntry>((term) => ({
      loc: absoluteUrl(`/glossary/${term.slug}`),
      lastmod: term.updatedAt,
      changefreq: "monthly" as const,
      priority: 0.55,
    })),

    // Legal
    { loc: absoluteUrl("/privacy-policy"), lastmod: privacyMtime, changefreq: "yearly", priority: 0.25 },
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
