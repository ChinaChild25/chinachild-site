import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SeoConfig } from "./config.mts";
import {
  buildInternalLinkInventory,
  type InternalLinkDestinationSummary,
  type InternalLinkRecord,
} from "./internal-links.mts";
import { loadCollection, writeReportFiles } from "./storage.mts";
import type {
  GoalRecord,
  NormalizedCollection,
} from "./types.mts";
import {
  parseCsv,
  type EnhancedBackfillQueue,
  type EnhancedExportState,
  type YandexEnhancedQueryUrlRecord,
} from "./yandex-enhanced-export.mts";

type ClusterId =
  | "online_chinese_school"
  | "online_chinese_courses"
  | "course_catalogue"
  | "online_chinese_tutor"
  | "chinese_for_adults"
  | "chinese_for_children"
  | "hsk_preparation"
  | "chinese_course_prices"
  | "business_chinese_individual"
  | "corporate_chinese_training"
  | "city_specific_courses"
  | "chinese_from_zero";

export const COMMERCIAL_OWNERSHIP = [
  {
    route: "/",
    primaryOwnership:
      "ChinaChild as an online Chinese-language school; brand and school-choice intent",
  },
  {
    route: "/courses",
    primaryOwnership: "Catalogue and comparison of available learning programs",
  },
  {
    route: "/courses/online-chinese",
    primaryOwnership: "Main general online Chinese course",
  },
  {
    route: "/repetitor-kitayskogo",
    primaryOwnership:
      "Individual online lessons with a selected Chinese teacher",
  },
  {
    route: "/courses/chinese-for-adults",
    primaryOwnership: "Chinese for adult learners",
  },
  {
    route: "/courses/chinese-for-kids",
    primaryOwnership: "Chinese for children and schoolchildren aged 12+",
  },
  {
    route: "/courses/hsk-preparation",
    primaryOwnership: "HSK preparation",
  },
  {
    route: "/price",
    primaryOwnership: "Prices, packages, payment, and cost questions",
  },
  {
    route: "/corporate",
    primaryOwnership:
      "B2B training purchased by a company, HR department, or employer",
  },
  {
    route: "/courses/business-chinese",
    primaryOwnership: "Business Chinese purchased by an individual learner",
  },
  {
    route: "/cities/{city}",
    primaryOwnership: "Online Chinese service relevant to a named city",
  },
  {
    route: "/free-trial",
    primaryOwnership: "Canonical trial-lesson conversion destination",
  },
] as const;

type Cluster = {
  id: ClusterId;
  label: string;
  intendedTarget: string;
  matches: (query: string) => boolean;
};

type QueryUrlRow = {
  cluster: string;
  provider: string;
  landingPageVerified: boolean;
  currentWinningUrl: string;
  url: string;
  queryExamples: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
  averagePosition: number | null;
  region: string;
  intendedTargetUrl: string;
  currentUrlMatchesIntent: "yes" | "no" | "unknown";
  confidence: "high" | "medium" | "low" | "insufficient";
  evidenceClassification:
    | "deliberate_segmentation"
    | "harmless_long_tail_overlap"
    | "weak_page_ownership"
    | "legacy_url_leakage"
    | "informational_commercial_overlap"
    | "actual_competing_landing_pages"
    | "matches_intended_target"
    | "insufficient_evidence";
  providerLimitations: string;
};

type MutableAggregate = {
  cluster: Cluster;
  provider: string;
  verified: boolean;
  page: string;
  region: Set<string>;
  queries: Map<string, number>;
  impressions: number;
  clicks: number;
  positionedImpressions: number;
  positionWeighted: number;
  limitation: string;
};

type ProtectedPage = {
  url: string;
  whyProtected: string;
  mainQueries: string;
  providerEvidence: string;
  allowedFutureChanges: string;
  prohibitedFutureChanges: string;
};

type LegacyEvidenceRow = {
  legacyUrl: string;
  routeFamily: string;
  originalSemanticIntent: string;
  originalContentType: string;
  evidenceSource: string;
  currentTarget: string;
  liveStatus: string;
  liveLocation: string;
  semanticallyEquivalent: "yes" | "partial" | "no" | "unresolved";
  providerQueryEvidence: string;
  evidenceSupports: string;
  changeRisk: "high" | "medium" | "low";
};

const lower = (value: string): string =>
  value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");

const chinese = (query: string): boolean => /китай|chinese/i.test(query);
const cityPattern =
  /москв|петербург|спб|казан|краснодар|ростов|владивосток|новосибир|екатеринбург/i;

