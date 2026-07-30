import path from "node:path";
import { countInclusiveDays } from "./date-range.mts";
import { loadCollection, writeReportFiles } from "./storage.mts";
import type {
  GoalRecord,
  NormalizedCollection,
  SearchPerformanceRecord,
  TechnicalRecord,
  TrafficRecord,
} from "./types.mts";

export type SearchIntent =
  | "primary_commercial"
  | "adjacent_commercial"
  | "competitor_or_brand"
  | "offline_or_geo"
  | "informational"
  | "other";

export type QueryClassification = {
  intent: SearchIntent;
  cluster?: string;
};

const STOP_WORDS = new Set([
  "для",
  "по",
  "на",
  "в",
  "во",
  "и",
  "или",
  "с",
  "со",
  "из",
]);

function canonicalToken(token: string): string {
  const stems: Array<[RegExp, string]> = [
    [/^китай/, "китай"],
    [/^язык/, "язык"],
    [/^онлайн/, "онлайн"],
    [/^школ/, "школа"],
    [/^курс/, "курс"],
    [/^обуч/, "обучение"],
    [/^репетитор/, "репетитор"],
    [/^преподавател/, "преподаватель"],
    [/^взросл/, "взрослый"],
    [/^урок/, "урок"],
    [/^заняти/, "занятие"],
    [/^цен/, "цена"],
    [/^стоимост/, "стоимость"],
    [/^запис/, "записаться"],
    [/^перевод/, "перевод"],
    [/^значени/, "значение"],
    [/^граммат/, "грамматика"],
    [/^правил/, "правило"],
    [/^иероглиф/, "иероглиф"],
    [/^слов/, "слово"],
  ];
  return stems.find(([pattern]) => pattern.test(token))?.[1] ?? token;
}

export function normalizeRussianQuery(query: string): string[] {
  return query
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .map(canonicalToken);
}

export function classifySearchIntent(
  query: string,
  configuredCommercialQueries: readonly string[],
  page?: string,
): QueryClassification {
  const tokens = new Set(normalizeRussianQuery(query));
  const lower = query.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
  if (page) {
    try {
      const hostname = new URL(page).hostname.replace(/^www\./, "");
      if (hostname !== "chinachild.ru" && !hostname.endsWith(".chinachild.ru")) {
        return { intent: "other" };
      }
    } catch {
      return { intent: "other" };
    }
  }

  const competitorTokens = [
    "chinachild",
    "китайчайлд",
    "хуамин",
    "конфуци",
    "институт",
    "университет",
  ];
  if (
    competitorTokens.some((token) => lower.includes(token)) ||
    /(?:hsk|хск).{0,20}(?:центр|center|centre)|(?:центр|center|centre).{0,20}(?:hsk|хск)/i.test(
      lower,
    )
  ) {
    return { intent: "competitor_or_brand" };
  }

  const geographicPrefixes = [
    "москв",
    "петербург",
    "спб",
    "казан",
    "краснодар",
    "владивосток",
    "новосибир",
    "екатеринбург",
    "самар",
    "омск",
    "уф",
    "перм",
    "ростов",
    "воронеж",
    "тюм",
    "иркутск",
  ];
  if (
    /\b(?:офлайн|offline|очно|очный|очная|очные)\b/i.test(lower) ||
    [...tokens].some((token) =>
      geographicPrefixes.some((prefix) => token.startsWith(prefix)),
    )
  ) {
    return { intent: "offline_or_geo" };
  }

  const selfStudyOrTravel = [...tokens].some(
    (token) =>
      token === "самостоятельно" ||
      token === "самоучитель" ||
      token === "самообучение" ||
      token === "дома" ||
      token.startsWith("путешеств") ||
      token.startsWith("турист") ||
      token.startsWith("поездк"),
  );
  const informationalTokens = [
    "как",
    "что",
    "почему",
    "перевод",
    "значение",
    "грамматика",
    "правило",
    "иероглиф",
    "слово",
    "разница",
    "пример",
  ];
  if (
    selfStudyOrTravel ||
    informationalTokens.some((token) => tokens.has(canonicalToken(token))) ||
    /^(как|что|почему|когда|где|сколько)\b/i.test(lower)
  ) {
    return { intent: "informational" };
  }

  for (const cluster of configuredCommercialQueries) {
    const target = new Set(
      normalizeRussianQuery(cluster).filter((token) => token !== "язык"),
    );
    const comparableTokens = new Set(
      [...tokens].filter((token) => token !== "язык"),
    );
    if (
      target.size === comparableTokens.size &&
      [...target].every((token) => comparableTokens.has(token))
    ) {
      return { intent: "primary_commercial", cluster };
    }
  }

  const hasChinese = tokens.has("китай");
  const primaryTokens = [
    "школа",
    "курс",
    "обучение",
    "репетитор",
    "преподаватель",
  ];
  const adjacentTokens = [
    ...primaryTokens,
    "урок",
    "занятие",
    "цена",
    "стоимость",
    "записаться",
  ];
  if (hasChinese && adjacentTokens.some((token) => tokens.has(token))) {
    return { intent: "adjacent_commercial" };
  }

  if (/hsk|хск/i.test(lower)) {
    return { intent: "informational" };
  }
  return { intent: "other" };
}

export function ensureCompatibleSearchRecords(
  records: readonly SearchPerformanceRecord[],
): void {
  if (records.length === 0) return;
  const first = records[0];
  for (const record of records.slice(1)) {
    if (
      record.provider !== first.provider ||
      record.searchEngine !== first.searchEngine ||
      record.view !== first.view ||
      record.period !== first.period
    ) {
      throw new Error(
        "Cannot aggregate search records with different providers, engines, views, or periods",
      );
    }
  }
}

type SearchTotals = {
  clicks: number;
  impressions: number;
  ctr: number | null;
  averagePosition: number | null;
};

function aggregateSearch(
  records: readonly SearchPerformanceRecord[],
): SearchTotals {
  ensureCompatibleSearchRecords(records);
  const clicks = records.reduce((sum, record) => sum + record.clicks, 0);
  const impressions = records.reduce(
    (sum, record) => sum + record.impressions,
    0,
  );
  const positioned = records.filter(
    (record) => record.averagePosition !== null && record.impressions > 0,
  );
  const positionWeight = positioned.reduce(
    (sum, record) => sum + record.impressions,
    0,
  );
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    averagePosition:
      positionWeight > 0
        ? positioned.reduce(
            (sum, record) =>
              sum + (record.averagePosition ?? 0) * record.impressions,
            0,
          ) / positionWeight
        : null,
  };
}

type MetricChange = {
  current: number;
  previous: number;
  absolute: number;
  percent: number | null;
  meaningful: boolean;
};

