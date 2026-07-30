import {
  GoogleReadOnlyClient,
  type GaReportRequest,
} from "../clients/google.mts";
import type { SeoConfig } from "../config.mts";
import type {
  ComparisonRange,
  GoalRecord,
  PeriodLabel,
  SourceResult,
  TrafficRecord,
} from "../types.mts";
import {
  asArray,
  asNumber,
  asOptionalArray,
  asRecord,
  asString,
} from "../validation.mts";

const ORGANIC_FILTER = {
  filter: {
    fieldName: "sessionDefaultChannelGroup",
    stringFilter: {
      matchType: "EXACT",
      value: "Organic Search",
      caseSensitive: true,
    },
  },
};

const GA_LEAD_EVENT = "generate_lead";
const ORGANIC_LEAD_EVENT_FILTER = {
  andGroup: {
    expressions: [
      ORGANIC_FILTER,
      {
        filter: {
          fieldName: "eventName",
          stringFilter: {
            matchType: "EXACT",
            value: GA_LEAD_EVENT,
            caseSensitive: true,
          },
        },
      },
    ],
  },
};

const TRAFFIC_METRICS = [
  "activeUsers",
  "sessions",
  "newUsers",
  "engagedSessions",
  "engagementRate",
  "userEngagementDuration",
  "keyEvents",
] as const;

type GaView = {
  name: TrafficRecord["view"];
  dimensions: string[];
};

const VIEWS: GaView[] = [
  { name: "total", dimensions: [] },
  { name: "daily", dimensions: ["date"] },
  {
    name: "landing_page",
    dimensions: ["landingPagePlusQueryString", "sessionSource"],
  },
  {
    name: "source",
    dimensions: ["sessionSource", "sessionSourceMedium"],
  },
  { name: "device", dimensions: ["deviceCategory"] },
];

type GaCollectedReport = {
  name: GaView["name"] | "key_events" | "lead_events";
  dimensions: string[];
  metrics: string[];
  period: PeriodLabel;
  pages: Record<string, unknown>[];
};

async function collectReport(
  client: GoogleReadOnlyClient,
  propertyId: string,
  name: GaCollectedReport["name"],
  dimensions: string[],
  metrics: string[],
  period: PeriodLabel,
  range: { startDate: string; endDate: string },
  options: {
    dimensionFilter?: Record<string, unknown>;
    orderBys?: Array<Record<string, unknown>>;
  } = {},
): Promise<GaCollectedReport> {
  const pages: Record<string, unknown>[] = [];
  const limit = 100_000;
  let offset = 0;

  for (let page = 0; page < 100; page += 1) {
    const body: GaReportRequest = {
      dateRanges: [
        {
          startDate: range.startDate,
          endDate: range.endDate,
          name: period,
        },
      ],
      dimensions: dimensions.map((dimension) => ({ name: dimension })),
      metrics: metrics.map((metric) => ({ name: metric })),
      dimensionFilter: options.dimensionFilter,
      orderBys: options.orderBys,
      limit: String(limit),
      offset: String(offset),
      keepEmptyRows: false,
      returnPropertyQuota: true,
    };
    const response = await client.runGaReport(propertyId, body);
    pages.push(response);
    const rows = asOptionalArray(
      response.rows,
      `GA4 ${name}.${period}.rows`,
    );
    const rowCount =
      response.rowCount === undefined
        ? rows.length
        : asNumber(response.rowCount, `GA4 ${name}.${period}.rowCount`);
    offset += rows.length;
    if (rows.length < limit || offset >= rowCount) break;
    if (page === 99) {
      throw new Error(`GA4 ${name}.${period} pagination exceeded 100 pages`);
    }
  }

  return { name, dimensions, metrics, period, pages };
}

