import { YandexMetrikaClient } from "../clients/yandex.mts";
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
  asOptionalNumber,
  asOptionalString,
  asRecord,
  asString,
} from "../validation.mts";

const ORGANIC_FILTER = "ym:s:trafficSource=='organic'";
const TRAFFIC_METRICS = [
  "ym:s:visits",
  "ym:s:users",
  "ym:s:bounceRate",
  "ym:s:avgPageViews",
  "ym:s:avgVisitDurationSeconds",
] as const;

type GoalDefinition = {
  id: string;
  name: string;
  type?: string;
};

type MetrikaReport = {
  name:
    | "daily"
    | "organic_total"
    | "search_engines"
    | "landing_pages"
    | "devices"
    | "traffic_sources"
    | "goal_totals"
    | "goal_engines";
  period: PeriodLabel;
  dimensions: string[];
  metrics: string[];
  pages: Record<string, unknown>[];
};

async function collectReport(
  client: YandexMetrikaClient,
  counterId: number,
  name: MetrikaReport["name"],
  period: PeriodLabel,
  range: { startDate: string; endDate: string },
  dimensions: string[],
  metrics: string[],
  filters?: string,
): Promise<MetrikaReport> {
  const pages: Record<string, unknown>[] = [];
  const limit = 10_000;
  let offset = 1;

  for (let page = 0; page < 100; page += 1) {
    const response = await client.report({
      ids: counterId,
      date1: range.startDate,
      date2: range.endDate,
      dimensions: dimensions.length > 0 ? dimensions.join(",") : undefined,
      metrics: metrics.join(","),
      filters,
      accuracy: "full",
      include_undefined: true,
      lang: "en",
      limit,
      offset,
    });
    pages.push(response);
    const data = asOptionalArray(
      response.data,
      `Metrica ${name}.${period}.data`,
    );
    const totalRows =
      response.total_rows === undefined
        ? data.length
        : asNumber(response.total_rows, `Metrica ${name}.${period}.total_rows`);
    offset += data.length;
    if (data.length < limit || offset > totalRows) break;
    if (page === 99) {
      throw new Error(`Metrica ${name}.${period} pagination exceeded 100 pages`);
    }
  }
  return { name, period, dimensions, metrics, pages };
}

function goalsFromResponse(raw: Record<string, unknown>): GoalDefinition[] {
  return asOptionalArray(raw.goals, "Metrica goals.goals").map(
    (value, index) => {
      const row = asRecord(value, `Metrica goal[${index}]`);
      return {
        id: String(asNumber(row.id, `Metrica goal[${index}].id`)),
        name: asString(row.name, `Metrica goal[${index}].name`),
        type: asOptionalString(row.type, `Metrica goal[${index}].type`),
      };
    },
  );
}

function dimensionCell(
  value: unknown,
  context: string,
): { id?: string; name: string } {
  if (typeof value === "string") return { name: value };
  const record = asRecord(value, context);
  const name =
    typeof record.name === "string"
      ? record.name
      : typeof record.id === "string" || typeof record.id === "number"
        ? String(record.id)
        : "";
  if (!name) throw new Error(`${context}: missing dimension name and id`);
  return {
    id:
      typeof record.id === "string" || typeof record.id === "number"
        ? String(record.id)
        : undefined,
    name,
  };
}

function reportRows(report: MetrikaReport): Array<{
  dimensions: Record<string, { id?: string; name: string }>;
  metrics: Record<string, number>;
}> {
  const result: Array<{
    dimensions: Record<string, { id?: string; name: string }>;
    metrics: Record<string, number>;
  }> = [];
  for (const [pageIndex, page] of report.pages.entries()) {
    const rows = asOptionalArray(
      page.data,
      `Metrica ${report.name}.${report.period}[${pageIndex}].data`,
    );
    for (const [rowIndex, value] of rows.entries()) {
      const context =
        `Metrica ${report.name}.${report.period}[${pageIndex}]` +
        `.data[${rowIndex}]`;
      const row = asRecord(value, context);
      const dimensions = asArray(row.dimensions ?? [], `${context}.dimensions`);
      const metrics = asArray(row.metrics, `${context}.metrics`);
      if (dimensions.length !== report.dimensions.length) {
        throw new Error(`${context}: dimension count mismatch`);
      }
      if (metrics.length !== report.metrics.length) {
        throw new Error(`${context}: metric count mismatch`);
      }
      result.push({
        dimensions: Object.fromEntries(
          report.dimensions.map((name, index) => [
            name,
            dimensionCell(dimensions[index], `${context}.dimensions[${index}]`),
          ]),
        ),
        metrics: Object.fromEntries(
          report.metrics.map((name, index) => [
            name,
            asNumber(metrics[index], `${context}.metrics[${index}]`),
          ]),
        ),
      });
    }
  }
  return result;
}