const CLUSTERS: Cluster[] = [
  {
    id: "city_specific_courses",
    label: "city-specific Chinese courses",
    intendedTarget: "/cities/{city}",
    matches: (query) => chinese(query) && cityPattern.test(query),
  },
  {
    id: "corporate_chinese_training",
    label: "corporate Chinese training for companies",
    intendedTarget: "/corporate",
    matches: (query) =>
      chinese(query) &&
      /корпоратив|компани|сотрудник|команд|работодател|\bhr\b/i.test(query),
  },
  {
    id: "business_chinese_individual",
    label: "business Chinese for an individual learner",
    intendedTarget: "/courses/business-chinese",
    matches: (query) =>
      chinese(query) &&
      /бизнес|делов|переговор|профессиональн/i.test(query),
  },
  {
    id: "chinese_course_prices",
    label: "Chinese-course prices",
    intendedTarget: "/price",
    matches: (query) =>
      chinese(query) && /цен|стоимост|сколько стоит|тариф|оплат/i.test(query),
  },
  {
    id: "hsk_preparation",
    label: "HSK preparation",
    intendedTarget: "/courses/hsk-preparation",
    matches: (query) =>
      /hsk|хск/i.test(query) &&
      /подготов|курс|заняти|репетитор|обуч/i.test(query),
  },
  {
    id: "chinese_for_adults",
    label: "Chinese for adults",
    intendedTarget: "/courses/chinese-for-adults",
    matches: (query) => chinese(query) && /взросл/i.test(query),
  },
  {
    id: "chinese_for_children",
    label: "Chinese for children and schoolchildren",
    intendedTarget: "/courses/chinese-for-kids",
    matches: (query) =>
      chinese(query) && /дет|ребен|ребён|школьн|подрост/i.test(query),
  },
  {
    id: "online_chinese_tutor",
    label: "online Chinese tutor",
    intendedTarget: "/repetitor-kitayskogo",
    matches: (query) =>
      chinese(query) && /репетитор|преподавател|индивидуальн.*урок/i.test(query),
  },
  {
    id: "online_chinese_school",
    label: "online Chinese school",
    intendedTarget: "/",
    matches: (query) =>
      chinese(query) && /школ/i.test(query) && /онлайн|online/i.test(query),
  },
  {
    id: "online_chinese_courses",
    label: "online Chinese courses",
    intendedTarget: "/courses/online-chinese",
    matches: (query) =>
      chinese(query) &&
      /курс|обучение|урок|заняти/i.test(query) &&
      /онлайн|online/i.test(query),
  },
  {
    id: "chinese_from_zero",
    label: "Chinese from zero",
    intendedTarget: "/courses/online-chinese",
    matches: (query) =>
      chinese(query) && /с нуля|для начинающ|начать изуч|начать учить/i.test(query),
  },
  {
    id: "course_catalogue",
    label: "course catalogue",
    intendedTarget: "/courses",
    matches: (query) => chinese(query) && /курс|программ.*обуч/i.test(query),
  },
];

const CORE_PATHS = new Set([
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
]);

const LEGACY_PATHS = new Set([
  "/kitayskiy-yazyk-s-nulya",
  "/kursy-kitayskogo-yazyka",
  "/kitayskiy-yazyk-dlya-detey",
  "/test-hsk",
  "/test-hsk-1",
  "/test-hsk-2",
  "/test-hsk-3",
  "/test-hsk-4",
]);

function clusterFor(query: string): Cluster | undefined {
  return CLUSTERS.find((cluster) => cluster.matches(lower(query)));
}

function pagePath(value: string): string {
  try {
    return new URL(value, "https://chinachild.ru").pathname;
  } catch {
    return value;
  }
}

function addAggregate(
  aggregates: Map<string, MutableAggregate>,
  options: {
    provider: string;
    verified: boolean;
    query: string;
    page?: string;
    region?: string;
    impressions: number;
    clicks: number;
    averagePosition: number | null;
    limitation: string;
  },
): void {
  const cluster = clusterFor(options.query);
  if (!cluster) return;
  const page = options.page ? pagePath(options.page) : "";
  const key = `${cluster.id}\u0000${options.provider}\u0000${page}`;
  const aggregate =
    aggregates.get(key) ??
    {
      cluster,
      provider: options.provider,
      verified: options.verified,
      page,
      region: new Set<string>(),
      queries: new Map<string, number>(),
      impressions: 0,
      clicks: 0,
      positionedImpressions: 0,
      positionWeighted: 0,
      limitation: options.limitation,
    };
  aggregate.impressions += options.impressions;
  aggregate.clicks += options.clicks;
  if (options.averagePosition !== null && options.impressions > 0) {
    aggregate.positionedImpressions += options.impressions;
    aggregate.positionWeighted += options.averagePosition * options.impressions;
  }
  if (options.region) aggregate.region.add(options.region);
  aggregate.queries.set(
    options.query,
    (aggregate.queries.get(options.query) ?? 0) + options.impressions,
  );
  aggregates.set(key, aggregate);
}

function confidence(impressions: number, verified: boolean): QueryUrlRow["confidence"] {
  if (!verified) return "insufficient";
  if (impressions >= 50) return "high";
  if (impressions >= 10) return "medium";
  return "low";
}

function intendedMatch(cluster: Cluster, pathname: string): boolean {
  return cluster.id === "city_specific_courses"
    ? pathname.startsWith("/cities/")
    : pathname === cluster.intendedTarget;
}

function isInformational(pathname: string): boolean {
  return /^\/(?:blog|learn|glossary|grammar|dictionary|hsk|chinese\/hsk-test)/.test(
    pathname,
  );
}

