import assert from "node:assert/strict";
import test from "node:test";
import {
  AmbiguousResourceError,
  discoverMetrikaCounter,
  discoverWebmasterHost,
} from "../discovery.mts";
import {
  classifySearchIntent,
  ensureCompatibleSearchRecords,
} from "../reports.mts";
import type { SearchPerformanceRecord } from "../types.mts";

const cluster = [
  "онлайн-школа китайского языка",
  "курсы китайского языка онлайн",
  "обучение китайскому языку онлайн",
  "репетитор китайского онлайн",
  "преподаватель китайского онлайн",
];

test("counter discovery selects one domain match and never guesses among multiples", () => {
  const counters = [
    {
      id: 1,
      name: "Other",
      site: "example.com",
      mirrors: [],
    },
    {
      id: 2,
      name: "ChinaChild",
      site: "https://www.chinachild.ru/",
      mirrors: [],
    },
  ];
  assert.equal(
    discoverMetrikaCounter(counters, undefined, "chinachild.ru").id,
    2,
  );
  assert.throws(
    () =>
      discoverMetrikaCounter(
        [
          ...counters,
          {
            id: 3,
            name: "Mirror",
            site: "chinachild.ru",
            mirrors: [],
          },
        ],
        undefined,
        "chinachild.ru",
      ),
    AmbiguousResourceError,
  );
});

test("host discovery collapses verified mirrors that share one main host", () => {
  const selected = discoverWebmasterHost(
    [
      {
        hostId: "http:chinachild.ru:80",
        asciiHostUrl: "http://chinachild.ru/",
        verified: true,
        mainMirror: {
          hostId: "https:chinachild.ru:443",
          asciiHostUrl: "https://chinachild.ru/",
          verified: true,
        },
      },
      {
        hostId: "https:chinachild.ru:443",
        asciiHostUrl: "https://chinachild.ru/",
        verified: true,
        mainMirror: {
          hostId: "https:chinachild.ru:443",
          asciiHostUrl: "https://chinachild.ru/",
          verified: true,
        },
      },
    ],
    undefined,
    "chinachild.ru",
  );
  assert.equal(selected.hostId, "https:chinachild.ru:443");
});

test("commercial classifier supports word-order and Russian grammatical variants", () => {
  assert.deepEqual(
    classifySearchIntent(
      "Китайскому языку обучение онлайн",
      cluster,
    ).intent,
    "primary_commercial",
  );
  assert.deepEqual(
    classifySearchIntent(
      "Онлайн курсы китайского языка",
      cluster,
    ).intent,
    "primary_commercial",
  );
  assert.equal(
    classifySearchIntent("как учить китайские иероглифы", cluster).intent,
    "informational",
  );
  assert.equal(
    classifySearchIntent("chinachild", cluster).intent,
    "competitor_or_brand",
  );
});

test("commercial taxonomy keeps primary intent separate from adjacent, brands, geo, self-study, and artifacts", () => {
  assert.equal(
    classifySearchIntent("репетитор китайского онлайн", cluster).intent,
    "primary_commercial",
  );
  assert.equal(
    classifySearchIntent("курсы китайского языка для взрослых", cluster)
      .intent,
    "adjacent_commercial",
  );
  assert.equal(
    classifySearchIntent("курсы китайского языка онлайн для взрослых", cluster)
      .intent,
    "adjacent_commercial",
  );
  assert.equal(
    classifySearchIntent("школа конфуция китайский", cluster).intent,
    "competitor_or_brand",
  );
  assert.equal(
    classifySearchIntent("курсы китайского языка в Москве", cluster).intent,
    "offline_or_geo",
  );
  assert.equal(
    classifySearchIntent("китайский самостоятельно дома", cluster).intent,
    "informational",
  );
  assert.equal(
    classifySearchIntent(
      "школа китайского онлайн",
      cluster,
      "https://dzen.ru/a/example",
    ).intent,
    "other",
  );
});

function record(
  provider: SearchPerformanceRecord["provider"],
): SearchPerformanceRecord {
  return {
    provider,
    searchEngine:
      provider === "yandex_webmaster" ? "yandex" : "google",
    view: "query",
    period: "current",
    dateRange: { startDate: "2026-01-01", endDate: "2026-01-31" },
    clicks: 1,
    impressions: 10,
    ctr: 0.1,
    averagePosition: 5,
    sourceMetadata: {
      aggregation: "query",
      topRowsOnly: true,
    },
  };
}

test("aggregation guard rejects incompatible provider metrics", () => {
  assert.throws(
    () =>
      ensureCompatibleSearchRecords([
        record("yandex_webmaster"),
        record("google_search_console"),
      ]),
    /different providers/,
  );
  assert.doesNotThrow(() =>
    ensureCompatibleSearchRecords([
      record("google_search_console"),
      record("google_search_console"),
    ]),
  );
});