function change(
  current: number,
  previous: number,
  minimumAbsolute: number,
): MetricChange {
  const absolute = current - previous;
  const percent = previous === 0 ? null : absolute / previous;
  return {
    current,
    previous,
    absolute,
    percent,
    meaningful:
      Math.abs(absolute) >= minimumAbsolute &&
      (percent === null || Math.abs(percent) >= 0.15),
  };
}

function providerQueryRecords(
  collection: NormalizedCollection,
  provider: "yandex_webmaster" | "google_search_console",
  period: "current" | "previous",
): SearchPerformanceRecord[] {
  return collection.searchPerformance.filter(
    (record) =>
      record.provider === provider &&
      record.period === period &&
      (provider === "yandex_webmaster"
        ? record.view === "popular_query" && record.device === "all"
        : record.view === "query"),
  );
}

function providerDailyRecords(
  collection: NormalizedCollection,
  provider: "yandex_webmaster" | "google_search_console",
  period: "current" | "previous",
): SearchPerformanceRecord[] {
  return collection.searchPerformance.filter(
    (record) =>
      record.provider === provider &&
      record.period === period &&
      record.view === "daily" &&
      (provider !== "yandex_webmaster" || record.device === "all"),
  );
}

function visibilityBreakdown(
  records: readonly SearchPerformanceRecord[],
  clusters: readonly string[],
): Record<SearchIntent, SearchTotals & { queries: number }> {
  return Object.fromEntries(
    (
      [
        "primary_commercial",
        "adjacent_commercial",
        "competitor_or_brand",
        "offline_or_geo",
        "informational",
        "other",
      ] as const
    ).map((intent) => {
      const matching = records.filter(
        (record) =>
          record.query &&
          classifySearchIntent(record.query, clusters, record.page).intent ===
            intent,
      );
      return [
        intent,
        {
          ...aggregateSearch(matching),
          queries: matching.length,
        },
      ];
    }),
  ) as Record<SearchIntent, SearchTotals & { queries: number }>;
}

function commercialQueries(
  records: readonly SearchPerformanceRecord[],
  previous: readonly SearchPerformanceRecord[],
  clusters: readonly string[],
): Array<
  SearchPerformanceRecord & {
    classification: QueryClassification;
    clickChange: MetricChange;
    impressionChange: MetricChange;
    positionChange: number | null;
  }
> {
  const previousByQuery = new Map(
    previous
      .filter((record) => record.query)
      .map((record) => [
        `${record.query!.toLocaleLowerCase("ru-RU")}\u0000${record.page ?? ""}`,
        record,
      ]),
  );
  return records
    .filter(
      (record) =>
        record.query &&
        classifySearchIntent(record.query, clusters, record.page).intent ===
          "primary_commercial",
    )
    .map((record) => {
      const old = previousByQuery.get(
        `${record.query!.toLocaleLowerCase("ru-RU")}\u0000${record.page ?? ""}`,
      );
      return {
        ...record,
        classification: classifySearchIntent(
          record.query!,
          clusters,
          record.page,
        ),
        clickChange: change(record.clicks, old?.clicks ?? 0, 3),
        impressionChange: change(
          record.impressions,
          old?.impressions ?? 0,
          20,
        ),
        positionChange:
          record.averagePosition !== null && old?.averagePosition != null
            ? old.averagePosition - record.averagePosition
            : null,
      };
    })
    .sort((a, b) => b.impressions - a.impressions);
}

function opportunities(
  records: readonly SearchPerformanceRecord[],
): {
  closeToFirstPage: {
    totalCount: number;
    displayLimit: number;
    displayed: SearchPerformanceRecord[];
    all: SearchPerformanceRecord[];
  };
  weakCtr: {
    totalCount: number;
    displayLimit: number;
    displayed: SearchPerformanceRecord[];
    all: SearchPerformanceRecord[];
  };
} {
  const displayLimit = 50;
  const closeToFirstPage = records
    .filter(
      (record) =>
        record.averagePosition !== null &&
        record.averagePosition > 10 &&
        record.averagePosition <= 20 &&
        record.impressions > 0,
    )
    .sort((a, b) => b.impressions - a.impressions);
  const weakCtr = records
    .filter(
      (record) =>
        record.impressions >= 20 &&
        record.ctr !== null &&
        record.ctr < 0.02,
    )
    .sort((a, b) => b.impressions - a.impressions);
  return {
    closeToFirstPage: {
      totalCount: closeToFirstPage.length,
      displayLimit,
      displayed: closeToFirstPage.slice(0, displayLimit),
      all: closeToFirstPage,
    },
    weakCtr: {
      totalCount: weakCtr.length,
      displayLimit,
      displayed: weakCtr.slice(0, displayLimit),
      all: weakCtr,
    },
  };
}

function competingGooglePages(
  collection: NormalizedCollection,
): Array<{
  cluster: string;
  pages: Array<{ page: string; clicks: number; impressions: number }>;
}> {
  const rows = collection.searchPerformance.filter(
    (record) =>
      record.provider === "google_search_console" &&
      record.period === "current" &&
      record.view === "detail" &&
      record.query &&
      record.page,
  );
  const grouped = new Map<
    string,
    Map<string, { clicks: number; impressions: number }>
  >();
  for (const row of rows) {
    const classification = classifySearchIntent(
      row.query!,
      collection.configuredCommercialQueries,
      row.page,
    );
    if (classification.intent !== "primary_commercial") continue;
    const cluster = classification.cluster ?? "other commercial intent";
    const pages = grouped.get(cluster) ?? new Map();
    const totals = pages.get(row.page!) ?? { clicks: 0, impressions: 0 };
    totals.clicks += row.clicks;
    totals.impressions += row.impressions;
    pages.set(row.page!, totals);
    grouped.set(cluster, pages);
  }
  return [...grouped.entries()]
    .map(([cluster, pages]) => ({
      cluster,
      pages: [...pages.entries()]
        .map(([page, totals]) => ({ page, ...totals }))
        .filter((row) => row.impressions > 0)
        .sort((a, b) => b.impressions - a.impressions),
    }))
    .filter((group) => group.pages.length > 1);
}

function trafficTotal(
  collection: NormalizedCollection,
  provider: "yandex_metrika" | "google_analytics",
  period: "current" | "previous",
): TrafficRecord | undefined {
  return collection.traffic.find(
    (record) =>
      record.provider === provider &&
      record.period === period &&
      record.view === "total",
  );
}

