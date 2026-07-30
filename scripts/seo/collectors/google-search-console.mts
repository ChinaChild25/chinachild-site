import { GoogleReadOnlyClient } from "../clients/google.mts";
import type { SeoConfig } from "../config.mts";
import { deriveEffectiveComparisonRange } from "../date-range.mts";
import type {
  ComparisonRange,
  PeriodLabel,
  SearchPerformanceRecord,
  SourceResult,
} from "../types.mts";
import {
  asArray,
  asNumber,
  asOptionalArray,
  asRecord,
  asString,
} from "../validation.mts";

type GscView = {
  name: SearchPerformanceRecord["view"];
  dimensions: string[];
};

const VIEWS: GscView[] = [
  { name: "daily", dimensions: ["date"] },
  { name: "query", dimensions: ["query"] },
  { name: "page", dimensions: ["page"] },
  { name: "device", dimensions: ["device"] },
  {
    name: "detail",
    dimensions: ["date", "query", "page", "device", "country"],
  },
];

type CollectedView = {
  view: GscView;
  period: PeriodLabel;
  range: { startDate: string; endDate: string };
  pages: Record<string, unknown>[];
};

async function collectView(
  client: GoogleReadOnlyClient,
  property: string,
  view: GscView,
  period: PeriodLabel,
  range: { startDate: string; endDate: string },
): Promise<CollectedView> {
  const pages: Record<string, unknown>[] = [];
  const rowLimit = 25_000;
  let startRow = 0;

  for (let page = 0; page < 100; page += 1) {
    const response = await client.querySearchConsole(property, {
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: view.dimensions,
      type: "web",
      dataState: "final",
      rowLimit,
      startRow,
    });
    pages.push(response);
    const rows = asOptionalArray(
      response.rows,
      `Search Console ${view.name}.${period}.rows`,
    );
    if (rows.length < rowLimit) break;
    startRow += rows.length;
    if (page === 99) {
      throw new Error(
        `Search Console ${view.name}.${period} pagination exceeded 100 pages`,
      );
    }
  }
  return { view, period, range, pages };
}

function rowDimensions(
  row: Record<string, unknown>,
  dimensions: readonly string[],
  context: string,
): Record<string, string> {
  const keys = asArray(row.keys, `${context}.keys`);
  if (keys.length !== dimensions.length) {
    throw new Error(
      `${context}.keys: expected ${dimensions.length}, received ${keys.length}`,
    );
  }
  return Object.fromEntries(
    dimensions.map((dimension, index) => [
      dimension,
      asString(keys[index], `${context}.keys[${index}]`),
    ]),
  );
}

function normalizeView(
  collected: CollectedView,
): SearchPerformanceRecord[] {
  const records: SearchPerformanceRecord[] = [];
  const range = collected.range;

  for (const [pageIndex, page] of collected.pages.entries()) {
    const rows = asOptionalArray(
      page.rows,
      `Search Console ${collected.view.name}.${collected.period}[${pageIndex}].rows`,
    );
    for (const [rowIndex, value] of rows.entries()) {
      const context =
        `Search Console ${collected.view.name}.${collected.period}` +
        `[${pageIndex}].rows[${rowIndex}]`;
      const row = asRecord(value, context);
      const dimensions = rowDimensions(
        row,
        collected.view.dimensions,
        context,
      );
      const clicks = asNumber(row.clicks, `${context}.clicks`);
      const impressions = asNumber(row.impressions, `${context}.impressions`);
      records.push({
        provider: "google_search_console",
        searchEngine: "google",
        view: collected.view.name,
        period: collected.period,
        date: dimensions.date,
        dateRange: {
          startDate: range.startDate,
          endDate: range.endDate,
        },
        query: dimensions.query,
        page: dimensions.page,
        device: dimensions.device?.toLowerCase(),
        country: dimensions.country?.toLowerCase(),
        clicks,
        impressions,
        ctr:
          row.ctr === undefined
            ? impressions > 0
              ? clicks / impressions
              : null
            : asNumber(row.ctr, `${context}.ctr`),
        averagePosition:
          row.position === undefined
            ? null
            : asNumber(row.position, `${context}.position`),
        sourceMetadata: {
          aggregation:
            typeof page.responseAggregationType === "string"
              ? page.responseAggregationType
              : "auto",
          topRowsOnly: ["query", "page", "detail"].includes(
            collected.view.name,
          ),
        },
      });
    }
  }
  return records;
}

function observedDailyRange(
  records: readonly SearchPerformanceRecord[],
  period: PeriodLabel,
): { startDate: string; endDate: string } | undefined {
  const dates = records
    .filter(
      (record) =>
        record.period === period &&
        record.view === "daily" &&
        record.date !== undefined,
    )
    .map((record) => record.date!)
    .sort();
  if (dates.length === 0) return undefined;
  return {
    startDate: dates[0],
    endDate: dates.at(-1)!,
  };
}