function queryRows(
  collection: NormalizedCollection,
  enhanced: readonly YandexEnhancedQueryUrlRecord[],
): QueryUrlRow[] {
  const aggregates = new Map<string, MutableAggregate>();
  for (const record of collection.searchPerformance) {
    if (record.period !== "current" || !record.query) continue;
    if (
      record.provider === "google_search_console" &&
      record.view === "detail" &&
      record.page
    ) {
      addAggregate(aggregates, {
        provider: "google_search_console",
        verified: true,
        query: record.query,
        page: record.page,
        region: record.country ? `country:${record.country}` : undefined,
        impressions: record.impressions,
        clicks: record.clicks,
        averagePosition: record.averagePosition,
        limitation:
          "Top disclosed Search Console rows; anonymized and low-volume queries may be omitted.",
      });
    } else if (
      record.provider === "yandex_webmaster" &&
      record.view === "popular_query" &&
      record.device === "all"
    ) {
      addAggregate(aggregates, {
        provider: "yandex_webmaster_popular",
        verified: false,
        query: record.query,
        impressions: record.impressions,
        clicks: record.clicks,
        averagePosition: record.averagePosition,
        limitation:
          "Popular-query export has no verified landing-page dimension; URL-like query suffixes are not treated as landing pages.",
      });
    }
  }
  for (const record of enhanced) {
    addAggregate(aggregates, {
      provider: "yandex_webmaster_enhanced",
      verified: true,
      query: record.query,
      page: record.page,
      region: record.region,
      impressions: record.impressions,
      clicks: record.clicks,
      averagePosition: record.averagePosition,
      limitation:
        "Exact URL-level enhanced export; coverage is limited to persisted task URL-days and regions.",
    });
  }

  const values = [...aggregates.values()];
  const winners = new Map<string, string>();
  for (const aggregate of values) {
    const key = `${aggregate.cluster.id}\u0000${aggregate.provider}`;
    const existingPath = winners.get(key);
    const existing = values.find(
      (candidate) =>
        candidate.cluster.id === aggregate.cluster.id &&
        candidate.provider === aggregate.provider &&
        candidate.page === existingPath,
    );
    if (!existing || aggregate.impressions > existing.impressions) {
      winners.set(key, aggregate.page);
    }
  }

  const rows = values.map((aggregate): QueryUrlRow => {
    const pathname = aggregate.page;
    const providerGroup = values.filter(
      (candidate) =>
        candidate.cluster.id === aggregate.cluster.id &&
        candidate.provider === aggregate.provider,
    );
    const significantCommercial = providerGroup.filter(
      (candidate) =>
        CORE_PATHS.has(candidate.page) &&
        candidate.impressions >=
          Math.max(
            2,
            providerGroup.reduce((sum, item) => sum + item.impressions, 0) * 0.1,
          ),
    );
    const exactQueryCompetition = [...aggregate.queries].some(
      ([query, impressions]) =>
        impressions > 0 &&
        significantCommercial.some(
          (candidate) =>
            candidate.page !== pathname &&
            (candidate.queries.get(query) ?? 0) > 0 &&
            impressions + (candidate.queries.get(query) ?? 0) >= 3,
        ),
    );
    let classification: QueryUrlRow["evidenceClassification"];
    if (!aggregate.verified || !pathname) {
      classification = "insufficient_evidence";
    } else if (intendedMatch(aggregate.cluster, pathname)) {
      classification =
        aggregate.cluster.id === "city_specific_courses"
          ? "deliberate_segmentation"
          : "matches_intended_target";
    } else if (LEGACY_PATHS.has(pathname) || pathname.startsWith("/guidebook/")) {
      classification = "legacy_url_leakage";
    } else if (isInformational(pathname)) {
      classification = "informational_commercial_overlap";
    } else if (exactQueryCompetition) {
      classification = "actual_competing_landing_pages";
    } else if (winners.get(`${aggregate.cluster.id}\u0000${aggregate.provider}`) === pathname) {
      classification = "weak_page_ownership";
    } else {
      classification = "harmless_long_tail_overlap";
    }
    return {
      cluster: aggregate.cluster.label,
      provider: aggregate.provider,
      landingPageVerified: aggregate.verified,
      currentWinningUrl: aggregate.verified
        ? winners.get(`${aggregate.cluster.id}\u0000${aggregate.provider}`) ?? ""
        : "unknown",
      url: pathname || "unknown",
      queryExamples: [...aggregate.queries.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 8)
        .map(([query]) => query)
        .join("; "),
      impressions: aggregate.impressions,
      clicks: aggregate.clicks,
      ctr:
        aggregate.impressions > 0
          ? aggregate.clicks / aggregate.impressions
          : null,
      averagePosition:
        aggregate.positionedImpressions > 0
          ? aggregate.positionWeighted / aggregate.positionedImpressions
          : null,
      region: [...aggregate.region].sort().join("; ") || "not available",
      intendedTargetUrl: aggregate.cluster.intendedTarget,
      currentUrlMatchesIntent: !aggregate.verified
        ? "unknown"
        : intendedMatch(aggregate.cluster, pathname)
          ? "yes"
          : "no",
      confidence: confidence(aggregate.impressions, aggregate.verified),
      evidenceClassification: classification,
      providerLimitations: aggregate.limitation,
    };
  });

  for (const cluster of CLUSTERS) {
    if (!rows.some((row) => row.cluster === cluster.label)) {
      rows.push({
        cluster: cluster.label,
        provider: "no_disclosed_rows",
        landingPageVerified: false,
        currentWinningUrl: "unknown",
        url: "unknown",
        queryExamples: "",
        impressions: 0,
        clicks: 0,
        ctr: null,
        averagePosition: null,
        region: "not available",
        intendedTargetUrl: cluster.intendedTarget,
        currentUrlMatchesIntent: "unknown",
        confidence: "insufficient",
        evidenceClassification: "insufficient_evidence",
        providerLimitations: "No matching disclosed provider rows in the selected period.",
      });
    }
  }
  return rows.sort(
    (left, right) =>
      left.cluster.localeCompare(right.cluster) ||
      left.provider.localeCompare(right.provider) ||
      right.impressions - left.impressions,
  );
}

export function buildCommercialQueryRowsForTest(
  collection: NormalizedCollection,
  enhanced: readonly YandexEnhancedQueryUrlRecord[] = [],
): QueryUrlRow[] {
  return queryRows(collection, enhanced);
}

function csvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "number" ? String(value) : String(value);
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n") + "\n";
}

function queryUrlCsv(rows: QueryUrlRow[]): string {
  return csv(
    rows.map((row) => ({
      normalized_query_cluster: row.cluster,
      provider: row.provider,
      landing_page_verified: row.landingPageVerified,
      current_winning_url: row.currentWinningUrl,
      url_receiving_impressions: row.url,
      query_examples: row.queryExamples,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      average_position: row.averagePosition,
      region: row.region,
      intended_target_url: row.intendedTargetUrl,
      current_url_matches_intent: row.currentUrlMatchesIntent,
      confidence: row.confidence,
      evidence_classification: row.evidenceClassification,
      provider_limitations: row.providerLimitations,
    })),
  );
}