function trafficEngineBreakdown(
  collection: NormalizedCollection,
  provider: "yandex_metrika" | "google_analytics",
  period: "current" | "previous",
) {
  const expectedAggregation =
    provider === "yandex_metrika" ? "search_engines" : "source";
  const rows = collection.traffic.filter(
    (record) =>
      record.provider === provider &&
      record.period === period &&
      record.view === "source" &&
      record.sourceMetadata.aggregation === expectedAggregation,
  );
  const metric = provider === "yandex_metrika" ? "visits" : "sessions";
  const value = (record: TrafficRecord): number =>
    provider === "yandex_metrika"
      ? (record.visits ?? 0)
      : (record.sessions ?? 0);
  const totalForEngine = (
    searchEngine: "yandex" | "google" | "other",
  ): number =>
    rows
      .filter((record) => record.searchEngine === searchEngine)
      .reduce((total, record) => total + value(record), 0);
  return {
    supported: rows.length > 0,
    metric,
    basis:
      provider === "yandex_metrika"
        ? "Yandex Metrica searchEngine dimension"
        : "GA4 sessionSource dimension within Organic Search",
    yandex: totalForEngine("yandex"),
    google: totalForEngine("google"),
    other: totalForEngine("other"),
    sourceRowCount: rows.length,
  };
}

function analyticsTrafficReport(
  collection: NormalizedCollection,
  provider: "yandex_metrika" | "google_analytics",
  available: boolean,
) {
  const current = trafficTotal(collection, provider, "current");
  const previous = trafficTotal(collection, provider, "previous");
  const currentMetric =
    provider === "yandex_metrika"
      ? (current?.visits ?? 0)
      : (current?.sessions ?? 0);
  const previousMetric =
    provider === "yandex_metrika"
      ? (previous?.visits ?? 0)
      : (previous?.sessions ?? 0);
  return {
    available,
    current,
    previous,
    primaryMetric:
      provider === "yandex_metrika" ? ("visits" as const) : ("sessions" as const),
    primaryMetricChange: change(currentMetric, previousMetric, 3),
    searchEngineBreakdown: {
      current: trafficEngineBreakdown(collection, provider, "current"),
      previous: trafficEngineBreakdown(collection, provider, "previous"),
    },
  };
}

const UNCONFIRMED_MIGRATION_DATE = "2026-06-01";

function rangeContainsDate(
  range: { startDate: string; endDate: string },
  date: string,
): boolean {
  return range.startDate <= date && date <= range.endDate;
}

function migrationContext(collection: NormalizedCollection) {
  const currentPeriodOverlaps = rangeContainsDate(
    collection.requestedRanges.current,
    UNCONFIRMED_MIGRATION_DATE,
  );
  const previousPeriodOverlaps = rangeContainsDate(
    collection.requestedRanges.previous,
    UNCONFIRMED_MIGRATION_DATE,
  );
  return {
    approximateDate: UNCONFIRMED_MIGRATION_DATE,
    confirmed: false,
    currentPeriodOverlaps,
    previousPeriodOverlaps,
    disclosureRequired: currentPeriodOverlaps || previousPeriodOverlaps,
  };
}

function currentGoals(
  collection: NormalizedCollection,
  provider: "yandex_metrika" | "google_analytics",
): GoalRecord[] {
  return collection.goals
    .filter(
      (goal) =>
        goal.provider === provider &&
        goal.period === "current" &&
        goal.searchEngine === "total_search",
    )
    .sort((a, b) => b.conversions - a.conversions);
}

type LeadSelection =
  | "primary_lead"
  | "lead_candidate"
  | "excluded_overlap"
  | "excluded_hsk_funnel"
  | "excluded_server_fallback"
  | "owner_confirmation_required";

const YANDEX_PRIMARY_LEAD_GOAL_ID = "562860580";
const YANDEX_HSK_FUNNEL_GOAL_ID = "562860814";
const YANDEX_SERVER_FALLBACK_GOAL_ID = "563512735";
const YANDEX_OVERLAPPING_AUTO_GOAL_IDS = new Set([
  "560790965",
  "560797964",
  "566641320",
  "566641321",
]);
const GA_LEAD_CANDIDATE = "generate_lead";

function classifyLeadGoal(goal: GoalRecord): {
  leadSelection: LeadSelection;
  reason: string;
} {
  if (
    goal.provider === "yandex_metrika" &&
    goal.goalId === YANDEX_PRIMARY_LEAD_GOAL_ID
  ) {
    return {
      leadSelection: "primary_lead",
      reason: "Owner-approved primary Yandex lead goal; counted without auto goals",
    };
  }
  if (
    goal.provider === "google_analytics" &&
    goal.goalName === GA_LEAD_CANDIDATE
  ) {
    return {
      leadSelection: "lead_candidate",
      reason:
        "Repository-confirmed persisted-lead event; GA4 key-event configuration still requires owner action",
    };
  }
  if (
    goal.provider === "yandex_metrika" &&
    goal.goalId &&
    YANDEX_OVERLAPPING_AUTO_GOAL_IDS.has(goal.goalId)
  ) {
    return {
      leadSelection: "excluded_overlap",
      reason: "Provider auto goal overlaps or is broader than the primary lead goal",
    };
  }
  if (
    goal.provider === "yandex_metrika" &&
    (goal.goalId === YANDEX_HSK_FUNNEL_GOAL_ID ||
      goal.goalName === "hsk_test_lead")
  ) {
    return {
      leadSelection: "excluded_hsk_funnel",
      reason: "Historical HSK funnel event is not a persisted-lead total",
    };
  }
  if (
    goal.provider === "yandex_metrika" &&
    goal.goalId === YANDEX_SERVER_FALLBACK_GOAL_ID
  ) {
    return {
      leadSelection: "excluded_server_fallback",
      reason: "Server fallback is a delivery diagnostic and is never added to lead totals",
    };
  }
  return {
    leadSelection: "owner_confirmation_required",
    reason: "Business meaning is not confirmed as a stored lead",
  };
}

function leadConfigurationReview(collection: NormalizedCollection) {
  return collection.goals
    .filter(
      (goal) =>
        goal.searchEngine === "total_search" ||
        (goal.provider === "google_analytics" &&
          goal.searchEngine === undefined),
    )
    .map((goal) => {
      const classification = classifyLeadGoal(goal);
      return {
        provider: goal.provider,
        goalId: goal.goalId,
        name: goal.goalName,
        type: goal.goalType,
        metric: goal.sourceMetadata.metric,
        configuredAsKeyEvent: goal.sourceMetadata.configuredAsKeyEvent,
        period: goal.period,
        dateRange: goal.dateRange,
        organicReaches: goal.conversions,
        ...classification,
      };
    })
    .sort(
      (a, b) =>
        a.provider.localeCompare(b.provider) ||
        (a.goalId ?? a.name).localeCompare(b.goalId ?? b.name) ||
        a.period.localeCompare(b.period),
    );
}

