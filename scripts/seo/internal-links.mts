import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { NormalizedCollection } from "./types.mts";

export const COMMERCIAL_DESTINATIONS = [
  "/",
  "/courses",
  "/courses/online-chinese",
  "/repetitor-kitayskogo",
  "/courses/chinese-for-adults",
  "/courses/chinese-for-kids",
  "/courses/hsk-preparation",
  "/courses/business-chinese",
  "/corporate",
  "/price",
  "/free-trial",
  "/zayavka",
] as const;

export type InternalLinkRecord = {
  sourceUrl: string;
  sourceTemplate: string;
  destinationUrl: string;
  anchorText: string;
  classification: "global" | "contextual" | "breadcrumb";
  placement: "header" | "footer" | "breadcrumb" | "body";
  sourceGoogleImpressions: number;
  sourceGoogleClicks: number;
  sourceGa4OrganicSessions: number;
  sourceMetrikaOrganicVisits: number;
  sourceVisibility: "high" | "medium" | "low" | "unknown";
  generatedBySharedCode: boolean;
  promotesMultipleCompetingCommercialPages: boolean;
};

export type InternalLinkDestinationSummary = {
  destinationUrl: string;
  totalInboundLinks: number;
  contextualInboundLinks: number;
  globalInboundLinks: number;
  breadcrumbInboundLinks: number;
  uniqueSourcePages: number;
  highVisibilitySourcePages: number;
  mostCommonAnchors: string;
  strongestSharedTemplateSources: string;
};

type Visibility = Pick<
  InternalLinkRecord,
  | "sourceGoogleImpressions"
  | "sourceGoogleClicks"
  | "sourceGa4OrganicSessions"
  | "sourceMetrikaOrganicVisits"
  | "sourceVisibility"
>;

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    laquo: "«",
    raquo: "»",
  };
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name] ?? match);
}

function textContent(html: string): string {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function routeFromHtmlFilename(buildAppDirectory: string, filename: string): string {
  const relative = path.relative(buildAppDirectory, filename).replaceAll(path.sep, "/");
  const withoutExtension = relative.replace(/\.html$/, "");
  return withoutExtension === "index" ? "/" : `/${withoutExtension}`;
}

async function htmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(filename)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(filename);
  }
  return files;
}

