import { YandexWebmasterClient } from "../clients/yandex.mts";
import type { SeoConfig } from "../config.mts";
import {
  dateOnly,
  deriveEffectiveComparisonRange,
} from "../date-range.mts";
import type {
  ComparisonRange,
  PeriodLabel,
  SearchPerformanceRecord,
  SourceResult,
  TechnicalRecord,
} from "../types.mts";
import {
  asArray,
  asNumber,
  asOptionalArray,
  asOptionalNumber,
  asOptionalString,
  asRecord,
  asString,
} from "../validation.mts";

const QUERY_INDICATORS = [
  "TOTAL_SHOWS",
  "TOTAL_CLICKS",
  "AVG_SHOW_POSITION",
  "AVG_CLICK_POSITION",
] as const;
const DEVICES = ["ALL", "DESKTOP", "MOBILE"] as const;
const POPULAR_SORTS = ["TOTAL_SHOWS", "TOTAL_CLICKS"] as const;

type DeviceIndicator = (typeof DEVICES)[number];
type PopularSort = (typeof POPULAR_SORTS)[number];

type HistoryResponse = {
  period: PeriodLabel;
  device: DeviceIndicator;
  raw: Record<string, unknown>;
};

type PopularResponse = {
  period: PeriodLabel;
  device: DeviceIndicator;
  sort: PopularSort;
  raw: Record<string, unknown>;
};

function deviceName(device: DeviceIndicator): string {
  return device === "ALL" ? "all" : device.toLowerCase();
}

export function splitYandexQueryText(value: string): {
  query: string;
  page?: string;
  targetHost?: string;
} {
  const match = value.match(
    /^(.*?)@((?:[a-z0-9-]+\.)+[a-z]{2,})(\/[^\s]*)?$/i,
  );
  const query = match?.[1]?.trim();
  if (!match || !query) return { query: value.trim() };
  const targetHost = match[2].toLowerCase();
  return {
    query,
    page: `https://${targetHost}${match[3] ?? ""}`,
    targetHost,
  };
}

async function paginatedLinks(
  client: YandexWebmasterClient,
  userId: number,
  hostId: string,
  suffix: string,
): Promise<{
  count: number;
  links: unknown[];
  pages: Record<string, unknown>[];
  truncated: boolean;
}> {
  const links: unknown[] = [];
  const pages: Record<string, unknown>[] = [];
  const limit = 100;
  const maximumRows = 1000;
  let count = 0;

  for (let offset = 0; offset < maximumRows; offset += limit) {
    const response = await client.hostGet(userId, hostId, suffix, {
      offset,
      limit,
    });
    pages.push(response);
    const rows = asOptionalArray(response.links, `${suffix}.links`);
    count =
      response.count === undefined
        ? rows.length
        : asNumber(response.count, `${suffix}.count`);
    links.push(...rows);
    if (rows.length < limit || links.length >= count) break;
  }
  return { count, links, pages, truncated: links.length < count };
}

function indicatorPoints(
  raw: Record<string, unknown>,
  context: string,
): Record<string, Array<{ date: string; value: number }>> {
  const indicators = asRecord(raw.indicators, `${context}.indicators`);
  return Object.fromEntries(
    Object.entries(indicators).map(([name, value]) => [
      name,
      asArray(value, `${context}.indicators.${name}`).map((point, index) => {
        const row = asRecord(
          point,
          `${context}.indicators.${name}[${index}]`,
        );
        return {
          date: dateOnly(
            asString(
              row.date,
              `${context}.indicators.${name}[${index}].date`,
            ),
          ),
          value: asNumber(
            row.value,
            `${context}.indicators.${name}[${index}].value`,
          ),
        };
      }),
    ]),
  );
}

