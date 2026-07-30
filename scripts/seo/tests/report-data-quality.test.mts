import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildReport,
  generateSeoReport,
  markdownSummary,
} from "../reports.mts";
import type {
  GoalRecord,
  NormalizedCollection,
  SearchPerformanceRecord,
  TrafficRecord,
} from "../types.mts";

const ranges = {
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
} as const;

function searchRecord(
  overrides: Partial<SearchPerformanceRecord>,
): SearchPerformanceRecord {
  return {
    provider: "google_search_console",
    searchEngine: "google",
    view: "query",
    period: "current",
    dateRange: ranges.current,
    query: "test query",
    clicks: 0,
    impressions: 20,
    ctr: 0,
    averagePosition: 15,
    sourceMetadata: {
      aggregation: "byProperty",
      topRowsOnly: true,
    },
    ...overrides,
  };
}

function successfulSource(
  provider:
    | "google_search_console"
    | "yandex_webmaster"
    | "yandex_metrika"
    | "google_analytics",
): NormalizedCollection["sourceMetadata"][number] {
  return {
    provider,
    status: "success",
    startedAt: "2026-07-08T00:00:00.000Z",
    completedAt: "2026-07-08T00:00:01.000Z",
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
    requestCount: 2,
    recordCount: 1,
    warnings: [],
    limitations:
      provider === "yandex_webmaster"
        ? ["Popular-query rows are deduplicated by query ID."]
        : provider === "google_analytics"
          ? ["Average engagement is calculated for each provider row."]
          : [],
  };
}

function trafficRecord(
  overrides: Partial<TrafficRecord>,
): TrafficRecord {
  return {
    provider: "yandex_metrika",
    searchEngine: "total_search",
    view: "total",
    period: "current",
    dateRange: ranges.current,
    visits: 100,
    users: 80,
    bounceRate: 0.4,
    pageDepth: 2,
    sourceMetadata: {
      aggregation: "organic_total",
      metricSemantics: {},
    },
    ...overrides,
  };
}

function metrikaGoal(
  goalId: string,
  goalName: string,
  conversions: number,
  period: "current" | "previous" = "current",
): GoalRecord {
  return {
    provider: "yandex_metrika",
    period,
    dateRange: ranges[period],
    goalId,
    goalName,
    goalType: "action",
    searchEngine: "total_search",
    conversions,
    sourceMetadata: { metric: `goal${goalId}` },
  };
}

function gaEvent(
  goalName: string,
  conversions: number,
  configuredAsKeyEvent: boolean,
  metric: "keyEvents" | "eventCount",
  period: "current" | "previous" = "current",
): GoalRecord {
  return {
    provider: "google_analytics",
    period,
    dateRange: ranges[period],
    goalName,
    searchEngine: "total_search",
    conversions,
    sourceMetadata: {
      metric,
      configuredAsKeyEvent,
      repositoryDocumentedCandidate: goalName === "generate_lead",
    },
  };
}