function gaDate(value: string): string {
  if (!/^\d{8}$/.test(value)) {
    throw new Error(`GA4 date has unexpected format: ${value}`);
  }
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function responseRows(
  report: GaCollectedReport,
): Array<{
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
}> {
  const result: Array<{
    dimensions: Record<string, string>;
    metrics: Record<string, number>;
  }> = [];
  for (const [pageIndex, page] of report.pages.entries()) {
    const rows = asOptionalArray(
      page.rows,
      `GA4 ${report.name}.${report.period}[${pageIndex}].rows`,
    );
    for (const [rowIndex, value] of rows.entries()) {
      const context = `GA4 ${report.name}.${report.period}[${pageIndex}].rows[${rowIndex}]`;
      const row = asRecord(value, context);
      const dimensionValues = asOptionalArray(
        row.dimensionValues,
        `${context}.dimensionValues`,
      );
      const metricValues = asArray(row.metricValues, `${context}.metricValues`);
      if (dimensionValues.length !== report.dimensions.length) {
        throw new Error(`${context}: dimension count mismatch`);
      }
      if (metricValues.length !== report.metrics.length) {
        throw new Error(`${context}: metric count mismatch`);
      }
      result.push({
        dimensions: Object.fromEntries(
          report.dimensions.map((name, index) => {
            const cell = asRecord(
              dimensionValues[index],
              `${context}.dimensionValues[${index}]`,
            );
            return [
              name,
              asString(cell.value, `${context}.dimensionValues[${index}].value`),
            ];
          }),
        ),
        metrics: Object.fromEntries(
          report.metrics.map((name, index) => {
            const cell = asRecord(
              metricValues[index],
              `${context}.metricValues[${index}]`,
            );
            return [
              name,
              asNumber(cell.value, `${context}.metricValues[${index}].value`),
            ];
          }),
        ),
      });
    }
  }
  return result;
}

export function validateGaZeroDimensionResponseForTest(
  response: Record<string, unknown>,
): number | undefined {
  return responseRows({
    name: "total",
    dimensions: [],
    metrics: ["activeUsers"],
    period: "current",
    pages: [response],
  })[0]?.metrics.activeUsers;
}

function engine(source: string | undefined): TrafficRecord["searchEngine"] {
  if (!source) return "total_search";
  if (/yandex/i.test(source)) return "yandex";
  if (/google/i.test(source)) return "google";
  return "other";
}

function normalizeTraffic(
  report: GaCollectedReport,
  ranges: ComparisonRange,
): TrafficRecord[] {
  if (report.name === "key_events" || report.name === "lead_events") return [];
  const view = report.name as TrafficRecord["view"];
  const range = ranges[report.period];
  return responseRows(report).map(({ dimensions, metrics }) => {
    const activeUsers = metrics.activeUsers ?? 0;
    return {
      provider: "google_analytics",
      searchEngine:
        report.name === "total" ||
        report.name === "daily" ||
        report.name === "device"
          ? "total_search"
          : engine(dimensions.sessionSource),
      view,
      period: report.period,
      date: dimensions.date ? gaDate(dimensions.date) : undefined,
      dateRange: {
        startDate: range.startDate,
        endDate: range.endDate,
      },
      landingPage: dimensions.landingPagePlusQueryString,
      source: dimensions.sessionSource,
      sourceMedium: dimensions.sessionSourceMedium,
      device: dimensions.deviceCategory?.toLowerCase(),
      sessions: metrics.sessions,
      activeUsers,
      newUsers: metrics.newUsers,
      engagedSessions: metrics.engagedSessions,
      engagementRate: metrics.engagementRate,
      averageEngagementSecondsPerActiveUser:
        activeUsers > 0
          ? (metrics.userEngagementDuration ?? 0) / activeUsers
          : null,
      conversions: metrics.keyEvents,
      sourceMetadata: {
        aggregation: report.name,
        metricSemantics: {
          sessions: "GA4 sessions",
          activeUsers: "GA4 active users",
          newUsers: "GA4 first-time users",
          engagedSessions: "GA4 engaged sessions",
          engagementRate: "GA4 engaged sessions divided by sessions",
          averageEngagementSecondsPerActiveUser:
            "GA4 userEngagementDuration divided by activeUsers for this row",
          conversions: "GA4 keyEvents using the property's configured key events",
        },
      },
    };
  });
}

function metadataKeyEventNames(metadata: Record<string, unknown>): string[] {
  const metrics = asOptionalArray(metadata.metrics, "GA4 metadata.metrics");
  const names = new Set<string>();
  for (const [index, value] of metrics.entries()) {
    const metric = asRecord(value, `GA4 metadata.metrics[${index}]`);
    const apiName =
      typeof metric.apiName === "string" ? metric.apiName : undefined;
    const match = apiName?.match(
      /^(?:keyEvents|sessionKeyEventRate|userKeyEventRate):(.+)$/,
    );
    if (match) names.add(match[1]);
  }
  return [...names].sort();
}

function normalizeGoals(
  report: GaCollectedReport,
  ranges: ComparisonRange,
  configuredNames: Set<string>,
): GoalRecord[] {
  const range = ranges[report.period];
  const metricName =
    report.name === "lead_events" ? ("eventCount" as const) : ("keyEvents" as const);
  const observed = responseRows(report).map(({ dimensions, metrics }) => ({
    name: dimensions.eventName,
    conversions: metrics[metricName] ?? 0,
  }));
  const expectedNames =
    report.name === "lead_events" ? [GA_LEAD_EVENT] : [...configuredNames];
  return mergeConfiguredKeyEvents(expectedNames, observed).map(
    ({ name, conversions }) => ({
      provider: "google_analytics",
      period: report.period,
      dateRange: {
        startDate: range.startDate,
        endDate: range.endDate,
      },
      goalName: name,
      searchEngine: "total_search",
      conversions,
      sourceMetadata: {
        metric: metricName,
        configuredAsKeyEvent: configuredNames.has(name),
        repositoryDocumentedCandidate: name === GA_LEAD_EVENT,
      },
    }),
  );
}

export function normalizeGaLeadCandidateForTest(
  response: Record<string, unknown>,
): GoalRecord[] {
  const range = {
    startDate: "2026-07-01",
    endDate: "2026-07-07",
    days: 7,
    includesToday: false,
  };
  return normalizeGoals(
    {
      name: "lead_events",
      dimensions: ["eventName"],
      metrics: ["eventCount"],
      period: "current",
      pages: [response],
    },
    { current: range, previous: range },
    new Set(),
  );
}

export function mergeConfiguredKeyEvents(
  configuredNames: readonly string[],
  observed: readonly { name: string; conversions: number }[],
): Array<{ name: string; conversions: number }> {
  const totals = new Map<string, number>();
  for (const name of configuredNames) totals.set(name, 0);
  for (const item of observed) {
    totals.set(item.name, (totals.get(item.name) ?? 0) + item.conversions);
  }
  return [...totals.entries()]
    .map(([name, conversions]) => ({ name, conversions }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function samplingMetadata(
  reports: readonly GaCollectedReport[],
): NonNullable<SourceResult["metadata"]["sampling"]> {
  return reports.flatMap((report) =>
    report.pages.map((page) => {
      const metadata =
        page.metadata && typeof page.metadata === "object"
          ? asRecord(page.metadata, `GA4 ${report.name}.metadata`)
          : {};
      return {
        view: report.name,
        period: report.period,
        dataLossFromOtherRow:
          typeof metadata.dataLossFromOtherRow === "boolean"
            ? metadata.dataLossFromOtherRow
            : undefined,
        subjectToThresholding:
          typeof metadata.subjectToThresholding === "boolean"
            ? metadata.subjectToThresholding
            : undefined,
      };
    }),
  );
}

export async function collectGoogleAnalytics(
  config: SeoConfig,
  ranges: ComparisonRange,
  client = new GoogleReadOnlyClient(config.google),
): Promise<SourceResult> {
  const startedAt = new Date().toISOString();
  const initialRequestCount = client.requestCount;
  const propertyId = config.google.ga4PropertyId;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is required");

  const metadata = await client.getGaMetadata(propertyId);
  const configuredKeyEvents = metadataKeyEventNames(metadata);
  const reports: GaCollectedReport[] = [];
  for (const period of ["current", "previous"] as const) {
    for (const view of VIEWS) {
      reports.push(
        await collectReport(
          client,
          propertyId,
          view.name,
          view.dimensions,
          [...TRAFFIC_METRICS],
          period,
          ranges[period],
          { dimensionFilter: ORGANIC_FILTER },
        ),
      );
    }
    reports.push(
      await collectReport(
        client,
        propertyId,
        "key_events",
        ["eventName"],
        ["keyEvents"],
        period,
        ranges[period],
        {
          dimensionFilter: ORGANIC_FILTER,
          orderBys: [
            {
              metric: { metricName: "keyEvents" },
              desc: true,
            },
          ],
        },
      ),
    );
    reports.push(
      await collectReport(
        client,
        propertyId,
        "lead_events",
        ["eventName"],
        ["eventCount"],
        period,
        ranges[period],
        {
          dimensionFilter: ORGANIC_LEAD_EVENT_FILTER,
          orderBys: [
            {
              metric: { metricName: "eventCount" },
              desc: true,
            },
          ],
        },
      ),
    );
  }

  const traffic = reports.flatMap((report) =>
    normalizeTraffic(report, ranges),
  );
  const goals = reports
    .filter(
      (report) =>
        report.name === "key_events" || report.name === "lead_events",
    )
    .flatMap((report) =>
      normalizeGoals(report, ranges, new Set(configuredKeyEvents)),
    )
    .filter(
      (goal) =>
        !(
          goal.goalName === GA_LEAD_EVENT &&
          goal.sourceMetadata.metric === "keyEvents"
        ),
    );
  const currentDailyRows = traffic.filter(
    (record) => record.period === "current" && record.view === "daily",
  );
  if (currentDailyRows.length === 0) {
    throw new Error(
      "GA4 returned no organic-search daily rows for the current period",
    );
  }

  return {
    provider: "google_analytics",
    raw: {
      metadata,
      reports,
    },
    traffic,
    goals,
    metadata: {
      provider: "google_analytics",
      status: "success",
      startedAt,
      completedAt: new Date().toISOString(),
      requestedRanges: ranges,
      actualRanges: {
        current: {
          startDate: ranges.current.startDate,
          endDate: ranges.current.endDate,
        },
        previous: {
          startDate: ranges.previous.startDate,
          endDate: ranges.previous.endDate,
        },
      },
      requestCount: client.requestCount - initialRequestCount,
      recordCount: traffic.length + goals.length,
      warnings:
        configuredKeyEvents.length === 0
          ? [
              "GA4 metadata did not expose property-specific key-event rate metrics; reported key-event rows are still collected.",
            ]
          : [],
      limitations: [
        "GA4 sessions and active users use Google Analytics definitions and are not interchangeable with Yandex Metrica visits and users.",
        "Average engagement time is derived as userEngagementDuration divided by activeUsers for each provider row.",
        "High-cardinality GA4 reports can place values in an (other) row or apply thresholding; response metadata is retained.",
        "generate_lead is the repository-confirmed GA4 lead candidate; changing its property key-event status remains a provider-side owner action.",
      ],
      sampling: samplingMetadata(reports),
    },
    diagnostics: {
      propertyId,
      configuredKeyEvents,
      observedOrganicKeyEvents: [
        ...new Set(
          goals
            .filter((goal) => goal.sourceMetadata.metric === "keyEvents")
            .map((goal) => goal.goalName),
        ),
      ],
      repositoryLeadCandidate: GA_LEAD_EVENT,
    },
  };
}
