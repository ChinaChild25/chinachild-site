import assert from "node:assert/strict";
import test from "node:test";
import { buildReport, markdownSummary } from "../reports.mts";
import type { NormalizedCollection } from "../types.mts";

test("owner summary never presents a failed provider as zero performance", () => {
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
  const collection: NormalizedCollection = {
    schemaVersion: 1,
    runId: "test-run",
    generatedAt: "2026-07-08T00:00:00.000Z",
    requestedRanges: ranges,
    searchPerformance: [],
    traffic: [],
    goals: [],
    technical: [],
    sourceMetadata: [
      {
        provider: "yandex_webmaster",
        status: "failed",
        startedAt: "2026-07-08T00:00:00.000Z",
        completedAt: "2026-07-08T00:00:01.000Z",
        requestedRanges: ranges,
        requestCount: 0,
        recordCount: 0,
        warnings: [],
        limitations: [],
        error: "read access denied",
      },
    ],
    configuredCommercialQueries: [],
    notes: [],
  };

  const markdown = markdownSummary(collection, buildReport(collection));
  assert.match(markdown, /Данные Яндекс Вебмастера недоступны/);
  assert.doesNotMatch(markdown, /В Вебмастере: 0 показов/);
});

test("owner summary suppresses changes for incomplete observed date coverage", () => {
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
  const daily = (
    period: "current" | "previous",
    date: string,
  ): NormalizedCollection["searchPerformance"][number] => ({
    provider: "google_search_console",
    searchEngine: "google",
    view: "daily",
    period,
    date,
    dateRange: ranges[period],
    clicks: 10,
    impressions: 100,
    ctr: 0.1,
    averagePosition: 5,
    sourceMetadata: {
      aggregation: "auto",
      topRowsOnly: false,
    },
  });
  const collection: NormalizedCollection = {
    schemaVersion: 1,
    runId: "test-run",
    generatedAt: "2026-07-08T00:00:00.000Z",
    requestedRanges: ranges,
    searchPerformance: [
      daily("current", "2026-07-06"),
      daily("previous", "2026-06-30"),
    ],
    traffic: [],
    goals: [],
    technical: [],
    sourceMetadata: [
      {
        provider: "google_search_console",
        status: "success",
        startedAt: "2026-07-08T00:00:00.000Z",
        completedAt: "2026-07-08T00:00:01.000Z",
        requestedRanges: ranges,
        actualRanges: {
          current: { startDate: "2026-07-01", endDate: "2026-07-06" },
          previous: { startDate: "2026-06-24", endDate: "2026-06-30" },
        },
        requestCount: 2,
        recordCount: 2,
        warnings: ["Finalized daily rows do not cover the requested end date."],
        limitations: [],
      },
    ],
    configuredCommercialQueries: [],
    notes: [],
  };

  const markdown = markdownSummary(collection, buildReport(collection));
  assert.match(markdown, /источник вернул не весь запрошенный диапазон/);
  assert.doesNotMatch(markdown, /изменение к прошлому периоду/);
});
