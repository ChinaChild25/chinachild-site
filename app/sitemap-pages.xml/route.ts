import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { teachers } from "@/lib/site-data";
import { cities } from "@/lib/cities";
import { hskLevels } from "@/lib/hsk-levels";
import { hskTestLevels } from "@/lib/hsk-test/levels";
import {
  getPublicGrammarArticles,
  getPublicGrammarSections,
  getPublicGrammarTags,
} from "@/lib/content/grammar";
import {
  getPublicHskVersions,
  getPublicWordSlugs,
  isIndexableHskDeck,
} from "@/lib/content/dictionary";
import { hskVersionSlug } from "@/lib/content/labels";

export const dynamic = "force-static";

export async function GET() {
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

  const entries: UrlEntry[] = [
    { loc: absoluteUrl("/"), changefreq: "weekly", priority: 1 },

    // Money pages — highest priority
    { loc: absoluteUrl("/courses"), changefreq: "weekly", priority: 0.95 },
    { loc: absoluteUrl("/courses/online-chinese"), changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/hsk-preparation"), changefreq: "weekly", priority: 0.93 },
    { loc: absoluteUrl("/courses/chinese-for-adults"), changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/chinese-for-kids"), changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/courses/business-chinese"), changefreq: "weekly", priority: 0.88 },

    // Commercial conversion pages
    { loc: absoluteUrl("/price"), changefreq: "weekly", priority: 0.9 },
    { loc: absoluteUrl("/free-trial"), changefreq: "monthly", priority: 0.88 },
    { loc: absoluteUrl("/zayavka"), changefreq: "monthly", priority: 0.86 },

    // Learning hubs — pillar pages
    { loc: absoluteUrl("/learn/hsk"), changefreq: "weekly", priority: 0.92 },
    { loc: absoluteUrl("/learn/beginners"), changefreq: "weekly", priority: 0.9 },
    { loc: absoluteUrl("/corporate"), changefreq: "weekly", priority: 0.88 },
    ...hskLevels.map<UrlEntry>((l) => ({
      loc: absoluteUrl(`/hsk/${l.slug}`),
      changefreq: "monthly" as const,
      priority: 0.85,
    })),

    // HSK level test (interactive quiz). Landing + per-level long-tail pages.
    { loc: absoluteUrl("/chinese/hsk-test"), changefreq: "weekly", priority: 0.9 },
    ...hskTestLevels.map<UrlEntry>((l) => ({
      loc: absoluteUrl(`/chinese/hsk-test/${l.slug}`),
      changefreq: "monthly" as const,
      priority: 0.82,
    })),

    // City landings (geo-targeted)
    { loc: absoluteUrl("/cities"), changefreq: "monthly", priority: 0.82 },
    ...cities.map<UrlEntry>((c) => ({
      loc: absoluteUrl(`/cities/${c.slug}`),
      changefreq: "monthly" as const,
      priority: c.licensedRegion ? 0.85 : 0.78,
    })),

    // Comparisons / decision pages
    {
      loc: absoluteUrl("/compare/mini-group-vs-individual"),
      changefreq: "monthly",
      priority: 0.7,
    },

    // Trust / E-E-A-T
    { loc: absoluteUrl("/about"), changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/repetitor-kitayskogo"), changefreq: "monthly", priority: 0.8 },
    { loc: absoluteUrl("/methodology"), changefreq: "monthly", priority: 0.82 },
    { loc: absoluteUrl("/results"), changefreq: "monthly", priority: 0.78 },
    { loc: absoluteUrl("/reviews"), changefreq: "weekly", priority: 0.78 },
    { loc: absoluteUrl("/license"), changefreq: "yearly", priority: 0.7 },
    { loc: absoluteUrl("/docs"), changefreq: "yearly", priority: 0.65 },

    // Team — E-E-A-T author profiles
    { loc: absoluteUrl("/team"), changefreq: "monthly", priority: 0.75 },
    ...teachers.map<UrlEntry>((t) => ({
      loc: absoluteUrl(`/team/${t.slug}`),
      changefreq: "monthly" as const,
      priority: 0.65,
    })),

    // Glossary — long-tail informational lane
    { loc: absoluteUrl("/glossary"), changefreq: "monthly", priority: 0.7 },
    ...glossary.map<UrlEntry>((term) => ({
      loc: absoluteUrl(`/glossary/${term.slug}`),
      lastmod: term.updatedAt,
      changefreq: "monthly" as const,
      priority: 0.55,
    })),

    // Grammar SEO lane — bridged from chinachild-sandbox via public Supabase read.
    { loc: absoluteUrl("/grammar"), changefreq: "weekly", priority: 0.85 },
    { loc: absoluteUrl("/grammar/tags"), changefreq: "monthly", priority: 0.65 },
    ...grammarTagGroups.flatMap<UrlEntry>((group) =>
      group.tags.map((tag) => ({
        loc: absoluteUrl(`/grammar/tags/${tag.slug}`),
        changefreq: "monthly" as const,
        priority: 0.55,
      })),
    ),
    ...grammarSections.map<UrlEntry>((section) => ({
      loc: absoluteUrl(`/grammar/sections/${section.slug}`),
      changefreq: "monthly" as const,
      priority: 0.6,
    })),
    ...grammarArticles.map<UrlEntry>((article) => ({
      loc: absoluteUrl(`/grammar/${article.slug}`),
      changefreq: "monthly" as const,
      priority: article.isFeatured ? 0.78 : 0.7,
    })),

    // Dictionary SEO lane.
    { loc: absoluteUrl("/dictionary"), changefreq: "weekly", priority: 0.85 },
    { loc: absoluteUrl("/dictionary/hsk"), changefreq: "monthly", priority: 0.7 },
    ...hskVersions.flatMap<UrlEntry>((version) => [
      {
        loc: absoluteUrl(`/dictionary/hsk/${hskVersionSlug(version.id)}`),
        changefreq: "monthly" as const,
        priority: 0.7,
      },
      ...version.decks.filter(isIndexableHskDeck).map<UrlEntry>((deck) => ({
        loc: absoluteUrl(`/dictionary/hsk/${hskVersionSlug(version.id)}/${deck.hskLevel}`),
        changefreq: "monthly" as const,
        priority: 0.65,
      })),
    ]),
    ...wordSlugs.map<UrlEntry>((slug) => ({
      loc: absoluteUrl(`/dictionary/word/${slug}`),
      changefreq: "monthly" as const,
      priority: 0.5,
    })),

    // Legal
    { loc: absoluteUrl("/public-treaty"), changefreq: "yearly", priority: 0.25 },
    { loc: absoluteUrl("/user-agreement"), changefreq: "yearly", priority: 0.25 },
    { loc: absoluteUrl("/privacy-policy"), changefreq: "yearly", priority: 0.25 },
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