function normalizeHistory(
  history: HistoryResponse,
  ranges: ComparisonRange,
): SearchPerformanceRecord[] {
  const points = indicatorPoints(
    history.raw,
    `Webmaster history.${history.period}.${history.device}`,
  );
  const dates = new Set(
    Object.values(points).flatMap((series) => series.map((point) => point.date)),
  );
  const value = (name: string, date: string): number | undefined =>
    points[name]?.find((point) => point.date === date)?.value;
  const range = ranges[history.period];
  return [...dates].sort().map((date) => {
    const clicks = value("TOTAL_CLICKS", date) ?? 0;
    const impressions = value("TOTAL_SHOWS", date) ?? 0;
    return {
      provider: "yandex_webmaster",
      searchEngine: "yandex",
      view: "daily",
      period: history.period,
      date,
      dateRange: {
        startDate: range.startDate,
        endDate: range.endDate,
      },
      device: deviceName(history.device),
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : null,
      averagePosition: value("AVG_SHOW_POSITION", date) ?? null,
      sourceMetadata: {
        aggregation: "all_search_queries_history",
        topRowsOnly: false,
        averageClickPosition: value("AVG_CLICK_POSITION", date) ?? null,
      },
    };
  });
}

function normalizePopular(
  responses: readonly PopularResponse[],
  ranges: ComparisonRange,
): SearchPerformanceRecord[] {
  const records = new Map<string, SearchPerformanceRecord>();
  for (const response of responses) {
    const rows = asOptionalArray(
      response.raw.queries,
      `Webmaster popular.${response.period}.${response.device}.${response.sort}.queries`,
    );
    for (const [index, value] of rows.entries()) {
      const context =
        `Webmaster popular.${response.period}.${response.device}` +
        `.${response.sort}.queries[${index}]`;
      const row = asRecord(value, context);
      const indicators = asRecord(row.indicators, `${context}.indicators`);
      const queryId = asString(row.query_id, `${context}.query_id`);
      const key = `${response.period}:${response.device}:${queryId}`;
      const existing = records.get(key);
      if (existing) {
        const sortedBy = existing.sourceMetadata.sortedBy ?? [];
        if (!sortedBy.includes(response.sort)) {
          sortedBy.push(response.sort);
        }
        continue;
      }
      const clicks =
        asOptionalNumber(
          indicators.TOTAL_CLICKS,
          `${context}.indicators.TOTAL_CLICKS`,
        ) ?? 0;
      const impressions =
        asOptionalNumber(
          indicators.TOTAL_SHOWS,
          `${context}.indicators.TOTAL_SHOWS`,
        ) ?? 0;
      const returnedStart = asOptionalString(
        response.raw.date_from,
        `${context}.date_from`,
      );
      const returnedEnd = asOptionalString(
        response.raw.date_to,
        `${context}.date_to`,
      );
      const rawQueryText = asString(row.query_text, `${context}.query_text`);
      const parsedQuery = splitYandexQueryText(rawQueryText);
      records.set(key, {
        provider: "yandex_webmaster",
        searchEngine: "yandex",
        view: "popular_query",
        period: response.period,
        dateRange: {
          startDate: ranges[response.period].startDate,
          endDate: ranges[response.period].endDate,
        },
        query: parsedQuery.query,
        page: parsedQuery.page,
        device: deviceName(response.device),
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : null,
        averagePosition:
          asOptionalNumber(
            indicators.AVG_SHOW_POSITION,
            `${context}.indicators.AVG_SHOW_POSITION`,
          ) ?? null,
        sourceMetadata: {
          aggregation: "popular_search_queries",
          topRowsOnly: true,
          averageClickPosition:
            asOptionalNumber(
              indicators.AVG_CLICK_POSITION,
              `${context}.indicators.AVG_CLICK_POSITION`,
            ) ?? null,
          queryId,
          sortedBy: [response.sort],
          returnedDateRange:
            returnedStart && returnedEnd
              ? {
                  startDate: dateOnly(returnedStart),
                  endDate: dateOnly(returnedEnd),
                }
              : undefined,
          rawQueryText:
            parsedQuery.page === undefined ? undefined : rawQueryText,
          queryTargetHost: parsedQuery.targetHost,
          queryTargetSource:
            parsedQuery.page === undefined ? undefined : "query_text_suffix",
        },
      });
    }
  }
  return [...records.values()];
}

function normalizeIndicatorTechnical(
  raw: Record<string, unknown>,
  type: TechnicalRecord["type"],
  context: string,
): TechnicalRecord[] {
  const points = indicatorPoints(raw, context);
  return Object.entries(points).flatMap(([metric, series]) =>
    series.map((point) => ({
      provider: "yandex_webmaster" as const,
      type,
      date: point.date,
      metric,
      value: point.value,
      sourceMetadata: {},
    })),
  );
}