function brokenInternalLinksReport(records: readonly TechnicalRecord[]) {
  const samples = records.filter(
    (record) => record.type === "broken_internal_link",
  );
  const uniqueTargetCount = new Set(
    samples.map((record) => record.destinationUrl).filter(Boolean),
  ).size;
  const firstMetadata = samples[0]?.sourceMetadata ?? {};
  const reasonHistory = records
    .filter((record) => record.type === "broken_internal_link_history")
    .reduce<Map<string, TechnicalRecord>>((latest, record) => {
      if (!record.metric) return latest;
      const previous = latest.get(record.metric);
      if (!previous || (record.date ?? "") > (previous.date ?? "")) {
        latest.set(record.metric, record);
      }
      return latest;
    }, new Map());
  return {
    endpointReturnsOnlySamples: true,
    providerReportedSampleCount:
      typeof firstMetadata.sampleCount === "number"
        ? firstMetadata.sampleCount
        : samples.length,
    sampleRowCount: samples.length,
    uniqueTargetCount,
    sampleTruncated: firstMetadata.sampleTruncated === true,
    latestReasonCounts: [...reasonHistory.values()].map((record) => ({
      reason: record.metric,
      count: record.value,
      date: record.date,
    })),
    samples: samples.map((record) => ({
      targetUrl: record.destinationUrl,
      sourceUrl: record.sourceUrl,
      discoveryDate: record.date,
      sourceLastAccessDate: record.sourceMetadata.sourceLastAccessDate,
      reason: record.sourceMetadata.reason,
      status: record.sourceMetadata.status,
    })),
  };
}

function latestTechnical(
  records: readonly TechnicalRecord[],
  type: TechnicalRecord["type"],
  metric?: string,
): TechnicalRecord | undefined {
  return records
    .filter(
      (record) =>
        record.type === type && (metric === undefined || record.metric === metric),
    )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
}

function searchProviderReport(
  collection: NormalizedCollection,
  provider: "yandex_webmaster" | "google_search_console",
) {
  const source = collection.sourceMetadata.find(
    (metadata) => metadata.provider === provider,
  );
  const currentDaily = providerDailyRecords(collection, provider, "current");
  const previousDaily = providerDailyRecords(collection, provider, "previous");
  const currentQueries = providerQueryRecords(collection, provider, "current");
  const previousQueries = providerQueryRecords(collection, provider, "previous");
  const currentTotals = aggregateSearch(currentDaily);
  const previousTotals = aggregateSearch(previousDaily);
  const currentQueryTotals = aggregateSearch(currentQueries);
  const effectiveCurrent = source?.actualRanges?.current;
  const effectivePrevious = source?.actualRanges?.previous;
  const previousEndsBeforeCurrent =
    effectiveCurrent && effectivePrevious
      ? new Date(`${effectivePrevious.endDate}T00:00:00.000Z`).getTime() +
          86_400_000 ===
        new Date(`${effectiveCurrent.startDate}T00:00:00.000Z`).getTime()
      : false;
  const comparisonComplete =
    source?.status === "success" &&
    effectiveCurrent !== undefined &&
    effectivePrevious !== undefined &&
    countInclusiveDays(
      effectiveCurrent.startDate,
      effectiveCurrent.endDate,
    ) ===
      countInclusiveDays(
        effectivePrevious.startDate,
        effectivePrevious.endDate,
      ) &&
    previousEndsBeforeCurrent;
  return {
    available: source?.status === "success",
    comparisonComplete,
    requestedRanges: collection.requestedRanges,
    effectiveRanges: source?.actualRanges,
    dateAdjustmentReason: source?.warnings.find((warning) =>
      warning.includes("comparison ranges were adjusted"),
    ),
    totals: {
      current: currentTotals,
      previous: previousTotals,
      changes: {
        clicks: change(currentTotals.clicks, previousTotals.clicks, 3),
        impressions: change(
          currentTotals.impressions,
          previousTotals.impressions,
          20,
        ),
        ctr:
          currentTotals.ctr !== null && previousTotals.ctr !== null
            ? currentTotals.ctr - previousTotals.ctr
            : null,
        averagePosition:
          currentTotals.averagePosition !== null &&
          previousTotals.averagePosition !== null
            ? previousTotals.averagePosition - currentTotals.averagePosition
            : null,
      },
    },
    visibility: visibilityBreakdown(
      currentQueries,
      collection.configuredCommercialQueries,
    ),
    queryCoverage: {
      providerTotals: currentTotals,
      exposedQueryTotals: currentQueryTotals,
      impressionCoverage:
        currentTotals.impressions > 0
          ? currentQueryTotals.impressions / currentTotals.impressions
          : null,
      clickCoverage:
        currentTotals.clicks > 0
          ? currentQueryTotals.clicks / currentTotals.clicks
          : null,
      exposedQueryCount: currentQueries.length,
      classificationsApplyOnlyToExposedQueries: true,
    },
    commercialQueries: commercialQueries(
      currentQueries,
      previousQueries,
      collection.configuredCommercialQueries,
    ),
    opportunities: opportunities(currentQueries),
  };
}

