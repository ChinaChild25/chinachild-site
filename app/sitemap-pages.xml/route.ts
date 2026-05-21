import { stat } from "node:fs/promises";
import path from "node:path";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { teachers } from "@/lib/site-data";
import { cities } from "@/lib/cities";
import { hskLevels } from "@/lib/hsk-levels";
import {
  getPublicGrammarArticles,
  getPublicGrammarSections,
  getPublicGrammarTags,
} from "@/lib/content/grammar";
import {
  getPublicHskVersions,
  getPublicWordSlugs,
} from "@/lib/content/dictionary";
import { hskVersionSlug } from "@/lib/content/labels";

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
  // Public grammar + dictionary content. These calls degrade gracefully to []
  // when Supabase env vars are missing (e.g. preview builds before linking).
  const [grammarArticles, grammarTagGroups, grammarSections, hskVersions, wordSlugs] =
    await Promise.all([
      getPublicGrammarArticles(),
      getPublicGrammarTags(),
      getPublicGrammarSections(),
      getPublicHskVersions(),
      getPublicWordSlugs(),
    ]);

  // Pull mtime for the most-edited templates so lastmod is credible.
  const [
    homeMtime,
    coursesIndexMtime,
    onlineMtime,
    hskMtime,
    adultsMtime,
    kidsMtime,
    businessMtime,
    citiesIndexMtime,
    cityTemplateMtime,
    hskTemplateMtime,
    learnHubMtime,
    priceMtime,
    freeTrialMtime,
    compareMtime,
    licenseMtime,
    docsMtime,
    zayavkaMtime,
    aboutMtime,
    methodologyMtime,
    resultsMtime,
    reviewsMtime,
    glossaryIndexMtime,
    teamIndexMtime,
    publicTreatyMtime,
    userAgreementMtime,
    privacyMtime,
  ] = await Promise.all([
    fileMtime("app/page.tsx", now),
    fileMtime("app/courses/page.tsx", now),
    fileMtime("app/courses/online-chinese/page.tsx", now),
    fileMtime("app/courses/hsk-preparation/page.tsx", now),
    fileMtime("app/courses/chinese-for-adults/page.tsx", now),
    fileMtime("app/courses/chinese-for-kids/page.tsx", now),
    fileMtime("app/courses/business-chinese/page.tsx", now),
    fileMtime("app/cities/page.tsx", now),
    fileMtime("app/cities/[slug]/page.tsx", now),
    fileMtime("app/hsk/[slug]/page.tsx", now),
    fileMtime("app/learn/hsk/page.tsx", now),
    fileMtime("app/price/page.tsx", now),
    fileMtime("app/free-trial/page.tsx", now),
    fileMtime("app/compare/mini-group-vs-individual/page.tsx", now),
    fileMtime("app/license/page.tsx", now),
    fileMtime("app/docs/page.tsx", now),
    fileMtime("app/zayavka/page.tsx", now),
    fileMtime("app/about/page.tsx", now),
    fileMtime("app/methodology/page.tsx", now),
    fileMtime("app/results/page.tsx", now),
    fileMtime("app/reviews/page.tsx", now),
    fileMtime("app/glossary/page.tsx", now),
    fileMtime("app/team/page.tsx", now),
    fileMtime("app/public-treaty/page.tsx", now),
    fileMtime("app/user-agreement/page.tsx", now),
    fileMtime("app/privacy-policy/page.tsx", now),
  ]);

  const entries: UrlEntry[] = [
    { loc: absoluteUrl("/"), lastmod: homeMtime, changefreq: "weekly", priority: 1 },

    // Money pages — highest priority
    { loc: absoluteUrl("/courses"), lastmod: coursesIndexMtime, changefreq: "weekly", priority: 0.95 },
    { loc: absoluteUrl("/courses/online-chinese"), lastmod: onlineMtime, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/hsk-preparation"), lastmod: hskMtime, changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/chinese-for-adults"), lastmod: adultsMtime, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/chinese-for-kids"), lastmod: kidsMtime, changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/business-chinese"), lastmod: businessMtime, changefreq: "weekly", priority: 0.88 },

    // Commercial conversion pages
    { loc: absoluteUrl("/price"), lastmod: priceMtime, changefreq: "weekly", priority: 0.9 },
    { loc: absoluteUrl("/free-trial"), lastmod: freeTrialMtime, changefreq: "monthly", priority: 0.88 },
    { loc: absoluteUrl("/zayavka"), lastmod: zayavkaMtime, changefreq: "monthly", priority: 0.86 },

    // HSK level cluster
    { loc: absoluteUrl("/learn/hsk"), lastmod: learnHubMtime, changefreq: "weekly", priority: 0.92 },
    ...hskLevels.map<UrlEntry>((l) => ({
      loc: absoluteUrl(`/hsk/${l.slug}`),
      lastmod: hskTemplateMtime,
      changefreq: "monthly" as const,
      priority: 0.85,
    })),

    // City landings (geo-targeted)
    { loc: absoluteUrl("/cities"), lastmod: citiesIndexMtime, changefreq: "monthly", priority: 0.82 },
    ...cities.map<UrlEntry>((c) => ({
      loc: absoluteUrl(`/cities/${c.slug}`),
      lastmod: cityTemplateMtime,
      changefreq: "monthly" as const,
      priority: c.licensedRegion ? 0.85 : 0.78,
    })),

    // Comparisons / decision pages
    {
      loc: absoluteUrl("/compare/mini-group-vs-individual"),
      lastmod: compareMtime,
      changefreq: "monthly",
      priority: 0.7,
    },

    // Trust / E-E-A-T
    { loc: absoluteUrl("/about"), lastmod: aboutMtime, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/methodology"), lastmod: methodologyMtime, changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/results"), lastmod: resultsMtime, changefreq: "monthly", priority: 0.78 },
    { loc: absoluteUrl("/reviews"), lastmod: reviewsMtime, changefreq: "weekly", priority: 0.78 },
    { loc: absoluteUrl("/license"), lastmod: licenseMtime, changefreq: "yearly", priority: 0.7 },
    { loc: absoluteUrl("/docs"), lastmod: docsMtime, changefreq: "yearly", priority: 0.65 },

    // Team — E-E-A-T author profiles
    { loc: absoluteUrl("/team"), lastmod: teamIndexMtime, changefreq: "monthly", priority: 0.75 },
    ...teachers.map<UrlEntry>((t) => ({
      loc: absoluteUrl(`/team/${t.slug}`),
      lastmod: teamIndexMtime,
      changefreq: "monthly" as const,
      priority: 0.65,
    })),

    // Glossary — long-tail informational lane
    { loc: absoluteUrl("/glossary"), lastmod: glossaryIndexMtime, changefreq: "monthly", priority: 0.7 },
    ...glossary.map<UrlEntry>((term) => ({
      loc: absoluteUrl(`/glossary/${term.slug}`),
      lastmod: term.updatedAt,
      changefreq: "monthly" as const,
      priority: 0.55,
    })),

    // Grammar SEO lane — bridged from chinachild-sandbox via public Supabase read.
    { loc: absoluteUrl("/grammar"), lastmod: now, changefreq: "weekly", priority: 0.85 },
    { loc: absoluteUrl("/grammar/tags"), lastmod: now, changefreq: "monthly", priority: 0.65 },
    ...grammarTagGroups.flatMap<UrlEntry>((group) =>
      group.tags.map((tag) => ({
        loc: absoluteUrl(`/grammar/tags/${tag.slug}`),
        lastmod: now,
        changefreq: "monthly" as const,
        priority: 0.55,
      })),
    ),
    ...grammarSections.map<UrlEntry>((section) => ({
      loc: absoluteUrl(`/grammar/sections/${section.slug}`),
      lastmod: now,
      changefreq: "monthly" as const,
      priority: 0.6,
    })),
    ...grammarArticles.map<UrlEntry>((article) => ({
      loc: absoluteUrl(`/grammar/${article.slug}`),
      lastmod: now,
      changefreq: "monthly" as const,
      priority: article.isFeatured ? 0.78 : 0.7,
    })),

    // Dictionary SEO lane.
    { loc: absoluteUrl("/dictionary"), lastmod: now, changefreq: "weekly", priority: 0.85 },
    { loc: absoluteUrl("/dictionary/hsk"), lastmod: now, changefreq: "monthly", priority: 0.7 },
    ...hskVersions.flatMap<UrlEntry>((version) => [
      {
        loc: absoluteUrl(`/dictionary/hsk/${hskVersionSlug(version.id)}`),
        lastmod: now,
        changefreq: "monthly" as const,
        priority: 0.7,
      },
      ...version.decks.map<UrlEntry>((deck) => ({
        loc: absoluteUrl(`/dictionary/hsk/${hskVersionSlug(version.id)}/${deck.hskLevel}`),
        lastmod: now,
        changefreq: "monthly" as const,
        priority: 0.65,
      })),
    ]),
    ...wordSlugs.map<UrlEntry>((slug) => ({
      loc: absoluteUrl(`/dictionary/word/${slug}`),
      lastmod: now,
      changefreq: "monthly" as const,
      priority: 0.5,
    })),

    // Legal
    { loc: absoluteUrl("/public-treaty"), lastmod: publicTreatyMtime, changefreq: "yearly", priority: 0.25 },
    { loc: absoluteUrl("/user-agreement"), lastmod: userAgreementMtime, changefreq: "yearly", priority: 0.25 },
    { loc: absoluteUrl("/privacy-policy"), lastmod: privacyMtime, changefreq: "yearly", priority: 0.25 },
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