export async function collectGoogleSearchConsole(
  config: SeoConfig,
  ranges: ComparisonRange,
  client = new GoogleReadOnlyClient(config.google),
): Promise<SourceResult> {
  const startedAt = new Date().toISOString();
  const initialRequestCount = client.requestCount;
  const property = config.google.searchConsoleProperty;
  if (!property) throw new Error("GOOGLE_SEARCH_CONSOLE_PROPERTY is required");

  const propertyInfo = await client.getSearchConsoleProperty(property);
  const dailyView = VIEWS.find((view) => view.name === "daily")!;
  const requestedCurrentDaily = await collectView(
    client,
    property,
    dailyView,
    "current",
    ranges.current,
  );
  const requestedDailyRecords = normalizeView(requestedCurrentDaily);
  const observedRequestedCurrent = observedDailyRange(
    requestedDailyRecords,
    "current",
  );
  if (!observedRequestedCurrent) {
    throw new Error(
      "Google Search Console returned no finalized daily rows for the current period",
    );
  }
  const effectiveRanges = deriveEffectiveComparisonRange(
    ranges,
    observedRequestedCurrent.endDate,
  );

  const collectedViews: CollectedView[] = [
    {
      ...requestedCurrentDaily,
      range: effectiveRanges.current,
    },
  ];
  for (const period of ["current", "previous"] as const) {
    for (const view of VIEWS) {
      if (period === "current" && view.name === "daily") continue;
      collectedViews.push(
        await collectView(
          client,
          property,
          view,
          period,
          effectiveRanges[period],
        ),
      );
    }
  }

  const searchPerformance = collectedViews.flatMap((view) =>
    normalizeView(view),
  );
  const currentDailyRows = searchPerformance.filter(
    (record) => record.period === "current" && record.view === "daily",
  );
  if (currentDailyRows.length === 0) {
    throw new Error(
      "Google Search Console returned no finalized daily rows for the current period",
    );
  }

  const actualRanges: SourceResult["metadata"]["actualRanges"] = {
    current: {
      startDate: effectiveRanges.current.startDate,
      endDate: effectiveRanges.current.endDate,
    },
    previous: {
      startDate: effectiveRanges.previous.startDate,
      endDate: effectiveRanges.previous.endDate,
    },
  };
  const rangeWarnings =
    effectiveRanges.current.endDate === ranges.current.endDate
      ? []
      : [
          `Search Console finalized data ended ${effectiveRanges.current.endDate}; ` +
            `comparison ranges were adjusted from requested ${ranges.current.startDate}..${ranges.current.endDate} ` +
            `and ${ranges.previous.startDate}..${ranges.previous.endDate} to effective ` +
            `${effectiveRanges.current.startDate}..${effectiveRanges.current.endDate} and ` +
            `${effectiveRanges.previous.startDate}..${effectiveRanges.previous.endDate}.`,
        ];
  const limitations = [
    "Search Analytics is finalized data and can lag behind the most recent calendar days.",
    "Search Console does not guarantee every query row; query, page, and detail views contain top rows and anonymized queries can be omitted.",
    "Metrics from different Search Console aggregation views must not be summed together.",
  ];
  return {
    provider: "google_search_console",
    raw: {
      property: propertyInfo,
      views: collectedViews.map((item) => ({
        name: item.view.name,
        dimensions: item.view.dimensions,
        period: item.period,
        pages: item.pages,
      })),
    },
    searchPerformance,
    metadata: {
      provider: "google_search_console",
      status: "success",
      startedAt,
      completedAt: new Date().toISOString(),
      requestedRanges: ranges,
      actualRanges,
      requestCount: client.requestCount - initialRequestCount,
      recordCount: searchPerformance.length,
      warnings: rangeWarnings,
      limitations,
    },
    diagnostics: {
      property,
      permissionLevel:
        typeof propertyInfo.permissionLevel === "string"
          ? propertyInfo.permissionLevel
          : "unknown",
      currentDailyRows: currentDailyRows.length,
      requestedRanges: ranges,
      effectiveRanges,
      viewRowCounts: Object.fromEntries(
        VIEWS.flatMap((view) =>
          (["current", "previous"] as const).map((period) => [
            `${period}.${view.name}`,
            searchPerformance.filter(
              (record) =>
                record.period === period && record.view === view.name,
            ).length,
          ]),
        ),
      ),
    },
  };
}

export function validateSearchConsoleResponseForTest(value: unknown): number {
  const response = asRecord(value, "Search Console test response");
  return asOptionalArray(response.rows, "Search Console test response.rows").reduce<number>(
    (sum, row, index) =>
      sum +
      asNumber(
        asRecord(row, `Search Console test row[${index}]`).clicks,
        `Search Console test row[${index}].clicks`,
      ),
    0,
  );
}
