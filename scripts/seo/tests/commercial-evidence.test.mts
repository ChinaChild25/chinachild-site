import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildCommercialQueryRowsForTest } from "../commercial-evidence.mts";
import { buildInternalLinkInventory } from "../internal-links.mts";
import type { NormalizedCollection } from "../types.mts";

function emptyCollection(): NormalizedCollection {
  return {
    schemaVersion: 1,
    runId: "test-run",
    generatedAt: "2026-07-30T00:00:00.000Z",
    requestedRanges: {
      current: {
        startDate: "2026-07-01",
        endDate: "2026-07-30",
        days: 30,
        includesToday: true,
      },
      previous: {
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        days: 30,
        includesToday: false,
      },
    },
    searchPerformance: [],
    traffic: [],
    goals: [],
    technical: [],
    sourceMetadata: [],
    configuredCommercialQueries: [],
    notes: [],
  };
}

test("commercial matrix never combines metrics from different providers", () => {
  const collection = emptyCollection();
  collection.searchPerformance.push(
    {
      provider: "google_search_console",
      searchEngine: "google",
      view: "detail",
      period: "current",
      dateRange: {
        startDate: "2026-07-01",
        endDate: "2026-07-30",
      },
      query: "курсы китайского языка онлайн",
      page: "https://chinachild.ru/courses/online-chinese",
      clicks: 2,
      impressions: 10,
      ctr: 0.2,
      averagePosition: 8,
      sourceMetadata: { aggregation: "byPage", topRowsOnly: true },
    },
    {
      provider: "yandex_webmaster",
      searchEngine: "yandex",
      view: "popular_query",
      period: "current",
      dateRange: {
        startDate: "2026-07-01",
        endDate: "2026-07-30",
      },
      query: "курсы китайского языка онлайн",
      device: "all",
      clicks: 5,
      impressions: 20,
      ctr: 0.25,
      averagePosition: 7,
      sourceMetadata: {
        aggregation: "popular_search_queries",
        topRowsOnly: true,
      },
    },
  );
  const rows = buildCommercialQueryRowsForTest(collection).filter(
    (row) => row.cluster === "online Chinese courses",
  );
  assert.equal(rows.length, 2);
  assert.deepEqual(
    rows.map((row) => [row.provider, row.impressions]).sort(),
    [
      ["google_search_console", 10],
      ["yandex_webmaster_popular", 20],
    ],
  );
  assert.equal(
    rows.find((row) => row.provider === "yandex_webmaster_popular")
      ?.landingPageVerified,
    false,
  );
});

test("rendered-link inventory separates global, contextual, and breadcrumb links", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "chinachild-links-"));
  const nested = path.join(root, "blog");
  await mkdir(nested);
  await writeFile(
    path.join(nested, "example.html"),
    `<html><body>
      <header><a href="/courses">Курсы</a></header>
      <nav aria-label="Breadcrumb"><a href="/blog">Блог</a></nav>
      <main><a href="/courses/online-chinese">Онлайн-курс</a></main>
      <footer><a href="/price">Цены</a></footer>
    </body></html>`,
  );
  const result = await buildInternalLinkInventory({
    buildAppDirectory: root,
    collection: emptyCollection(),
  });
  assert.deepEqual(
    result.records.map((record) => record.classification).sort(),
    ["breadcrumb", "contextual", "global", "global"],
  );
  const online = result.destinationSummary.find((row) =>
    row.destinationUrl.endsWith("/courses/online-chinese"),
  );
  assert.equal(online?.contextualInboundLinks, 1);
});