function internalInventoryCsv(records: InternalLinkRecord[]): string {
  return csv(
    records.map((record) => ({
      source_url: record.sourceUrl,
      source_template: record.sourceTemplate,
      destination_url: record.destinationUrl,
      anchor_text: record.anchorText,
      classification: record.classification,
      placement: record.placement,
      source_google_impressions: record.sourceGoogleImpressions,
      source_google_clicks: record.sourceGoogleClicks,
      source_ga4_organic_sessions: record.sourceGa4OrganicSessions,
      source_metrika_organic_visits: record.sourceMetrikaOrganicVisits,
      source_visibility: record.sourceVisibility,
      generated_by_shared_code: record.generatedBySharedCode,
      promotes_multiple_competing_commercial_pages:
        record.promotesMultipleCompetingCommercialPages,
    })),
  );
}

function destinationSummaryCsv(
  rows: InternalLinkDestinationSummary[],
): string {
  return csv(
    rows.map((row) => ({
      destination_url: row.destinationUrl,
      total_inbound_internal_links: row.totalInboundLinks,
      contextual_inbound_links: row.contextualInboundLinks,
      global_inbound_links: row.globalInboundLinks,
      breadcrumb_inbound_links: row.breadcrumbInboundLinks,
      unique_source_pages: row.uniqueSourcePages,
      high_visibility_source_pages: row.highVisibilitySourcePages,
      most_common_anchors: row.mostCommonAnchors,
      strongest_shared_template_sources: row.strongestSharedTemplateSources,
    })),
  );
}

function pageMetrics(collection: NormalizedCollection) {
  const metrics = new Map<
    string,
    {
      impressions: number;
      clicks: number;
      gaSessions: number;
      metrikaVisits: number;
      queries: Map<string, number>;
    }
  >();
  const get = (pathname: string) => {
    const existing = metrics.get(pathname);
    if (existing) return existing;
    const created = {
      impressions: 0,
      clicks: 0,
      gaSessions: 0,
      metrikaVisits: 0,
      queries: new Map<string, number>(),
    };
    metrics.set(pathname, created);
    return created;
  };
  for (const record of collection.searchPerformance) {
    if (
      record.provider !== "google_search_console" ||
      record.period !== "current" ||
      !record.page
    ) {
      continue;
    }
    const pathname = pagePath(record.page);
    if (record.view === "page") {
      const target = get(pathname);
      target.impressions += record.impressions;
      target.clicks += record.clicks;
    } else if (record.view === "detail" && record.query) {
      const target = get(pathname);
      target.queries.set(
        record.query,
        (target.queries.get(record.query) ?? 0) + record.impressions,
      );
    }
  }
  for (const record of collection.traffic) {
    if (
      record.period !== "current" ||
      record.view !== "landing_page" ||
      !record.landingPage
    ) {
      continue;
    }
    const target = get(pagePath(record.landingPage));
    if (record.provider === "google_analytics") {
      target.gaSessions += record.sessions ?? 0;
    } else {
      target.metrikaVisits += record.visits ?? 0;
    }
  }
  return metrics;
}

function protectedPages(collection: NormalizedCollection): ProtectedPage[] {
  const metrics = pageMetrics(collection);
  const pages: ProtectedPage[] = [];
  for (const [pathname, values] of metrics) {
    const hskQueryImpressions = [...values.queries.entries()]
      .filter(([query]) => /hsk|хск/i.test(query))
      .reduce((sum, [, impressions]) => sum + impressions, 0);
    const hskCluster =
      /(?:^|\/)hsk(?:-|\/|$)|\/chinese\/hsk-test|\/courses\/hsk-preparation/.test(
        pathname,
      ) || hskQueryImpressions >= 10;
    const strong =
      values.impressions >= 1000 ||
      values.clicks >= 20 ||
      values.gaSessions >= 100 ||
      values.metrikaVisits >= 100;
    if (!hskCluster && !strong) continue;
    const mainQueries = [...values.queries.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([query, impressions]) => `${query} (${impressions})`)
      .join("; ");
    pages.push({
      url: `https://chinachild.ru${pathname}`,
      whyProtected: [
        strong ? "strong current organic evidence" : "",
        hskCluster ? "HSK cluster default protection" : "",
      ]
        .filter(Boolean)
        .join("; "),
      mainQueries,
      providerEvidence:
        `GSC ${values.impressions} impressions/${values.clicks} clicks; ` +
        `GA4 ${values.gaSessions} organic sessions; ` +
        `Metrica ${values.metrikaVisits} organic visits`,
      allowedFutureChanges:
        "Narrow factual correction or proven defect fix with before/after regression evidence.",
      prohibitedFutureChanges:
        "Broad rewrite; route, redirect, canonical, title or H1 change without exact conflict evidence; removal of working contextual links; visual change.",
    });
  }
  return pages.sort((left, right) => left.url.localeCompare(right.url));
}

function protectedRulesMarkdown(pages: ProtectedPage[]): string {
  return `# Protected page rules

Generated from the current provider run. Protected pages: ${pages.length}.

## Default policy

- No broad content rewrite, route change, redirect, canonical change, or visual change.
- No title or H1 change unless exact query-to-URL evidence proves a conflict.
- Do not remove working contextual links.
- Allow only narrow factual corrections or a demonstrated defect fix with regression evidence.
- Treat the HSK commercial and informational cluster as protected even when individual disclosed metrics are small.

## Release guard

Any future change to a protected URL must record the exact provider baseline, intended query ownership, changed fields, and a post-recrawl comparison. A ranking change alone is not proof of causation.
`;
}