function sourceTemplate(pathname: string): string {
  if (pathname === "/") return "homepage";
  if (/^\/blog\/category\//.test(pathname)) return "blog_category";
  if (/^\/blog\/[^/]+$/.test(pathname)) return "blog_article";
  if (/^\/glossary\/[^/]+$/.test(pathname)) return "glossary_term";
  if (/^\/grammar\/tags\//.test(pathname)) return "grammar_tag";
  if (/^\/grammar\/sections\//.test(pathname)) return "grammar_section";
  if (/^\/grammar\/[^/]+$/.test(pathname)) return "grammar_article";
  if (/^\/dictionary\/word\//.test(pathname)) return "dictionary_word";
  if (/^\/dictionary\/hsk\/[^/]+\/[^/]+$/.test(pathname)) {
    return "dictionary_hsk_level";
  }
  if (/^\/dictionary\//.test(pathname)) return "dictionary_hub";
  if (/^\/hsk\/[^/]+$/.test(pathname)) return "hsk_level";
  if (/^\/chinese\/hsk-test\/level-/.test(pathname)) return "hsk_test_level";
  if (/^\/chinese\/hsk-test/.test(pathname)) return "hsk_test";
  if (/^\/cities\/[^/]+$/.test(pathname)) return "city";
  if (/^\/courses\/[^/]+$/.test(pathname)) return "course";
  if (/^\/team\/[^/]+$/.test(pathname)) return "teacher";
  if (/^\/learn\//.test(pathname)) return "learn_hub";
  return "static_page";
}

function rangesFor(html: string, tag: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const expression = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  for (const match of html.matchAll(expression)) {
    if (match.index !== undefined) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
}

function breadcrumbRanges(html: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const expression =
    /<nav\b[^>]*(?:aria-label="[^"]*(?:хлеб|breadcrumb)[^"]*"|class="[^"]*breadcrumb[^"]*")[^>]*>[\s\S]*?<\/nav>/gi;
  for (const match of html.matchAll(expression)) {
    if (match.index !== undefined) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
}

function within(index: number, ranges: readonly [number, number][]): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function normalizeInternalDestination(
  href: string,
  sourceUrl: string,
  domain: string,
): string | undefined {
  if (
    !href ||
    href.startsWith("#") ||
    /^(?:mailto|tel|javascript):/i.test(href)
  ) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(decodeHtml(href), sourceUrl);
  } catch {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const internalHosts = new Set([
    domain,
    `www.${domain}`,
    "chinachild-site.vercel.app",
  ]);
  if (!internalHosts.has(parsed.hostname.toLowerCase()) && host !== domain) {
    return undefined;
  }
  if (parsed.pathname.startsWith("/_next/")) return undefined;
  return `https://${domain}${parsed.pathname}${parsed.search}`;
}

function commercialPath(pathname: string): boolean {
  return (
    (COMMERCIAL_DESTINATIONS as readonly string[]).includes(pathname) ||
    pathname === "/cities" ||
    pathname.startsWith("/cities/")
  );
}

function aggregateVisibility(collection: NormalizedCollection): Map<string, Visibility> {
  const byPath = new Map<string, Omit<Visibility, "sourceVisibility">>();
  const row = (pathname: string) => {
    const existing = byPath.get(pathname);
    if (existing) return existing;
    const created = {
      sourceGoogleImpressions: 0,
      sourceGoogleClicks: 0,
      sourceGa4OrganicSessions: 0,
      sourceMetrikaOrganicVisits: 0,
    };
    byPath.set(pathname, created);
    return created;
  };
  for (const record of collection.searchPerformance) {
    if (
      record.provider !== "google_search_console" ||
      record.view !== "page" ||
      record.period !== "current" ||
      !record.page
    ) {
      continue;
    }
    const pathname = new URL(record.page).pathname;
    const target = row(pathname);
    target.sourceGoogleImpressions += record.impressions;
    target.sourceGoogleClicks += record.clicks;
  }
  for (const record of collection.traffic) {
    if (record.period !== "current" || record.view !== "landing_page") continue;
    if (!record.landingPage) continue;
    let pathname: string;
    try {
      pathname = new URL(record.landingPage, "https://chinachild.ru").pathname;
    } catch {
      continue;
    }
    const target = row(pathname);
    if (record.provider === "google_analytics") {
      target.sourceGa4OrganicSessions += record.sessions ?? 0;
    } else {
      target.sourceMetrikaOrganicVisits += record.visits ?? 0;
    }
  }
  return new Map(
    [...byPath.entries()].map(([pathname, metrics]) => {
      const maximum = Math.max(
        metrics.sourceGoogleImpressions / 10,
        metrics.sourceGa4OrganicSessions,
        metrics.sourceMetrikaOrganicVisits,
      );
      return [
        pathname,
        {
          ...metrics,
          sourceVisibility:
            maximum >= 100
              ? "high"
              : maximum >= 10
                ? "medium"
                : maximum > 0
                  ? "low"
                  : "unknown",
        },
      ];
    }),
  );
}

export async function buildInternalLinkInventory(options: {
  buildAppDirectory: string;
  collection: NormalizedCollection;
  domain?: string;
}): Promise<{
  records: InternalLinkRecord[];
  destinationSummary: InternalLinkDestinationSummary[];
  inspectedHtmlPages: number;
}> {
  const domain = options.domain ?? "chinachild.ru";
  const visibility = aggregateVisibility(options.collection);
  const provisional: Array<
    Omit<
      InternalLinkRecord,
      "generatedBySharedCode" | "promotesMultipleCompetingCommercialPages"
    >
  > = [];
  const files = await htmlFiles(options.buildAppDirectory);
  for (const filename of files) {
    const pathname = routeFromHtmlFilename(options.buildAppDirectory, filename);
    if (pathname === "/_not-found") continue;
    const sourceUrl = `https://${domain}${pathname}`;
    const html = await readFile(filename, "utf8");
    const header = rangesFor(html, "header");
    const footer = rangesFor(html, "footer");
    const breadcrumbs = breadcrumbRanges(html);
    const template = sourceTemplate(pathname);
    const metrics: Visibility = visibility.get(pathname) ?? {
      sourceGoogleImpressions: 0,
      sourceGoogleClicks: 0,
      sourceGa4OrganicSessions: 0,
      sourceMetrikaOrganicVisits: 0,
      sourceVisibility: "unknown",
    };
    const seen = new Set<string>();
    const linkPattern = /<a\b([^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*)>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(linkPattern)) {
      const href = match[2] ?? match[3] ?? "";
      const destinationUrl = normalizeInternalDestination(href, sourceUrl, domain);
      if (!destinationUrl || match.index === undefined) continue;
      const anchorText = textContent(match[4]) || "[без текста]";
      const placement = within(match.index, header)
        ? "header"
        : within(match.index, footer)
          ? "footer"
          : within(match.index, breadcrumbs)
            ? "breadcrumb"
            : "body";
      const classification =
        placement === "header" || placement === "footer"
          ? "global"
          : placement === "breadcrumb"
            ? "breadcrumb"
            : "contextual";
      const key = `${destinationUrl}\u0000${anchorText}\u0000${placement}`;
      if (seen.has(key)) continue;
      seen.add(key);
      provisional.push({
        sourceUrl,
        sourceTemplate: template,
        destinationUrl,
        anchorText,
        classification,
        placement,
        ...metrics,
      });
    }
  }

  const templateSources = new Map<string, Set<string>>();
  const templateLinks = new Map<string, Set<string>>();
  for (const record of provisional) {
    const sources = templateSources.get(record.sourceTemplate) ?? new Set();
    sources.add(record.sourceUrl);
    templateSources.set(record.sourceTemplate, sources);
    const key = `${record.sourceTemplate}\u0000${record.destinationUrl}\u0000${record.anchorText}\u0000${record.placement}`;
    const links = templateLinks.get(key) ?? new Set();
    links.add(record.sourceUrl);
    templateLinks.set(key, links);
  }
  const contextualCommercialBySource = new Map<string, Set<string>>();
  for (const record of provisional) {
    if (record.classification !== "contextual") continue;
    const pathname = new URL(record.destinationUrl).pathname;
    if (!commercialPath(pathname)) continue;
    const targets = contextualCommercialBySource.get(record.sourceUrl) ?? new Set();
    targets.add(pathname);
    contextualCommercialBySource.set(record.sourceUrl, targets);
  }

  const records: InternalLinkRecord[] = provisional.map((record) => {
    const key = `${record.sourceTemplate}\u0000${record.destinationUrl}\u0000${record.anchorText}\u0000${record.placement}`;
    const templateCount = templateSources.get(record.sourceTemplate)?.size ?? 1;
    const linkCount = templateLinks.get(key)?.size ?? 1;
    return {
      ...record,
      generatedBySharedCode:
        record.classification !== "contextual" ||
        (templateCount >= 2 && linkCount / templateCount >= 0.8),
      promotesMultipleCompetingCommercialPages:
        (contextualCommercialBySource.get(record.sourceUrl)?.size ?? 0) > 1,
    };
  });

  const destinations = new Set(
    records
      .map((record) => new URL(record.destinationUrl).pathname)
      .filter(commercialPath),
  );
  const destinationSummary = [...destinations].sort().map((destinationPath) => {
    const inbound = records.filter(
      (record) => new URL(record.destinationUrl).pathname === destinationPath,
    );
    const counts = (values: string[]): string =>
      [...new Set(values)]
        .map((value) => ({
          value,
          count: values.filter((candidate) => candidate === value).length,
        }))
        .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
        .slice(0, 8)
        .map((item) => `${item.value} (${item.count})`)
        .join("; ");
    return {
      destinationUrl: `https://${domain}${destinationPath}`,
      totalInboundLinks: inbound.length,
      contextualInboundLinks: inbound.filter(
        (record) => record.classification === "contextual",
      ).length,
      globalInboundLinks: inbound.filter(
        (record) => record.classification === "global",
      ).length,
      breadcrumbInboundLinks: inbound.filter(
        (record) => record.classification === "breadcrumb",
      ).length,
      uniqueSourcePages: new Set(inbound.map((record) => record.sourceUrl)).size,
      highVisibilitySourcePages: new Set(
        inbound
          .filter((record) => record.sourceVisibility === "high")
          .map((record) => record.sourceUrl),
      ).size,
      mostCommonAnchors: counts(inbound.map((record) => record.anchorText)),
      strongestSharedTemplateSources: counts(
        inbound
          .filter((record) => record.generatedBySharedCode)
          .map((record) => record.sourceTemplate),
      ),
    };
  });
  return { records, destinationSummary, inspectedHtmlPages: files.length };
}