function buildReport(collection: NormalizedCollection) {
  const yandexSearch = searchProviderReport(collection, "yandex_webmaster");
  const googleSearch = searchProviderReport(
    collection,
    "google_search_console",
  );
  const technical = collection.technical.filter(
    (record) => record.provider === "yandex_webmaster",
  );
  const brokenInternalLinks = brokenInternalLinksReport(technical);
  const metrikaAvailable =
    collection.sourceMetadata.find(
      (metadata) => metadata.provider === "yandex_metrika",
    )?.status === "success";
  const gaAvailable =
    collection.sourceMetadata.find(
      (metadata) => metadata.provider === "google_analytics",
    )?.status === "success";
  const metrikaGoals = currentGoals(collection, "yandex_metrika");
  const gaEvents = currentGoals(collection, "google_analytics");
  const gaKeyEvents = gaEvents.filter(
    (goal) => goal.sourceMetadata.configuredAsKeyEvent === true,
  );
  const primaryYandexLeadGoal = metrikaGoals.find(
    (goal) => goal.goalId === YANDEX_PRIMARY_LEAD_GOAL_ID,
  );
  const gaLeadCandidate = gaEvents.find(
    (goal) => goal.goalName === GA_LEAD_CANDIDATE,
  );

  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    collectionRunId: collection.runId,
    ranges: collection.requestedRanges,
    migrationContext: migrationContext(collection),
    sourceStatus: collection.sourceMetadata,
    searchVisibility: {
      yandexWebmaster: {
        ...yandexSearch,
        technical: {
          currentSqi: latestTechnical(technical, "sqi"),
          pagesInSearch: latestTechnical(
            technical,
            "pages_in_search",
            "pages_in_search",
          ),
          activeDiagnostics: technical.filter(
            (record) =>
              record.type === "diagnostic" && record.state === "PRESENT",
          ),
          brokenInternalLinks,
          externalLinkSamples: technical.filter(
            (record) => record.type === "external_link",
          ),
        },
      },
      googleSearchConsole: {
        ...googleSearch,
        competingCommercialPages: competingGooglePages(collection),
      },
    },
    organicTraffic: {
      yandexMetrika: analyticsTrafficReport(
        collection,
        "yandex_metrika",
        metrikaAvailable,
      ),
      googleAnalytics: analyticsTrafficReport(
        collection,
        "google_analytics",
        gaAvailable,
      ),
    },
    conversions: {
      yandexMetrika: {
        available: metrikaAvailable,
        goals: metrikaGoals,
        primaryLeadGoal: primaryYandexLeadGoal,
        excludedFromLeadTotals: metrikaGoals.filter((goal) =>
          classifyLeadGoal(goal).leadSelection.startsWith("excluded_"),
        ),
      },
      googleAnalytics: {
        available: gaAvailable,
        keyEvents: gaKeyEvents,
        leadCandidate: gaLeadCandidate,
      },
      leadSelection: "owner_approved_code_classification" as const,
    },
    leadConfigurationReview: leadConfigurationReview(collection),
    providerDifferences: [
      "Yandex Webmaster impressions, clicks, and positions use Yandex Search methodology; Google Search Console uses Google methodology.",
      "Yandex Metrica visits are not GA4 sessions.",
      "Yandex Metrica users are not GA4 active users.",
      "Визиты или сессии не сравниваются напрямую с кликами Вебмастера или Search Console.",
      "Метрика содержит органический трафик из разных поисковых систем; GA4 Organic Search также содержит разные поисковые источники.",
      "Provider user metrics are period-level uniques and are not summed across days, devices, engines, or landing pages.",
      "Only metrics from the same provider, aggregation view, and period are compared.",
    ],
    ownerDecisions: [
      "Provider-side action: decide whether to mark generate_lead as a GA4 key event.",
      "Provider-side action: enable Yandex Measurement Protocol and configure NEXT_PUBLIC_YM_ID plus its secret token before the server fallback can deliver.",
      "Review csv/lead-configuration-review.csv for explicitly selected, excluded, and still-unresolved goals.",
      "Each still-unresolved goal requires owner confirmation of its business meaning.",
      "Scheduling is deliberately deferred until the local collector and credential access are accepted.",
    ],
    limitations: collection.sourceMetadata.flatMap((source) =>
      source.limitations.map((limitation) => `${source.provider}: ${limitation}`),
    ),
  };
}

function csvCell(value: unknown): string {
  const text =
    value === undefined || value === null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: readonly Record<string, unknown>[]): string {
  if (rows.length === 0) return "\n";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
    "",
  ].join("\n");
}

function flattenSearch(record: SearchPerformanceRecord): Record<string, unknown> {
  return {
    provider: record.provider,
    search_engine: record.searchEngine,
    view: record.view,
    period: record.period,
    date: record.date,
    date_from: record.dateRange.startDate,
    date_to: record.dateRange.endDate,
    query: record.query,
    page: record.page,
    device: record.device,
    country: record.country,
    clicks: record.clicks,
    impressions: record.impressions,
    ctr: record.ctr,
    average_position: record.averagePosition,
    source_metadata: record.sourceMetadata,
  };
}

function flattenTraffic(record: TrafficRecord): Record<string, unknown> {
  return {
    provider: record.provider,
    search_engine: record.searchEngine,
    view: record.view,
    period: record.period,
    date: record.date,
    date_from: record.dateRange.startDate,
    date_to: record.dateRange.endDate,
    landing_page: record.landingPage,
    source: record.source,
    source_medium: record.sourceMedium,
    device: record.device,
    visits: record.visits,
    users: record.users,
    sessions: record.sessions,
    active_users: record.activeUsers,
    new_users: record.newUsers,
    engaged_sessions: record.engagedSessions,
    engagement_rate: record.engagementRate,
    average_engagement_seconds_per_active_user:
      record.averageEngagementSecondsPerActiveUser,
    bounce_rate: record.bounceRate,
    page_depth: record.pageDepth,
    average_visit_duration_seconds: record.averageVisitDurationSeconds,
    conversions: record.conversions,
    source_metadata: record.sourceMetadata,
  };
}