async function readEnhanced(
  outputDirectory: string,
  runId: string,
): Promise<{
  records: YandexEnhancedQueryUrlRecord[];
  state?: EnhancedExportState;
  queue?: EnhancedBackfillQueue;
}> {
  try {
    const raw: unknown = JSON.parse(
      await readFile(
        path.join(
          outputDirectory,
          "runs",
          runId,
          "normalized/yandex-enhanced-query-url.json",
        ),
        "utf8",
      ),
    );
    const value = raw as {
      records?: YandexEnhancedQueryUrlRecord[];
    };
    let state: EnhancedExportState | undefined;
    try {
      state = JSON.parse(
        await readFile(
          path.join(
            outputDirectory,
            "runs",
            runId,
            "normalized/yandex-enhanced-export-state.json",
          ),
          "utf8",
        ),
      ) as EnhancedExportState;
    } catch {
      state = undefined;
    }
    let queue: EnhancedBackfillQueue | undefined;
    try {
      queue = JSON.parse(
        await readFile(
          path.join(
            outputDirectory,
            "runs",
            runId,
            "normalized/yandex-enhanced-backfill-queue.json",
          ),
          "utf8",
        ),
      ) as EnhancedBackfillQueue;
    } catch {
      queue = undefined;
    }
    return { records: value.records ?? [], state, queue };
  } catch {
    return { records: [] };
  }
}

function analyticsSummary(
  collection: NormalizedCollection,
): Array<Record<string, unknown>> {
  const paths = [...CORE_PATHS];
  const rows: Array<Record<string, unknown>> = [];
  for (const provider of ["google_analytics", "yandex_metrika"] as const) {
    for (const pathname of paths) {
      const records = collection.traffic.filter(
        (record) =>
          record.provider === provider &&
          record.period === "current" &&
          record.view === "landing_page" &&
          record.landingPage &&
          pagePath(record.landingPage) === pathname,
      );
      rows.push({
        provider,
        landing_page: pathname,
        sessions:
          provider === "google_analytics"
            ? records.reduce((sum, record) => sum + (record.sessions ?? 0), 0)
            : "",
        visits:
          provider === "yandex_metrika"
            ? records.reduce((sum, record) => sum + (record.visits ?? 0), 0)
            : "",
        conversions:
          provider === "google_analytics"
            ? records.reduce((sum, record) => sum + (record.conversions ?? 0), 0)
            : "",
        note:
          provider === "google_analytics"
            ? "GA4 landing sessions and property-configured key events; not added to other providers."
            : "Metrica organic visits; lead goals are available only as separate goal totals in the current normalized contract.",
      });
    }
  }
  return rows;
}

function goalSummary(goals: readonly GoalRecord[]): string {
  return goals
    .filter(
      (goal) =>
        goal.period === "current" &&
        ((goal.provider === "yandex_metrika" &&
          goal.goalId === "562860580" &&
          goal.searchEngine === "total_search") ||
          (goal.provider === "google_analytics" &&
            goal.goalName === "generate_lead" &&
            (goal.searchEngine === "total_search" ||
              goal.searchEngine === undefined))),
    )
    .map(
      (goal) =>
        `${goal.provider}: ${goal.goalName}=${goal.conversions}` +
        (goal.searchEngine ? ` (${goal.searchEngine})` : ""),
    )
    .join("\n");
}

async function probe(
  url: string,
): Promise<{ status: string; location: string }> {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
      headers: { "User-Agent": "ChinaChild-SEO-Evidence/1.0" },
    });
    return {
      status: String(response.status),
      location: response.headers.get("location") ?? "",
    };
  } catch (error) {
    return {
      status: "unavailable",
      location: error instanceof Error ? error.message : String(error),
    };
  }
}