function collectionFixture(): NormalizedCollection {
  const googleQueries = Array.from({ length: 60 }, (_, index) =>
    searchRecord({ query: `test query ${index}` }),
  );
  return {
    schemaVersion: 1,
    runId: "test-run",
    generatedAt: "2026-07-08T00:00:00.000Z",
    requestedRanges: ranges,
    searchPerformance: [
      searchRecord({
        view: "daily",
        date: ranges.current.endDate,
        query: undefined,
        clicks: 100,
        impressions: 2000,
        ctr: 0.05,
        averagePosition: 8,
        sourceMetadata: {
          aggregation: "byProperty",
          topRowsOnly: false,
        },
      }),
      searchRecord({
        view: "daily",
        period: "previous",
        date: ranges.previous.endDate,
        dateRange: ranges.previous,
        query: undefined,
        clicks: 90,
        impressions: 1800,
        ctr: 0.05,
        averagePosition: 9,
        sourceMetadata: {
          aggregation: "byProperty",
          topRowsOnly: false,
        },
      }),
      ...googleQueries,
      searchRecord({
        provider: "yandex_webmaster",
        searchEngine: "yandex",
        view: "daily",
        device: "all",
        query: undefined,
        date: ranges.current.endDate,
        clicks: 10,
        impressions: 100,
        ctr: 0.1,
        averagePosition: 5,
        sourceMetadata: {
          aggregation: "all_search_queries_history",
          topRowsOnly: false,
        },
      }),
      searchRecord({
        provider: "yandex_webmaster",
        searchEngine: "yandex",
        view: "daily",
        period: "previous",
        dateRange: ranges.previous,
        device: "all",
        query: undefined,
        date: ranges.previous.endDate,
        clicks: 8,
        impressions: 80,
        ctr: 0.1,
        averagePosition: 6,
        sourceMetadata: {
          aggregation: "all_search_queries_history",
          topRowsOnly: false,
        },
      }),
    ],
    traffic: [
      trafficRecord({}),
      trafficRecord({
        view: "source",
        searchEngine: "yandex",
        visits: 40,
        users: 35,
        sourceMetadata: {
          aggregation: "search_engines",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        view: "source",
        searchEngine: "google",
        visits: 50,
        users: 42,
        sourceMetadata: {
          aggregation: "search_engines",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        view: "source",
        searchEngine: "other",
        visits: 10,
        users: 8,
        sourceMetadata: {
          aggregation: "search_engines",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        provider: "google_analytics",
        sessions: 90,
        activeUsers: 70,
        engagedSessions: 60,
        engagementRate: 2 / 3,
        visits: undefined,
        users: undefined,
        bounceRate: undefined,
        pageDepth: undefined,
        sourceMetadata: {
          aggregation: "total",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        provider: "google_analytics",
        view: "source",
        searchEngine: "yandex",
        sessions: 30,
        visits: undefined,
        users: undefined,
        sourceMetadata: {
          aggregation: "source",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        provider: "google_analytics",
        view: "source",
        searchEngine: "google",
        sessions: 55,
        visits: undefined,
        users: undefined,
        sourceMetadata: {
          aggregation: "source",
          metricSemantics: {},
        },
      }),
      trafficRecord({
        provider: "google_analytics",
        view: "source",
        searchEngine: "other",
        sessions: 5,
        visits: undefined,
        users: undefined,
        sourceMetadata: {
          aggregation: "source",
          metricSemantics: {},
        },
      }),
    ],
    goals: [
      metrikaGoal("562860580", "Successful lead submission", 2),
      metrikaGoal(
        "562860580",
        "Successful lead submission",
        1,
        "previous",
      ),
      metrikaGoal("562860814", "Lead from test result", 1),
      metrikaGoal("563512735", "Server-side lead fallback", 0),
      metrikaGoal("560790965", "Auto form", 3),
      metrikaGoal("560797964", "Auto submit lead", 2),
      metrikaGoal("566641320", "Auto contact data sent", 2),
      metrikaGoal("566641321", "Auto contact data", 4),
      gaEvent("purchase", 0, true, "keyEvents"),
      gaEvent("purchase", 0, true, "keyEvents", "previous"),
      gaEvent("generate_lead", 3, false, "eventCount"),
      gaEvent("generate_lead", 1, false, "eventCount", "previous"),
    ],
    technical: [
      {
        provider: "yandex_webmaster",
        type: "broken_internal_link",
        sourceUrl: "https://chinachild.ru/source-a",
        destinationUrl: "https://chinachild.ru/missing",
        sourceMetadata: {
          sampleCount: 2,
          sampleTruncated: false,
          endpointReturnsSamples: true,
        },
      },
      {
        provider: "yandex_webmaster",
        type: "broken_internal_link",
        sourceUrl: "https://chinachild.ru/source-b",
        destinationUrl: "https://chinachild.ru/missing",
        sourceMetadata: {
          sampleCount: 2,
          sampleTruncated: false,
          endpointReturnsSamples: true,
        },
      },
      {
        provider: "yandex_webmaster",
        type: "broken_internal_link_history",
        date: "2026-07-07",
        metric: "DISALLOWED_BY_USER",
        value: 2,
        sourceMetadata: {},
      },
    ],
    sourceMetadata: [
      successfulSource("yandex_webmaster"),
      successfulSource("google_search_console"),
      successfulSource("yandex_metrika"),
      successfulSource("google_analytics"),
    ],
    configuredCommercialQueries: [
      "онлайн-школа китайского языка",
      "курсы китайского языка онлайн",
      "обучение китайскому языку онлайн",
      "репетитор китайского онлайн",
      "преподаватель китайского онлайн",
    ],
    notes: [],
  };
}

test("report preserves full opportunity counts, query coverage, broken-link samples, and lead review rows", () => {
  const collection = collectionFixture();
  const report = buildReport(collection);
  assert.equal(
    report.searchVisibility.googleSearchConsole.opportunities.closeToFirstPage
      .totalCount,
    60,
  );
  assert.equal(
    report.searchVisibility.googleSearchConsole.opportunities.closeToFirstPage
      .displayed.length,
    50,
  );
  assert.equal(
    report.searchVisibility.googleSearchConsole.opportunities.weakCtr
      .totalCount,
    60,
  );
  assert.equal(
    report.searchVisibility.googleSearchConsole.queryCoverage
      .impressionCoverage,
    0.6,
  );
  assert.equal(
    report.searchVisibility.yandexWebmaster.technical.brokenInternalLinks
      .uniqueTargetCount,
    1,
  );
  assert.equal(
    report.searchVisibility.yandexWebmaster.technical.brokenInternalLinks
      .sampleRowCount,
    2,
  );
  assert.equal(report.leadConfigurationReview.length, 12);
  assert.equal(
    report.leadConfigurationReview.find(
      (item) =>
        item.goalId === "562860580" && item.period === "current",
    )?.leadSelection,
    "primary_lead",
  );
  assert.equal(
    report.leadConfigurationReview.find(
      (item) =>
        item.name === "generate_lead" && item.period === "current",
    )?.leadSelection,
    "lead_candidate",
  );
  for (const goalId of [
    "560790965",
    "560797964",
    "566641320",
    "566641321",
  ]) {
    assert.equal(
      report.leadConfigurationReview.find((item) => item.goalId === goalId)
        ?.leadSelection,
      "excluded_overlap",
    );
  }
  assert.equal(
    report.leadConfigurationReview.find(
      (item) => item.goalId === "562860814",
    )?.leadSelection,
    "excluded_hsk_funnel",
  );
  assert.equal(
    report.leadConfigurationReview.find(
      (item) => item.goalId === "563512735",
    )?.leadSelection,
    "excluded_server_fallback",
  );

  const markdown = markdownSummary(collection, report);
  assert.match(markdown, /показано 50 из 60/);
  assert.match(markdown, /1200 из 2000 показов \(60\.0%\)/);
  assert.match(
    markdown,
    /Строк с примерами от Вебмастера: 2; уникальных целевых URL: 1/,
  );
  assert.match(markdown, /https:\/\/chinachild\.ru\/missing/);
  assert.doesNotMatch(
    markdown,
    /вернулне|позапросу|competitioncannot|источник вернулне|по запросуcompetition|Классификацияприменяется|itsbusiness|byquery|eachprovider/i,
  );
  assert.match(markdown, /Классификация применяется/);
  assert.match(markdown, /its business/);
  assert.match(markdown, /by query/);
  assert.match(markdown, /each provider/);
});

test("report separates visibility, analytics traffic, and unresolved conversions", () => {
  const collection = collectionFixture();
  const report = buildReport(collection);
  const markdown = markdownSummary(collection, report);

  assert.equal("yandex" in report, false);
  assert.equal("google" in report, false);
  assert.deepEqual(
    report.organicTraffic.yandexMetrika.searchEngineBreakdown.current,
    {
      supported: true,
      metric: "visits",
      basis: "Yandex Metrica searchEngine dimension",
      yandex: 40,
      google: 50,
      other: 10,
      sourceRowCount: 3,
    },
  );
  assert.equal(
    report.organicTraffic.googleAnalytics.searchEngineBreakdown.current.yandex,
    30,
  );
  assert.equal(
    report.organicTraffic.googleAnalytics.searchEngineBreakdown.current.google,
    55,
  );
  assert.equal(
    report.conversions.leadSelection,
    "owner_approved_code_classification",
  );
  assert.equal(
    report.conversions.yandexMetrika.primaryLeadGoal?.goalId,
    "562860580",
  );
  assert.equal(
    report.conversions.googleAnalytics.leadCandidate?.goalName,
    "generate_lead",
  );
  assert.equal(report.conversions.googleAnalytics.keyEvents.length, 1);
  assert.match(markdown, /Основная лид-цель: 562860580 lead_submitted/);
  assert.match(markdown, /Кандидат в лид-событие: generate_lead/);
  assert.match(markdown, /исключены из лид-итога и не складываются/);

  const visibility = markdown.indexOf("## 1. Поисковая видимость");
  const webmaster = markdown.indexOf("### Яндекс Вебмастер");
  const searchConsole = markdown.indexOf("### Google Search Console");
  const traffic = markdown.indexOf("## 2. Органический трафик");
  const metrika = markdown.indexOf("### Яндекс Метрика");
  const ga4 = markdown.indexOf("### Google Analytics 4");
  const conversions = markdown.indexOf("## 3. Конверсии");
  assert.ok(
    visibility < webmaster &&
      webmaster < searchConsole &&
      searchConsole < traffic &&
      traffic < metrika &&
      metrika < ga4 &&
      ga4 < conversions,
  );
  assert.match(markdown, /Яндекс — 40 визитов; Google — 50 визитов/);
  assert.match(markdown, /Яндекс — 30 сессий; Google — 55 сессий/);
  assert.match(
    markdown,
    /визиты или сессии не сравниваются напрямую с кликами/i,
  );
});

test("report discloses an overlapping unconfirmed migration without pure SEO attribution", () => {
  const collection = collectionFixture();
  collection.requestedRanges = {
    current: {
      startDate: "2026-05-01",
      endDate: "2026-07-07",
      days: 68,
      includesToday: false,
    },
    previous: {
      startDate: "2026-02-22",
      endDate: "2026-04-30",
      days: 68,
      includesToday: false,
    },
  };
  const report = buildReport(collection);
  const markdown = markdownSummary(collection, report);
  assert.equal(report.migrationContext.confirmed, false);
  assert.equal(report.migrationContext.currentPeriodOverlaps, true);
  assert.match(markdown, /приблизительная дата.*2026-06-01/i);
  assert.match(markdown, /она не подтверждена/i);
  assert.match(markdown, /не должен интерпретироваться как чистый SEO-рост/i);
});

test("report writer creates complete opportunity, broken-link, and unresolved lead-review CSVs", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "seo-report-quality-"),
  );
  try {
    const collection = collectionFixture();
    const normalizedDirectory = path.join(
      temporaryDirectory,
      "runs/test-run/normalized",
    );
    await mkdir(normalizedDirectory, { recursive: true });
    await writeFile(
      path.join(normalizedDirectory, "collection.json"),
      `${JSON.stringify(collection)}\n`,
    );
    await writeFile(
      path.join(temporaryDirectory, "latest.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        runId: "test-run",
        collectionPath: "runs/test-run/normalized/collection.json",
      })}\n`,
    );

    const generated = await generateSeoReport(temporaryDirectory);
    const opportunities = await readFile(
      path.join(generated.reportDirectory, "csv/search-opportunities.csv"),
      "utf8",
    );
    const broken = await readFile(
      path.join(generated.reportDirectory, "csv/broken-internal-links.csv"),
      "utf8",
    );
    const leads = await readFile(
      path.join(
        generated.reportDirectory,
        "csv/lead-configuration-review.csv",
      ),
      "utf8",
    );
    assert.match(opportunities, /test query 59/);
    assert.equal(
      opportunities
        .split("\n")
        .filter((line) => line.includes("close_to_first_page")).length,
      60,
    );
    assert.match(broken, /source-a/);
    assert.match(broken, /unique_target_count/);
    assert.match(leads, /owner_confirmation_required/);
    assert.match(leads, /primary_lead/);
    assert.match(leads, /lead_candidate/);
    assert.match(leads, /excluded_overlap/);
    assert.match(leads, /excluded_hsk_funnel/);
    assert.match(leads, /excluded_server_fallback/);
    assert.match(leads, /purchase/);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