function normalizeHistoryArray(
  raw: Record<string, unknown>,
  type: TechnicalRecord["type"],
  context: string,
): TechnicalRecord[] {
  return asOptionalArray(raw.history, `${context}.history`).map(
    (value, index) => {
      const row = asRecord(value, `${context}.history[${index}]`);
      return {
        provider: "yandex_webmaster",
        type,
        date: dateOnly(
          asString(row.date, `${context}.history[${index}].date`),
        ),
        metric: type,
        value: asNumber(row.value, `${context}.history[${index}].value`),
        sourceMetadata: {},
      };
    },
  );
}

function normalizeTechnical(raw: {
  summary: Record<string, unknown>;
  diagnostics: Record<string, unknown>;
  indexing: Record<string, unknown>;
  pagesInSearch: Record<string, unknown>;
  brokenLinks: Awaited<ReturnType<typeof paginatedLinks>>;
  brokenLinkHistory: Record<string, unknown>;
  externalLinks: Awaited<ReturnType<typeof paginatedLinks>>;
  externalLinkHistory: Record<string, unknown>;
  sqi: Record<string, unknown>;
}): TechnicalRecord[] {
  const records: TechnicalRecord[] = [];
  for (const metric of [
    "sqi",
    "excluded_pages_count",
    "searchable_pages_count",
  ] as const) {
    if (raw.summary[metric] !== undefined) {
      records.push({
        provider: "yandex_webmaster",
        type: "site_summary",
        metric,
        value: asNumber(raw.summary[metric], `Webmaster summary.${metric}`),
        sourceMetadata: {},
      });
    }
  }
  if (raw.summary.site_problems) {
    const siteProblems = asRecord(
      raw.summary.site_problems,
      "Webmaster summary.site_problems",
    );
    for (const [severity, value] of Object.entries(siteProblems)) {
      records.push({
        provider: "yandex_webmaster",
        type: "site_summary",
        metric: "site_problem_count",
        value: asNumber(value, `Webmaster summary.site_problems.${severity}`),
        severity,
        sourceMetadata: {},
      });
    }
  }

  const problems = asRecord(
    raw.diagnostics.problems ?? {},
    "Webmaster diagnostics.problems",
  );
  for (const [metric, value] of Object.entries(problems)) {
    const problem = asRecord(value, `Webmaster diagnostics.${metric}`);
    records.push({
      provider: "yandex_webmaster",
      type: "diagnostic",
      date:
        typeof problem.last_state_update === "string"
          ? dateOnly(problem.last_state_update)
          : undefined,
      metric,
      value: problem.state === "PRESENT",
      severity: asOptionalString(
        problem.severity,
        `Webmaster diagnostics.${metric}.severity`,
      ),
      state: asOptionalString(
        problem.state,
        `Webmaster diagnostics.${metric}.state`,
      ),
      sourceMetadata: {},
    });
  }

  records.push(
    ...normalizeIndicatorTechnical(
      raw.indexing,
      "indexing",
      "Webmaster indexing",
    ),
    ...normalizeHistoryArray(
      raw.pagesInSearch,
      "pages_in_search",
      "Webmaster pages in search",
    ),
    ...normalizeIndicatorTechnical(
      raw.brokenLinkHistory,
      "broken_internal_link_history",
      "Webmaster broken-link history",
    ),
    ...normalizeIndicatorTechnical(
      raw.externalLinkHistory,
      "external_link_history",
      "Webmaster external-link history",
    ),
  );

  const sqiPoints = asOptionalArray(raw.sqi.points, "Webmaster SQI.points");
  for (const [index, value] of sqiPoints.entries()) {
    const point = asRecord(value, `Webmaster SQI.points[${index}]`);
    records.push({
      provider: "yandex_webmaster",
      type: "sqi",
      date: dateOnly(
        asString(point.date, `Webmaster SQI.points[${index}].date`),
      ),
      metric: "sqi",
      value: asNumber(point.value, `Webmaster SQI.points[${index}].value`),
      sourceMetadata: {},
    });
  }

  for (const [type, collection] of [
    ["broken_internal_link", raw.brokenLinks],
    ["external_link", raw.externalLinks],
  ] as const) {
    for (const [index, value] of collection.links.entries()) {
      const row = asRecord(value, `Webmaster ${type}[${index}]`);
      records.push({
        provider: "yandex_webmaster",
        type,
        date:
          typeof row.discovery_date === "string"
            ? dateOnly(row.discovery_date)
            : undefined,
        sourceUrl: asOptionalString(
          row.source_url,
          `Webmaster ${type}[${index}].source_url`,
        ),
        destinationUrl: asOptionalString(
          row.destination_url,
          `Webmaster ${type}[${index}].destination_url`,
        ),
        sourceMetadata: {
          sourceLastAccessDate: asOptionalString(
            row.source_last_access_date,
            `Webmaster ${type}[${index}].source_last_access_date`,
          ),
          sampleCount: collection.count,
          sampleTruncated: collection.truncated,
          endpointReturnsSamples: true,
          reason: asOptionalString(
            row.indicator ?? row.reason,
            `Webmaster ${type}[${index}].reason`,
          ),
          status: asOptionalString(
            row.status,
            `Webmaster ${type}[${index}].status`,
          ),
        },
      });
    }
  }
  return records;
}