async function legacyEvidence(
  repositoryRoot: string,
  collection: NormalizedCollection,
  probeLive: boolean,
): Promise<LegacyEvidenceRow[]> {
  const redirectCsv = parseCsv(
    await readFile(
      path.join(repositoryRoot, "docs/cutover/redirect-map.csv"),
      "utf8",
    ),
  );
  const headers = redirectCsv[0];
  const index = (name: string) => headers.indexOf(name);
  const candidates = redirectCsv.slice(1).filter((row) => {
    const source = row[index("source_path")] ?? row[0];
    return (
      /^\/(?:kitayskiy-yazyk|kursy-kitayskogo|guidebook|test-hsk)/.test(
        source,
      ) ||
      /go\.chinachild\.ru/.test(row.join(" "))
    );
  });
  const gscLegacy = new Map<string, number>();
  for (const record of collection.searchPerformance) {
    if (
      record.provider === "google_search_console" &&
      record.period === "current" &&
      record.view === "page" &&
      record.page
    ) {
      gscLegacy.set(pagePath(record.page), record.impressions);
    }
  }
  const rows: LegacyEvidenceRow[] = [];
  for (const row of candidates) {
    const source =
      row[index("old_path")] ??
      row.find((value) => value.startsWith("/")) ??
      "";
    const destination =
      row[index("new_path")] ||
      row[index("new_url")] ||
      row.find(
        (value, valueIndex) => valueIndex > 0 && value.startsWith("/"),
      ) ||
      "";
    const note = row[index("reason")] ?? row.at(-1) ?? "";
    const priority =
      row[index("confidence")] ??
      row.find((value) => ["high", "medium", "low"].includes(value)) ??
      "low";
    const live = probeLive
      ? await probe(`https://chinachild.ru${source}`)
      : { status: "not probed", location: "" };
    let originalIntent = "unresolved";
    let contentType = "unresolved";
    if (source.startsWith("/guidebook/")) {
      originalIntent = note || "legacy guidebook topic; exact intent unresolved";
      contentType = "informational article";
    } else if (source.startsWith("/test-hsk")) {
      originalIntent = "HSK level diagnostic";
      contentType = "interactive test landing";
    } else if (source === "/kursy-kitayskogo-yazyka") {
      originalIntent = "Chinese courses; commercial versus article emphasis unresolved";
      contentType = "old courses article/landing per redirect inventory";
    } else if (source === "/kitayskiy-yazyk-dlya-detey") {
      originalIntent = "Chinese for children";
      contentType = "commercial or mixed landing";
    } else if (source === "/kitayskiy-yazyk-s-nulya") {
      originalIntent = "Chinese from zero; commercial versus informational emphasis unresolved";
      contentType = "mixed or unresolved landing";
    } else if (/members|page\d+\.html/.test(source)) {
      originalIntent = "legacy member-area shared UI";
      contentType = "Tilda member-area block";
    }
    const unresolvedCommercialHistory =
      source === "/kitayskiy-yazyk-s-nulya" ||
      source === "/kursy-kitayskogo-yazyka";
    rows.push({
      legacyUrl: source,
      routeFamily: source.split("/").slice(0, 2).join("/") || "/",
      originalSemanticIntent: originalIntent,
      originalContentType: contentType,
      evidenceSource:
        `docs/cutover/redirect-map.csv; ${note || "no detailed historical copy"}; live probe`,
      currentTarget: destination,
      liveStatus: live.status,
      liveLocation: live.location,
      semanticallyEquivalent:
        unresolvedCommercialHistory
          ? "partial"
          : priority === "high"
          ? "yes"
          : priority === "medium"
            ? "partial"
            : "unresolved",
      providerQueryEvidence: `${gscLegacy.get(source) ?? 0} current GSC page impressions`,
      evidenceSupports:
        unresolvedCommercialHistory
          ? "insufficient historical copy and exact Yandex URL evidence for a redirect change"
          : priority === "high"
          ? "retain unless enhanced query evidence proves a mismatch"
          : "insufficient evidence for a redirect change",
      changeRisk: priority === "high" ? "high" : priority === "medium" ? "medium" : "low",
    });
  }

  const additional = [
    {
      url: "/blog/*",
      family: "/blog",
      intent: "current informational article family",
      type: "filesystem blog",
      target: "self",
      equivalent: "yes" as const,
      risk: "high" as const,
    },
    {
      url: "/chinese/hsk-test*",
      family: "/chinese/hsk-test",
      intent: "current HSK diagnostic family",
      type: "interactive diagnostic pages",
      target: "self",
      equivalent: "yes" as const,
      risk: "high" as const,
    },
  ];
  for (const item of additional) {
    rows.push({
      legacyUrl: item.url,
      routeFamily: item.family,
      originalSemanticIntent: item.intent,
      originalContentType: item.type,
      evidenceSource: "current route implementation and Git history",
      currentTarget: item.target,
      liveStatus: "current route family",
      liveLocation: "",
      semanticallyEquivalent: item.equivalent,
      providerQueryEvidence: "see protected-pages.csv and commercial matrix",
      evidenceSupports: "retain",
      changeRisk: item.risk,
    });
  }

  for (const alias of [
    {
      url: "/courses/adults",
      expectedTarget: "/courses/chinese-for-adults",
      intent: "short adult-course alias named in the supplied pass",
    },
    {
      url: "/courses/kids",
      expectedTarget: "/courses/chinese-for-kids",
      intent: "short children-course alias named in the supplied pass",
    },
  ]) {
    const live = probeLive
      ? await probe(`https://chinachild.ru${alias.url}`)
      : { status: "not probed", location: "" };
    rows.push({
      legacyUrl: alias.url,
      routeFamily: "/courses",
      originalSemanticIntent: alias.intent,
      originalContentType: "no current local route implementation",
      evidenceSource:
        "supplied PASS 1/PASS 2 route list; current app tree, navigation and sitemap; live response",
      currentTarget: live.location || alias.expectedTarget,
      liveStatus: live.status,
      liveLocation: live.location,
      semanticallyEquivalent:
        live.location === alias.expectedTarget ? "yes" : "unresolved",
      providerQueryEvidence:
        "included in the initial Yandex export request; no disclosed rows in the downloaded 14-day slice",
      evidenceSupports:
        live.location === alias.expectedTarget
          ? "preserve current canonical route and alias redirect"
          : "do not create or change a route without an explicit route decision",
      changeRisk: "high",
    });
  }

  for (const url of [
    "http://chinachild.ru/",
    "https://www.chinachild.ru/",
    "https://chinachild-site.vercel.app/",
    "https://go.chinachild.ru/",
  ]) {
    const live = probeLive
      ? await probe(url)
      : { status: "not probed", location: "" };
    rows.push({
      legacyUrl: url,
      routeFamily: new URL(url).hostname,
      originalSemanticIntent:
        url.includes("go.")
          ? "legacy Tilda site and member area"
          : "alternate origin for the public site",
      originalContentType:
        url.includes("go.") ? "legacy Tilda site" : "alternate host/protocol",
      evidenceSource: "cutover documentation and live response",
      currentTarget: live.location || (url.includes("go.") ? "self" : "https://chinachild.ru/"),
      liveStatus: live.status,
      liveLocation: live.location,
      semanticallyEquivalent: url.includes("go.") ? "unresolved" : "yes",
      providerQueryEvidence: "not attributable from current normalized provider rows",
      evidenceSupports: url.includes("go.")
        ? "owner decision required for indexability; no redirect recommendation yet"
        : "retain origin consolidation",
      changeRisk: url.includes("go.") ? "medium" : "high",
    });
  }
  return rows;
}