function engineFromDimension(
  value: { id?: string; name: string } | undefined,
): TrafficRecord["searchEngine"] {
  if (!value) return "total_search";
  const text = `${value.id ?? ""} ${value.name}`;
  if (/yandex|яндекс/i.test(text)) return "yandex";
  if (/google/i.test(text)) return "google";
  return "other";
}

function metric(
  metrics: Record<string, number>,
  name: (typeof TRAFFIC_METRICS)[number],
): number {
  return metrics[name] ?? 0;
}

function normalizeTraffic(
  report: MetrikaReport,
  ranges: ComparisonRange,
): TrafficRecord[] {
  if (report.name === "goal_totals" || report.name === "goal_engines") return [];
  const range = ranges[report.period];
  return reportRows(report).map(({ dimensions, metrics }) => {
    const searchEngineDimension = dimensions["ym:s:searchEngine"];
    const trafficSourceDimension = dimensions["ym:s:trafficSource"];
    const sourceText =
      searchEngineDimension?.name ?? trafficSourceDimension?.name;
    const sourceId = trafficSourceDimension?.id;
    const isOrganicSource =
      report.name !== "traffic_sources" ||
      /organic|search/i.test(`${sourceId ?? ""} ${sourceText ?? ""}`);
    return {
      provider: "yandex_metrika",
      searchEngine:
        report.name === "organic_total" ||
        report.name === "daily" ||
        report.name === "devices"
          ? "total_search"
          : report.name === "traffic_sources"
            ? isOrganicSource
              ? "total_search"
              : "other"
            : engineFromDimension(searchEngineDimension),
      view:
        report.name === "organic_total"
          ? "total"
          : report.name === "landing_pages"
          ? "landing_page"
          : report.name === "devices"
            ? "device"
            : report.name === "daily"
              ? "daily"
              : "source",
      period: report.period,
      date: dimensions["ym:s:date"]?.name,
      dateRange: {
        startDate: range.startDate,
        endDate: range.endDate,
      },
      landingPage: dimensions["ym:s:startURL"]?.name,
      source: sourceText,
      device: dimensions["ym:s:deviceCategory"]?.name.toLowerCase(),
      visits: metric(metrics, "ym:s:visits"),
      users: metric(metrics, "ym:s:users"),
      bounceRate: metric(metrics, "ym:s:bounceRate") / 100,
      pageDepth: metric(metrics, "ym:s:avgPageViews"),
      averageVisitDurationSeconds: metric(
        metrics,
        "ym:s:avgVisitDurationSeconds",
      ),
      sourceMetadata: {
        aggregation: report.name,
        metricSemantics: {
          visits: "Yandex Metrica visits",
          users: "Yandex Metrica unique users",
          bounceRate: "Yandex Metrica bounce rate",
          pageDepth: "Yandex Metrica average pageviews per visit",
          averageVisitDurationSeconds:
            "Yandex Metrica average visit duration",
        },
      },
    };
  });
}

function normalizeGoals(
  report: MetrikaReport,
  ranges: ComparisonRange,
  goalsByMetric: Map<string, GoalDefinition>,
): GoalRecord[] {
  if (report.name !== "goal_totals" && report.name !== "goal_engines") return [];
  const range = ranges[report.period];
  const rows = reportRows(report);
  const rowsIncludingEmptyTotals =
    report.name === "goal_totals" && rows.length === 0
      ? [{ dimensions: {}, metrics: {} }]
      : rows;
  return rowsIncludingEmptyTotals.flatMap(({ dimensions, metrics }) =>
    report.metrics.map((metricName) => {
      const goal = goalsByMetric.get(metricName);
      if (!goal) {
        throw new Error(`Metrica goal metric has no definition: ${metricName}`);
      }
      return {
        provider: "yandex_metrika" as const,
        period: report.period,
        dateRange: {
          startDate: range.startDate,
          endDate: range.endDate,
        },
        goalId: goal.id,
        goalName: goal.name,
        goalType: goal.type,
        searchEngine:
          report.name === "goal_totals"
            ? ("total_search" as const)
            : engineFromDimension(dimensions["ym:s:searchEngine"]),
        conversions: metrics[metricName] ?? 0,
        sourceMetadata: {
          metric: metricName,
        },
      };
    }),
  );
}

export function normalizeEmptyMetrikaGoalTotalsForTest(): GoalRecord[] {
  const ranges: ComparisonRange = {
    current: {
      startDate: "2026-07-01",
      endDate: "2026-07-07",
      days: 7,
      includesToday: false,
    },
    previous: {
      startDate: "2026-06-24",
      endDate: "2026-06-30",
      days: 7,
      includesToday: false,
    },
  };
  return normalizeGoals(
    {
      name: "goal_totals",
      period: "previous",
      dimensions: [],
      metrics: ["ym:s:goal1reaches"],
      pages: [{ data: [] }],
    },
    ranges,
    new Map([
      [
        "ym:s:goal1reaches",
        { id: "1", name: "Configured goal", type: "action" },
      ],
    ]),
  );
}