function percent(value: number | null | undefined): string {
  return value == null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function number(value: number | null | undefined, digits = 0): string {
  return value == null ? "—" : value.toFixed(digits);
}

function countWithRussianNoun(
  value: number,
  forms: readonly [string, string, string],
): string {
  const absolute = Math.abs(Math.trunc(value));
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  const form =
    lastTwo >= 11 && lastTwo <= 14
      ? forms[2]
      : last === 1
        ? forms[0]
        : last >= 2 && last <= 4
          ? forms[1]
          : forms[2];
  return `${number(value)} ${form}`;
}

function signedPercent(value: number | null): string {
  if (value === null) return "нет базы сравнения";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function statusLine(
  metadata: NormalizedCollection["sourceMetadata"][number],
): string {
  const label =
    metadata.status === "success"
      ? "готово"
      : metadata.status === "skipped"
        ? "не настроено"
        : "ошибка";
  const notes = [metadata.error, ...metadata.warnings]
    .filter(Boolean)
    .join(" ");
  return `| ${metadata.provider} | ${label} | ${metadata.recordCount} | ${notes} |`;
}

function queryLines(
  queries: ReturnType<typeof commercialQueries>,
  maximum = 8,
): string[] {
  if (queries.length === 0) return ["Данных по коммерческому кластеру нет."];
  return queries.slice(0, maximum).map(
    (record) =>
      `- ${record.query}: ${number(record.impressions)} показов, ` +
      `${number(record.clicks)} кликов, CTR ${percent(record.ctr)}, ` +
      `позиция ${number(record.averagePosition, 1)}`,
  );
}

const INTENT_LABELS: Record<SearchIntent, string> = {
  primary_commercial: "основные коммерческие",
  adjacent_commercial: "смежные коммерческие",
  competitor_or_brand: "конкуренты/бренды",
  offline_or_geo: "офлайн/география",
  informational: "информационные",
  other: "прочие",
};

function visibilityLine(
  visibility: ReturnType<typeof visibilityBreakdown>,
): string {
  return (Object.keys(INTENT_LABELS) as SearchIntent[])
    .map(
      (intent) =>
        `${INTENT_LABELS[intent]}: ${number(visibility[intent].impressions)}`,
    )
    .join("; ");
}

function coverageLine(
  coverage: ReturnType<typeof searchProviderReport>["queryCoverage"],
): string {
  return (
    `Доступные строки запросов представляют ${number(coverage.exposedQueryTotals.impressions)} ` +
    `из ${number(coverage.providerTotals.impressions)} показов (${percent(coverage.impressionCoverage)}) ` +
    `и ${number(coverage.exposedQueryTotals.clicks)} из ${number(coverage.providerTotals.clicks)} кликов ` +
    `(${percent(coverage.clickCoverage)}). Классификация применяется только к открытым поставщиком строкам запросов.`
  );
}

function effectiveRangeLine(
  search: ReturnType<typeof searchProviderReport>,
): string {
  const current = search.effectiveRanges?.current;
  const previous = search.effectiveRanges?.previous;
  if (!current || !previous) {
    return "Эффективные даты сравнения не определены.";
  }
  return (
    `Эффективные периоды: ${current.startDate} — ${current.endDate} и ` +
    `${previous.startDate} — ${previous.endDate}.` +
    (search.dateAdjustmentReason
      ? " Даты скорректированы по последнему полностью доступному дню; причина указана в статусе источника."
      : "")
  );
}

function opportunityLine(
  label: string,
  group: ReturnType<typeof opportunities>["closeToFirstPage"],
): string {
  return group.totalCount > group.displayed.length
    ? `${label}: показано ${group.displayed.length} из ${group.totalCount}.`
    : `${label}: ${group.totalCount}.`;
}

function brokenLinkLines(
  broken: ReturnType<typeof brokenInternalLinksReport>,
  maximum = 5,
): string[] {
  if (broken.sampleRowCount === 0) {
    return [
      "Вебмастер не вернул примеров битых внутренних ссылок. Метод API предоставляет только выборку примеров.",
    ];
  }
  const reasonSummary =
    broken.latestReasonCounts.length > 0
      ? ` Последние доступные причины: ${broken.latestReasonCounts
          .map((item) => `${item.reason} — ${item.count}`)
          .join(", ")}.`
      : " Причина или HTTP-статус для отдельных строк API не раскрыты.";
  return [
    `Строк с примерами от Вебмастера: ${broken.sampleRowCount}; уникальных целевых URL: ${broken.uniqueTargetCount}. ` +
      `Метод API возвращает только примеры${broken.sampleTruncated ? ", и выборка усечена" : ""}; это не полный список всех битых ссылок.${reasonSummary}`,
    ...broken.samples.slice(0, maximum).map(
      (sample) =>
        `- ${sample.targetUrl ?? "цель не раскрыта"} ← ${sample.sourceUrl ?? "источник не раскрыт"}` +
        (sample.reason ? `; причина: ${String(sample.reason)}` : "") +
        (sample.status ? `; статус: ${String(sample.status)}` : ""),
    ),
  ];
}

export function markdownSummary(
  collection: NormalizedCollection,
  report: ReturnType<typeof buildReport>,
): string {
  const yandexSearch = report.searchVisibility.yandexWebmaster;
  const googleSearch = report.searchVisibility.googleSearchConsole;
  const metrika = report.organicTraffic.yandexMetrika;
  const ga4 = report.organicTraffic.googleAnalytics;
  const metrikaTraffic = metrika.current;
  const ga4Traffic = ga4.current;
  const activeDiagnostics = yandexSearch.technical.activeDiagnostics;
  const sources = [...collection.sourceMetadata].sort(
    (a, b) =>
      [
        "yandex_webmaster",
        "yandex_metrika",
        "google_search_console",
        "google_analytics",
      ].indexOf(a.provider) -
      [
        "yandex_webmaster",
        "yandex_metrika",
        "google_search_console",
        "google_analytics",
      ].indexOf(b.provider),
  );
  const migrationPeriodLabel =
    report.migrationContext.currentPeriodOverlaps &&
    report.migrationContext.previousPeriodOverlaps
      ? "Текущий и предыдущий периоды пересекают"
      : report.migrationContext.currentPeriodOverlaps
        ? "Текущий период пересекает"
        : "Предыдущий период пересекает";
  const migrationDisclosure = report.migrationContext.disclosureRequired
    ? `Контекст периода: приблизительная дата запуска/миграции — ${report.migrationContext.approximateDate}; она не подтверждена. ` +
      `${migrationPeriodLabel} эту дату. ` +
      "Показанный рост включает эффект запуска/миграции и не должен интерпретироваться как чистый SEO-рост."
    : undefined;
  const trafficBreakdownLine = (
    providerLabel: string,
    unit: "визитов" | "сессий",
    breakdown:
      | typeof metrika.searchEngineBreakdown.current
      | typeof ga4.searchEngineBreakdown.current,
  ): string =>
    breakdown.supported
      ? `${providerLabel}, доступная разбивка по поисковой системе/источнику: ` +
        `Яндекс — ${countWithRussianNoun(
          breakdown.yandex,
          unit === "визитов"
            ? ["визит", "визита", "визитов"]
            : ["сессия", "сессии", "сессий"],
        )}; ` +
        `Google — ${countWithRussianNoun(
          breakdown.google,
          unit === "визитов"
            ? ["визит", "визита", "визитов"]
            : ["сессия", "сессии", "сессий"],
        )}; ` +
        `другие или нераспознанные — ${countWithRussianNoun(
          breakdown.other,
          unit === "визитов"
            ? ["визит", "визита", "визитов"]
            : ["сессия", "сессии", "сессий"],
        )}.`
      : `${providerLabel} не вернул поддерживаемую разбивку по поисковой системе/источнику в этом запуске.`;

  return [
    "# SEO-отчёт ChinaChild",
    "",
    `Запрошенный текущий период: ${collection.requestedRanges.current.startDate} — ${collection.requestedRanges.current.endDate}.`,
    `Запрошенный предыдущий равный период: ${collection.requestedRanges.previous.startDate} — ${collection.requestedRanges.previous.endDate}.`,
    ...(migrationDisclosure ? ["", migrationDisclosure] : []),
    "",
    "## Статус источников",
    "",
    "| Источник | Статус | Строк | Ошибка/примечание |",
    "| --- | --- | ---: | --- |",
    ...sources.map(statusLine),
    "",
    "## 1. Поисковая видимость",
    "",
    "### Яндекс Вебмастер",
    "",
    yandexSearch.available
      ? `${number(yandexSearch.totals.current.impressions)} показов и ` +
        `${number(yandexSearch.totals.current.clicks)} кликов; ` +
        (yandexSearch.comparisonComplete
          ? `изменение к прошлому периоду — ` +
            `${signedPercent(yandexSearch.totals.changes.impressions.percent)} по показам и ` +
            `${signedPercent(yandexSearch.totals.changes.clicks.percent)} по кликам.`
          : "сравнение с прошлым периодом не показано, потому что источник вернул не весь запрошенный диапазон.")
      : "Данные Яндекс Вебмастера недоступны в этом запуске; причина указана в статусе источников.",
    ...(yandexSearch.available ? [effectiveRangeLine(yandexSearch)] : []),
    yandexSearch.available
      ? `Классификация доступных запросов по показам — ${visibilityLine(yandexSearch.visibility)}.`
      : "Видимость коммерческих и информационных запросов Яндекса не рассчитывалась.",
    ...(yandexSearch.available
      ? [coverageLine(yandexSearch.queryCoverage)]
      : []),
    "",
    "Основной коммерческий кластер (топ по показам):",
    "",
    ...(yandexSearch.available
      ? queryLines(yandexSearch.commercialQueries)
      : ["Коммерческий кластер Яндекса недоступен без данных Вебмастера."]),
    "",
    yandexSearch.available
      ? `${opportunityLine(
          "Запросы рядом с первой страницей (позиции 11–20)",
          yandexSearch.opportunities.closeToFirstPage,
        )} ${opportunityLine(
          "Запросы с 20+ показами и CTR ниже 2%",
          yandexSearch.opportunities.weakCtr,
        )}`
      : "Возможности по позициям и CTR Яндекса не рассчитывались.",
    yandexSearch.available
      ? `Активных диагностик Вебмастера: ${activeDiagnostics.length}.`
      : "Диагностика и ссылки Вебмастера недоступны.",
    ...(yandexSearch.available
      ? brokenLinkLines(yandexSearch.technical.brokenInternalLinks)
      : []),
    "",
    "### Google Search Console",
    "",
    googleSearch.available
      ? `${number(googleSearch.totals.current.impressions)} показов и ` +
        `${number(googleSearch.totals.current.clicks)} кликов; ` +
        (googleSearch.comparisonComplete
          ? `изменение к прошлому периоду — ` +
            `${signedPercent(googleSearch.totals.changes.impressions.percent)} по показам и ` +
            `${signedPercent(googleSearch.totals.changes.clicks.percent)} по кликам.`
          : "сравнение с прошлым периодом не показано, потому что источник вернул не весь запрошенный диапазон.")
      : "Данные Search Console недоступны в этом запуске; причина указана в статусе источников.",
    ...(googleSearch.available ? [effectiveRangeLine(googleSearch)] : []),
    googleSearch.available
      ? `Классификация доступных запросов по показам — ${visibilityLine(googleSearch.visibility)}.`
      : "Видимость коммерческих и информационных запросов Google не рассчитывалась.",
    ...(googleSearch.available
      ? [coverageLine(googleSearch.queryCoverage)]
      : []),
    "",
    "Основной коммерческий кластер (топ по показам):",
    "",
    ...(googleSearch.available
      ? queryLines(googleSearch.commercialQueries)
      : ["Коммерческий кластер Google недоступен без данных Search Console."]),
    "",
    googleSearch.available
      ? `${opportunityLine(
          "Запросы рядом с первой страницей (позиции 11–20)",
          googleSearch.opportunities.closeToFirstPage,
        )} ${opportunityLine(
          "Запросы с 20+ показами и CTR ниже 2%",
          googleSearch.opportunities.weakCtr,
        )}`
      : "Возможности по позициям и CTR Google не рассчитывались.",
    googleSearch.available
      ? `Групп коммерческого интента, где Google показывает больше одной посадочной: ${googleSearch.competingCommercialPages.length}. ` +
        "Это сигнал для проверки, а не автоматический вывод о каннибализации."
      : "Конкурирующие посадочные Google не анализировались.",
    "",
    "## 2. Органический трафик",
    "",
    "Итоги показаны отдельно по каждой аналитической системе и не складываются между собой.",
    "",
    "### Яндекс Метрика",
    "",
    metrikaTraffic
      ? `Всего органического трафика по Метрике: ${countWithRussianNoun(metrikaTraffic.visits ?? 0, ["визит", "визита", "визитов"])}, ` +
        `${countWithRussianNoun(metrikaTraffic.users ?? 0, ["пользователь", "пользователя", "пользователей"])}, отказы ${percent(metrikaTraffic.bounceRate)}, ` +
        `глубина ${number(metrikaTraffic.pageDepth, 2)}.`
      : "Данные Метрики за период недоступны.",
    ...(metrikaTraffic
      ? [
          trafficBreakdownLine(
            "Метрика",
            "визитов",
            metrika.searchEngineBreakdown.current,
          ),
        ]
      : []),
    "",
    "### Google Analytics 4",
    "",
    ga4Traffic
      ? `Всего Organic Search по GA4: ${countWithRussianNoun(ga4Traffic.sessions ?? 0, ["сессия", "сессии", "сессий"])}, ` +
        `${countWithRussianNoun(ga4Traffic.activeUsers ?? 0, ["активный пользователь", "активных пользователя", "активных пользователей"])}, ` +
        `${countWithRussianNoun(ga4Traffic.engagedSessions ?? 0, ["вовлечённая сессия", "вовлечённые сессии", "вовлечённых сессий"])}, ` +
        `engagement rate ${percent(ga4Traffic.engagementRate)}.`
      : "Данные GA4 за период недоступны.",
    ...(ga4Traffic
      ? [
          trafficBreakdownLine(
            "GA4 Organic Search",
            "сессий",
            ga4.searchEngineBreakdown.current,
          ),
        ]
      : []),
    "",
    "## 3. Конверсии",
    "",
    "### Цели Яндекс Метрики",
    "",
    report.conversions.yandexMetrika.available
      ? `Доступно целей: ${report.conversions.yandexMetrika.goals.length}; ` +
        `с достижениями из органического поиска: ${report.conversions.yandexMetrika.goals.filter((goal) => goal.conversions > 0).length}.`
      : "Цели Метрики недоступны в этом запуске.",
    report.conversions.yandexMetrika.primaryLeadGoal
      ? `Основная лид-цель: 562860580 lead_submitted — ${number(report.conversions.yandexMetrika.primaryLeadGoal.conversions)} достижений из органического поиска.`
      : "Основная лид-цель 562860580 lead_submitted не найдена в данных этого запуска.",
    "Автоцели, hsk_test_lead и серверный fallback исключены из лид-итога и не складываются с основной целью.",
    "",
    "### Ключевые события GA4",
    "",
    report.conversions.googleAnalytics.available
      ? `Доступно настроенных key events: ${report.conversions.googleAnalytics.keyEvents.length}; ` +
        `с событиями из Organic Search: ${report.conversions.googleAnalytics.keyEvents.filter((goal) => goal.conversions > 0).length}.`
      : "Ключевые события GA4 недоступны в этом запуске.",
    report.conversions.googleAnalytics.leadCandidate
      ? `Кандидат в лид-событие: generate_lead — ${number(report.conversions.googleAnalytics.leadCandidate.conversions)} событий из Organic Search; configured key event: ${report.conversions.googleAnalytics.leadCandidate.sourceMetadata.configuredAsKeyEvent === true ? "да" : "нет"}.`
      : "Кандидат generate_lead не найден в данных этого запуска.",
    "Назначение generate_lead ключевым событием GA4 остаётся отдельным действием владельца в интерфейсе провайдера.",
    "Полная классификация без суммирования пересекающихся целей находится в csv/lead-configuration-review.csv.",
    "",
    "## Как читать цифры",
    "",
    ...report.providerDifferences.map((item) => `- ${item}`),
    "",
    "## Решения владельца",
    "",
    ...report.ownerDecisions.map((item) => `- ${item}`),
    "",
    "## Ограничения данных",
    "",
    ...(report.limitations.length > 0
      ? report.limitations.map((item) => `- ${item}`)
      : ["- Ограничения источников не записаны."]),
    "",
  ].join("\n");
}

export { buildReport };

export async function generateSeoReport(
  outputDirectory: string,
  requestedRunId?: string,
): Promise<{
  reportDirectory: string;
  summaryPath: string;
}> {
  const collection = await loadCollection(outputDirectory, requestedRunId);
  const report = buildReport(collection);
  const commercialRows = [
    ...report.searchVisibility.yandexWebmaster.commercialQueries,
    ...report.searchVisibility.googleSearchConsole.commercialQueries,
  ].map((record) => ({
    provider: record.provider,
    query: record.query,
    query_target_artifact: record.page,
    intent: record.classification.intent,
    cluster: record.classification.cluster,
    period: record.period,
    clicks: record.clicks,
    impressions: record.impressions,
    ctr: record.ctr,
    average_position: record.averagePosition,
    click_change: record.clickChange,
    impression_change: record.impressionChange,
    position_improvement: record.positionChange,
  }));
  const opportunityRows = [
    ...report.searchVisibility.yandexWebmaster.opportunities.closeToFirstPage.all.map(
      (record) => ({
        opportunity_type: "close_to_first_page",
        ...flattenSearch(record),
      }),
    ),
    ...report.searchVisibility.yandexWebmaster.opportunities.weakCtr.all.map(
      (record) => ({
        opportunity_type: "weak_ctr",
        ...flattenSearch(record),
      }),
    ),
    ...report.searchVisibility.googleSearchConsole.opportunities.closeToFirstPage.all.map(
      (record) => ({
        opportunity_type: "close_to_first_page",
        ...flattenSearch(record),
      }),
    ),
    ...report.searchVisibility.googleSearchConsole.opportunities.weakCtr.all.map(
      (record) => ({
        opportunity_type: "weak_ctr",
        ...flattenSearch(record),
      }),
    ),
  ];
  const brokenLinks =
    report.searchVisibility.yandexWebmaster.technical.brokenInternalLinks;
  const brokenLinkRows = brokenLinks.samples.map((sample) => ({
      broken_target_url: sample.targetUrl,
      source_referring_page: sample.sourceUrl,
      discovery_date: sample.discoveryDate,
      source_last_access_date: sample.sourceLastAccessDate,
      reason: sample.reason,
      status: sample.status,
      endpoint_returns_samples_only: true,
      sample_truncated: brokenLinks.sampleTruncated,
      sample_row_count: brokenLinks.sampleRowCount,
      unique_target_count: brokenLinks.uniqueTargetCount,
      provider_reported_sample_count: brokenLinks.providerReportedSampleCount,
    }));
  const leadReviewRows = report.leadConfigurationReview.map((item) => ({
    provider: item.provider,
    goal_id: item.goalId,
    goal_or_event_name: item.name,
    type: item.type,
    metric: item.metric,
    configured_as_key_event: item.configuredAsKeyEvent,
    period: item.period,
    date_from: item.dateRange.startDate,
    date_to: item.dateRange.endDate,
    organic_reaches: item.organicReaches,
    lead_selection: item.leadSelection,
    selection_reason: item.reason,
  }));
  const files: Record<string, string> = {
    "seo-report.json": `${JSON.stringify(report, null, 2)}\n`,
    "summary.md": markdownSummary(collection, report),
    "csv/yandex-search-performance.csv": toCsv(
      collection.searchPerformance
        .filter((record) => record.provider === "yandex_webmaster")
        .map(flattenSearch),
    ),
    "csv/yandex-organic-traffic.csv": toCsv(
      collection.traffic
        .filter((record) => record.provider === "yandex_metrika")
        .map(flattenTraffic),
    ),
    "csv/google-search-performance.csv": toCsv(
      collection.searchPerformance
        .filter((record) => record.provider === "google_search_console")
        .map(flattenSearch),
    ),
    "csv/google-organic-traffic.csv": toCsv(
      collection.traffic
        .filter((record) => record.provider === "google_analytics")
        .map(flattenTraffic),
    ),
    "csv/goals-and-key-events.csv": toCsv(
      collection.goals.map((goal) => ({
        provider: goal.provider,
        period: goal.period,
        date_from: goal.dateRange.startDate,
        date_to: goal.dateRange.endDate,
        goal_id: goal.goalId,
        goal_name: goal.goalName,
        goal_type: goal.goalType,
        search_engine: goal.searchEngine,
        conversions: goal.conversions,
        source_metadata: goal.sourceMetadata,
      })),
    ),
    "csv/commercial-queries.csv": toCsv(commercialRows),
    "csv/search-opportunities.csv": toCsv(opportunityRows),
    "csv/broken-internal-links.csv": toCsv(brokenLinkRows),
    "csv/lead-configuration-review.csv": toCsv(leadReviewRows),
    "csv/yandex-technical-health.csv": toCsv(
      collection.technical.map((record) => ({
        provider: record.provider,
        type: record.type,
        date: record.date,
        metric: record.metric,
        value: record.value,
        source_url: record.sourceUrl,
        destination_url: record.destinationUrl,
        severity: record.severity,
        state: record.state,
        source_metadata: record.sourceMetadata,
      })),
    ),
  };
  const reportDirectory = await writeReportFiles(
    outputDirectory,
    collection.runId,
    files,
  );
  return {
    reportDirectory,
    summaryPath: path.join(reportDirectory, "summary.md"),
  };
}