function legacyCsv(rows: LegacyEvidenceRow[]): string {
  return csv(
    rows.map((row) => ({
      legacy_url: row.legacyUrl,
      route_family: row.routeFamily,
      original_semantic_intent: row.originalSemanticIntent,
      original_content_type: row.originalContentType,
      evidence_source: row.evidenceSource,
      current_target: row.currentTarget,
      live_status: row.liveStatus,
      live_location: row.liveLocation,
      semantically_equivalent: row.semanticallyEquivalent,
      provider_query_evidence: row.providerQueryEvidence,
      evidence_supports: row.evidenceSupports,
      risk_of_change: row.changeRisk,
    })),
  );
}

function protectedCsv(rows: ProtectedPage[]): string {
  return csv(
    rows.map((row) => ({
      url: row.url,
      why_protected: row.whyProtected,
      main_queries: row.mainQueries,
      provider_evidence: row.providerEvidence,
      allowed_future_changes: row.allowedFutureChanges,
      prohibited_future_changes: row.prohibitedFutureChanges,
    })),
  );
}

function ownershipMapMarkdown(): string {
  return `# Confirmed commercial ownership map

Repository routes, live canonical behavior, sitemap membership, and disclosed
provider rows are the source of truth. The nonexistent \`/courses/adults\`,
\`/courses/kids\`, and \`/repetitor\` paths are not ownership targets.

| Canonical route | Primary ownership |
| --- | --- |
${COMMERCIAL_OWNERSHIP.map(
  ({ route, primaryOwnership }) => `| \`${route}\` | ${primaryOwnership} |`,
).join("\n")}
`;
}

function ownerDecisionsMarkdown(
  enhancedState?: EnhancedExportState,
  enhancedQueue?: EnhancedBackfillQueue,
): string {
  const downloadedUnits =
    enhancedState?.tasks
      .filter((task) => task.status === "downloaded")
      .reduce((total, task) => total + task.quotaUnits, 0) ?? 0;
  const queueUnits = enhancedQueue?.units.length ?? 0;
  const coveredQueueUnits =
    enhancedQueue?.units.filter((unit) => unit.status === "covered").length ?? 0;
  return `# Owner decisions required

The downloaded Yandex enhanced-export archive contains ${downloadedUnits}
URL-days. The corrected canonical backfill queue has ${coveredQueueUnits} of
${queueUnits || "an unknown number of"} URL-days covered. This limited slice is
not complete historical evidence, and absence from it must not be treated as
proof of no demand.

1. Confirm whether the historical \`/kitayskiy-yazyk-s-nulya\` intent was commercial, informational, or deliberately mixed. Repository history does not contain the removed page copy.
2. Confirm whether the public homepage of \`go.chinachild.ru\` must remain indexable while legacy member-area paths remain available.

Confirmed commercial ownership is recorded in
\`commercial-ownership-map.md\`; it uses current canonical URLs only.
`;
}

function commercialSummaryMarkdown(options: {
  sourceRunId: string;
  evidenceRunId: string;
  rows: QueryUrlRow[];
  enhancedState?: EnhancedExportState;
  enhancedQueue?: EnhancedBackfillQueue;
  inspectedPages: number;
  protectedCount: number;
  analytics: Array<Record<string, unknown>>;
  goals: string;
}): string {
  const taskLines =
    options.enhancedState?.tasks.map(
      (task) =>
        `- ${task.taskId ?? "unknown task"}: ${task.status}, ${task.paths.length} URLs × ${task.dates.length} days = ${task.quotaUnits} URL-days; paths: ${task.paths.join(", ")}`,
    ) ?? [];
  const issueCounts = new Map<string, number>();
  const allSubmittedTasksDownloaded =
    (options.enhancedState?.tasks.length ?? 0) > 0 &&
    options.enhancedState!.tasks.every((task) => task.status === "downloaded");
  const downloadedUrlDays =
    options.enhancedState?.tasks
      .filter((task) => task.status === "downloaded")
      .reduce((total, task) => total + task.quotaUnits, 0) ?? 0;
  const queueUrlDays = options.enhancedQueue?.units.length ?? 0;
  const coveredQueueUrlDays =
    options.enhancedQueue?.units.filter((unit) => unit.status === "covered")
      .length ?? 0;
  for (const row of options.rows) {
    issueCounts.set(
      row.evidenceClassification,
      (issueCounts.get(row.evidenceClassification) ?? 0) + 1,
    );
  }
  const providerCounts = new Map<string, number>();
  for (const row of options.rows) {
    providerCounts.set(row.provider, (providerCounts.get(row.provider) ?? 0) + 1);
  }
  return `# Commercial query-to-URL evidence

Evidence run: \`${options.evidenceRunId}\`

Base provider run: \`${options.sourceRunId}\`

## Confirmed facts

- Google Search Console query/page rows are landing-page verified but remain a disclosed top-row set.
- Yandex popular-query rows have no verified landing-page dimension and are never labeled as cannibalization.
- Provider metrics remain separate; impressions, clicks, visits, sessions, and goals are not added across providers.
- The internal-link inventory inspected ${options.inspectedPages} rendered local-build HTML pages.
- ${options.protectedCount} pages meet the evidence or HSK-cluster protection rules.
- Current code, live canonical behavior, navigation, sitemap, and provider evidence establish \`/repetitor-kitayskogo\`, \`/courses/chinese-for-adults\`, and \`/courses/chinese-for-kids\` as the canonical ownership routes.
- The supplied short route names \`/repetitor\`, \`/courses/adults\`, and \`/courses/kids\` are not current canonical routes and are excluded from the confirmed ownership map.
- This reporting period crosses the approximate June 2026 migration; growth is not interpreted as pure SEO improvement.

## Yandex enhanced export

${taskLines.length ? taskLines.join("\n") : "- No persisted task was found."}

All submitted tasks downloaded: ${allSubmittedTasksDownloaded ? "yes" : "no"}. ${
    allSubmittedTasksDownloaded
      ? "The submitted slice is complete; the wider backfill remains incomplete."
      : "Downloaded task rows are included; pending task rows are excluded until resume/download completes."
  }

## Matrix coverage

${[...providerCounts].map(([provider, count]) => `- ${provider}: ${count} cluster/URL rows`).join("\n")}

Evidence classifications:

${[...issueCounts].map(([issue, count]) => `- ${issue}: ${count}`).join("\n")}

## Analytics evidence kept separate

${options.analytics
  .filter((row) => Number(row.sessions ?? row.visits ?? 0) > 0)
  .map(
    (row) =>
      `- ${row.provider} ${row.landing_page}: sessions=${row.sessions || "n/a"}, visits=${row.visits || "n/a"}, conversions=${row.conversions || "n/a"}`,
  )
  .join("\n") || "- No core landing-page traffic rows were disclosed."}

Current goal totals, not URL-attributed:

\`\`\`text
${options.goals || "No current goal rows."}
\`\`\`

## Inferences

- Rows labeled weak ownership or competition are evidence classifications, not proof that one page caused another page to rank lower.
- Internal-link counts approximate authority distribution; they do not measure search-engine weighting.

## Missing evidence

- Exact Yandex query-to-URL evidence is complete only for the downloaded ${downloadedUrlDays} URL-day task archive, not for complete history.
- After removing nonexistent paths from future collection, ${coveredQueueUrlDays} of ${queueUrlDays || "the planned"} canonical URL-days are covered.
- The enhanced free slice does not represent all dates, URLs, or regions; the persisted queue records incomplete coverage.
- Current analytics normalization does not attribute Yandex Metrica lead goals to a landing URL.
- Removed copy for several pre-migration commercial URLs is absent from Git history, so their original commercial/informational balance remains unresolved.
`;
}