function samplingMetadata(
  reports: readonly MetrikaReport[],
): NonNullable<SourceResult["metadata"]["sampling"]> {
  return reports.flatMap((report) =>
    report.pages.map((page) => ({
      view: report.name,
      period: report.period,
      sampled:
        typeof page.sampled === "boolean" ? page.sampled : undefined,
      sampleShare: asOptionalNumber(
        page.sample_share,
        `Metrica ${report.name}.sample_share`,
      ),
    })),
  );
}

export async function collectYandexMetrika(
  config: SeoConfig,
  ranges: ComparisonRange,
  client = new YandexMetrikaClient(config.yandex),
): Promise<SourceResult> {
  const startedAt = new Date().toISOString();
  const initialRequestCount = client.requestCount;
  const counterList = await client.listCounters();
  const counter = client.discoverCounter(
    counterList.counters,
    config.yandex.metrikaCounterId,
    config.domain,
  );
  const [counterInfo, goalsResponse] = await Promise.all([
    client.getCounter(counter.id),
    client.getGoals(counter.id),
  ]);
  const goals = goalsFromResponse(goalsResponse);

  const reports: MetrikaReport[] = [];
  for (const period of ["current", "previous"] as const) {
    const range = ranges[period];
    reports.push(
      await collectReport(
        client,
        counter.id,
        "organic_total",
        period,
        range,
        [],
        [...TRAFFIC_METRICS],
        ORGANIC_FILTER,
      ),
      await collectReport(
        client,
        counter.id,
        "daily",
        period,
        range,
        ["ym:s:date"],
        [...TRAFFIC_METRICS],
        ORGANIC_FILTER,
      ),
      await collectReport(
        client,
        counter.id,
        "search_engines",
        period,
        range,
        ["ym:s:searchEngine"],
        [...TRAFFIC_METRICS],
        ORGANIC_FILTER,
      ),
      await collectReport(
        client,
        counter.id,
        "landing_pages",
        period,
        range,
        ["ym:s:startURL", "ym:s:searchEngine"],
        [...TRAFFIC_METRICS],
        ORGANIC_FILTER,
      ),
      await collectReport(
        client,
        counter.id,
        "devices",
        period,
        range,
        ["ym:s:deviceCategory"],
        [...TRAFFIC_METRICS],
        ORGANIC_FILTER,
      ),
      await collectReport(
        client,
        counter.id,
        "traffic_sources",
        period,
        range,
        ["ym:s:trafficSource"],
        [...TRAFFIC_METRICS],
      ),
    );

    for (let index = 0; index < goals.length; index += 15) {
      const chunk = goals.slice(index, index + 15);
      const goalMetrics = chunk.map((goal) => `ym:s:goal${goal.id}reaches`);
      reports.push(
        await collectReport(
          client,
          counter.id,
          "goal_totals",
          period,
          range,
          [],
          goalMetrics,
          ORGANIC_FILTER,
        ),
        await collectReport(
          client,
          counter.id,
          "goal_engines",
          period,
          range,
          ["ym:s:searchEngine"],
          goalMetrics,
          ORGANIC_FILTER,
        ),
      );
    }
  }

  const goalsByMetric = new Map(
    goals.map((goal) => [`ym:s:goal${goal.id}reaches`, goal]),
  );
  const traffic = reports.flatMap((report) =>
    normalizeTraffic(report, ranges),
  );
  const normalizedGoals = reports.flatMap((report) =>
    normalizeGoals(report, ranges, goalsByMetric),
  );
  const currentDailyRows = traffic.filter(
    (record) => record.period === "current" && record.view === "daily",
  );
  if (currentDailyRows.length === 0) {
    throw new Error(
      "Yandex Metrica returned no organic-search daily rows for the current period",
    );
  }

  return {
    provider: "yandex_metrika",
    raw: {
      counterList: counterList.rawPages,
      selectedCounter: counterInfo,
      goals: goalsResponse,
      reports,
    },
    traffic,
    goals: normalizedGoals,
    metadata: {
      provider: "yandex_metrika",
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
      recordCount: traffic.length + normalizedGoals.length,
      warnings:
        goals.length === 0
          ? ["The selected Metrica counter exposes no configured goals."]
          : [],
      limitations: [
        "Metrica visits and users use Yandex definitions and are not interchangeable with GA4 sessions and active users.",
        "Metrica can suppress sensitive dimensions for small audiences; raw disclosure and sampling flags are retained.",
        "Goal reaches are reported by configured goal ID and name; goal 562860580 is the owner-approved primary lead goal, while auto goals, hsk_test_lead, and the server fallback remain excluded.",
        "User counts must not be summed across landing-page, device, or search-engine rows.",
      ],
      sampling: samplingMetadata(reports),
    },
    diagnostics: {
      selectedCounter: {
        id: counter.id,
        name: counter.name,
        site: counter.site,
        permission: counter.permission ?? "unknown",
      },
      goals,
    },
  };
}