export async function collectYandexWebmaster(
  config: SeoConfig,
  ranges: ComparisonRange,
  client = new YandexWebmasterClient(config.yandex),
): Promise<SourceResult> {
  const startedAt = new Date().toISOString();
  const initialRequestCount = client.requestCount;
  const userResponse = await client.getUser();
  const userId = asNumber(userResponse.user_id, "Webmaster user.user_id");
  const hostList = await client.listHosts(userId);
  const host = client.discoverHost(
    hostList.hosts,
    config.yandex.webmasterHostId,
    config.domain,
  );
  const hostId = host.mainMirror?.hostId ?? host.hostId;

  const popularProbeRaw = await client.hostGet(
    userId,
    hostId,
    "/search-queries/popular",
    {
      order_by: "TOTAL_SHOWS",
      query_indicator: [...QUERY_INDICATORS],
      device_type_indicator: "ALL",
      date_from: ranges.current.startDate,
      date_to: ranges.current.endDate,
      offset: 0,
      limit: 500,
    },
  );
  const latestPopularDate = dateOnly(
    asString(
      popularProbeRaw.date_to,
      "Webmaster popular current probe.date_to",
    ),
  );
  const effectiveRanges = deriveEffectiveComparisonRange(
    ranges,
    latestPopularDate,
  );

  const histories: HistoryResponse[] = [];
  const popular: PopularResponse[] = [];
  for (const period of ["current", "previous"] as const) {
    for (const device of DEVICES) {
      histories.push({
        period,
        device,
        raw: await client.hostGet(
          userId,
          hostId,
          "/search-queries/all/history",
          {
            query_indicator: [...QUERY_INDICATORS],
            device_type_indicator: device,
            date_from: effectiveRanges[period].startDate,
            date_to: effectiveRanges[period].endDate,
          },
        ),
      });
      for (const sort of POPULAR_SORTS) {
        popular.push({
          period,
          device,
          sort,
          raw:
            period === "current" &&
            device === "ALL" &&
            sort === "TOTAL_SHOWS"
              ? popularProbeRaw
              : await client.hostGet(
                  userId,
                  hostId,
                  "/search-queries/popular",
                  {
                    order_by: sort,
                    query_indicator: [...QUERY_INDICATORS],
                    device_type_indicator: device,
                    date_from: effectiveRanges[period].startDate,
                    date_to: effectiveRanges[period].endDate,
                    offset: 0,
                    limit: 500,
                  },
                ),
        });
      }
    }
  }

  const combinedRange = {
    date_from: effectiveRanges.previous.startDate,
    date_to: effectiveRanges.current.endDate,
  };
  const [
    summary,
    diagnostics,
    indexing,
    pagesInSearch,
    brokenLinks,
    brokenLinkHistory,
    externalLinks,
    externalLinkHistory,
    sqi,
  ] = await Promise.all([
    client.hostGet(userId, hostId, "/summary"),
    client.hostGet(userId, hostId, "/diagnostics"),
    client.hostGet(userId, hostId, "/indexing/history", combinedRange),
    client.hostGet(
      userId,
      hostId,
      "/search-urls/in-search/history",
      combinedRange,
    ),
    paginatedLinks(
      client,
      userId,
      hostId,
      "/links/internal/broken/samples",
    ),
    client.hostGet(
      userId,
      hostId,
      "/links/internal/broken/history",
      combinedRange,
    ),
    paginatedLinks(client, userId, hostId, "/links/external/samples"),
    client.hostGet(userId, hostId, "/links/external/history", {
      indicator: "LINKS_TOTAL_COUNT",
    }),
    client.hostGet(userId, hostId, "/sqi-history", combinedRange),
  ]);

  const searchPerformance = [
    ...histories.flatMap((history) =>
      normalizeHistory(history, effectiveRanges),
    ),
    ...normalizePopular(popular, effectiveRanges),
  ];
  const technical = normalizeTechnical({
    summary,
    diagnostics,
    indexing,
    pagesInSearch,
    brokenLinks,
    brokenLinkHistory,
    externalLinks,
    externalLinkHistory,
    sqi,
  });
  const currentOverall = searchPerformance.filter(
    (record) =>
      record.view === "daily" &&
      record.period === "current" &&
      record.device === "all",
  );
  if (currentOverall.length === 0) {
    throw new Error(
      "Yandex Webmaster returned no overall search-query history for the current period",
    );
  }

  const actualRanges: SourceResult["metadata"]["actualRanges"] = {};
  for (const period of ["current", "previous"] as const) {
    const response = popular.find((item) => item.period === period)?.raw;
    if (
      response &&
      typeof response.date_from === "string" &&
      typeof response.date_to === "string"
    ) {
      actualRanges[period] = {
        startDate: dateOnly(response.date_from),
        endDate: dateOnly(response.date_to),
      };
    }
  }

  const warnings = [
    ...(effectiveRanges.current.endDate !== ranges.current.endDate
      ? [
          `Yandex Webmaster complete popular-query data ended ${effectiveRanges.current.endDate}; ` +
            `comparison ranges were adjusted from requested ${ranges.current.startDate}..${ranges.current.endDate} ` +
            `and ${ranges.previous.startDate}..${ranges.previous.endDate} to effective ` +
            `${effectiveRanges.current.startDate}..${effectiveRanges.current.endDate} and ` +
            `${effectiveRanges.previous.startDate}..${effectiveRanges.previous.endDate}.`,
        ]
      : []),
    ...(brokenLinks.truncated
      ? [
          `Broken internal-link samples were capped at ${brokenLinks.links.length} of ${brokenLinks.count}.`,
        ]
      : []),
    ...(externalLinks.truncated
      ? [
          `External-link samples were capped at ${externalLinks.links.length} of ${externalLinks.count}.`,
        ]
      : []),
  ];
  return {
    provider: "yandex_webmaster",
    raw: {
      user: userResponse,
      hosts: hostList.raw,
      selectedHost: host,
      histories,
      popular,
      summary,
      diagnostics,
      indexing,
      pagesInSearch,
      brokenLinks,
      brokenLinkHistory,
      externalLinks,
      externalLinkHistory,
      sqi,
    },
    searchPerformance,
    technical,
    metadata: {
      provider: "yandex_webmaster",
      status: "success",
      startedAt,
      completedAt: new Date().toISOString(),
      requestedRanges: ranges,
      actualRanges,
      requestCount: client.requestCount - initialRequestCount,
      recordCount: searchPerformance.length + technical.length,
      warnings,
      limitations: [
        "Popular queries are a limited top set, not every query: Yandex exposes up to 500 rows per requested sort from a TOP-3000 pool.",
        "Popular-query results are fetched separately by impressions and clicks, then deduplicated by query ID and device.",
        "Yandex average show position and average click position use Yandex methodology and are not interchangeable with Google Search Console position.",
        "Link endpoints expose examples/samples; sample caps and truncation are recorded.",
        "Yandex Webmaster does not provide a verified landing-page dimension. Any @host/path suffix in query_text is retained separately as a target artifact and is not treated as a landing page.",
      ],
    },
    diagnostics: {
      userId,
      selectedHost: {
        hostId,
        url: host.asciiHostUrl,
        verified: host.verified,
      },
      accessibleHosts: hostList.hosts.map((candidate) => ({
        hostId: candidate.hostId,
        url: candidate.asciiHostUrl,
        verified: candidate.verified,
      })),
      popularQueryLimit:
        "up to 500 by impressions plus up to 500 by clicks for each device/period, deduplicated",
      requestedRanges: ranges,
      effectiveRanges,
    },
  };
}