export async function generateCommercialEvidence(
  config: SeoConfig,
  options: {
    evidenceRunId: string;
    sourceRunId?: string;
    buildDirectory?: string;
    probeLive?: boolean;
    repositoryRoot?: string;
  },
): Promise<{ reportDirectory: string; summaryPath: string }> {
  const repositoryRoot = options.repositoryRoot ?? process.cwd();
  const collection = await loadCollection(
    config.outputDirectory,
    options.sourceRunId,
  );
  const enhanced = await readEnhanced(
    config.outputDirectory,
    options.evidenceRunId,
  );
  const matrix = queryRows(collection, enhanced.records);
  const links = await buildInternalLinkInventory({
    buildAppDirectory:
      options.buildDirectory ??
      path.join(repositoryRoot, ".next/server/app"),
    collection,
    domain: config.domain,
  });
  const protectedRows = protectedPages(collection);
  const legacyRows = await legacyEvidence(
    repositoryRoot,
    collection,
    options.probeLive === true,
  );
  const analytics = analyticsSummary(collection);
  const summary = commercialSummaryMarkdown({
    sourceRunId: collection.runId,
    evidenceRunId: options.evidenceRunId,
    rows: matrix,
    enhancedState: enhanced.state,
    enhancedQueue: enhanced.queue,
    inspectedPages: links.inspectedHtmlPages,
    protectedCount: protectedRows.length,
    analytics,
    goals: goalSummary(collection.goals),
  });
  const reportDirectory = await writeReportFiles(
    config.outputDirectory,
    options.evidenceRunId,
    {
      "commercial-query-url-matrix.csv": queryUrlCsv(matrix),
      "commercial-query-url-summary.md": summary,
      "internal-link-inventory.csv": internalInventoryCsv(links.records),
      "internal-link-destination-summary.csv": destinationSummaryCsv(
        links.destinationSummary,
      ),
      "protected-pages.csv": protectedCsv(protectedRows),
      "protected-page-rules.md": protectedRulesMarkdown(protectedRows),
      "legacy-route-evidence.csv": legacyCsv(legacyRows),
      "commercial-ownership-map.md": ownershipMapMarkdown(),
      "owner-decisions-required.md": ownerDecisionsMarkdown(
        enhanced.state,
        enhanced.queue,
      ),
      "analytics-commercial-landings.csv": csv(analytics),
      "provider-lead-events.csv": csv(
        collection.goals
          .filter((goal) => goal.period === "current")
          .map((goal) => ({
            provider: goal.provider,
            goal_id: goal.goalId,
            goal_name: goal.goalName,
            search_engine: goal.searchEngine,
            conversions: goal.conversions,
            metric: goal.sourceMetadata.metric,
            configured_as_key_event:
              goal.sourceMetadata.configuredAsKeyEvent,
            repository_documented_candidate:
              goal.sourceMetadata.repositoryDocumentedCandidate,
            warning:
              "Provider goal rows remain separate and must not be added across providers or dimension views.",
          })),
      ),
      "evidence-metadata.json":
        `${JSON.stringify(
          {
            schemaVersion: 1,
            generatedAt: new Date().toISOString(),
            evidenceRunId: options.evidenceRunId,
            sourceRunId: collection.runId,
            inspectedLocalBuildHtmlPages: links.inspectedHtmlPages,
            enhancedRows: enhanced.records.length,
            enhancedTasks: enhanced.state?.tasks ?? [],
            providerMetricsCombinedArithmetically: false,
          },
          null,
          2,
        )}\n`,
    },
  );
  return {
    reportDirectory,
    summaryPath: path.join(
      reportDirectory,
      "commercial-query-url-summary.md",
    ),
  };
}
