import assert from "node:assert/strict";
import test from "node:test";
import { validateSeoConfig, type SeoConfig } from "../config.mts";
import {
  buildComparisonRange,
  countInclusiveDays,
  deriveEffectiveComparisonRange,
} from "../date-range.mts";

function baseConfig(): SeoConfig {
  return {
    domain: "chinachild.ru",
    outputDirectory: "/tmp/seo-data-test",
    google: {
      searchConsoleProperty: "sc-domain:chinachild.ru",
      ga4PropertyId: "338734549",
      adcPath: "/definitely/missing/application_default_credentials.json",
    },
    yandex: {},
    commercialQueries: ["курсы китайского языка онлайн"],
  };
}

test("environment validation reports missing ADC and Yandex without exposing values", () => {
  const config = baseConfig();
  const issues = validateSeoConfig(config);
  assert.deepEqual(
    issues.map((issue) => issue.variable).sort(),
    ["Google ADC", "YANDEX_OAUTH_TOKEN"],
  );
});

test("environment validation rejects malformed provider identifiers", () => {
  const config = baseConfig();
  config.google.searchConsoleProperty = "chinachild.ru";
  config.google.ga4PropertyId = "property-123";
  config.yandex.metrikaCounterId = "counter-1";
  const issues = validateSeoConfig(config);
  assert.ok(
    issues.some(
      (issue) => issue.variable === "GOOGLE_SEARCH_CONSOLE_PROPERTY",
    ),
  );
  assert.ok(issues.some((issue) => issue.variable === "GA4_PROPERTY_ID"));
  assert.ok(
    issues.some((issue) => issue.variable === "YANDEX_METRIKA_COUNTER_ID"),
  );
});

test("default range ends yesterday and previous range has equal inclusive days", () => {
  const range = buildComparisonRange(
    { days: 90 },
    new Date("2026-07-30T12:00:00.000Z"),
  );
  assert.equal(range.current.endDate, "2026-07-29");
  assert.equal(range.current.days, 90);
  assert.equal(range.previous.days, 90);
  assert.equal(
    countInclusiveDays(range.previous.startDate, range.previous.endDate),
    90,
  );
  assert.equal(range.previous.endDate, "2026-04-30");
});

test("explicit date range rejects partial and future input", () => {
  assert.throws(
    () => buildComparisonRange({ startDate: "2026-01-01" }),
    /provided together/,
  );
  assert.throws(
    () =>
      buildComparisonRange(
        { startDate: "2026-07-01", endDate: "2026-08-01" },
        new Date("2026-07-30T12:00:00.000Z"),
      ),
    /future/,
  );
});

test("effective range uses the latest complete date and derives an equal previous period", () => {
  const requested = buildComparisonRange(
    { days: 7 },
    new Date("2026-07-30T12:00:00.000Z"),
  );
  const effective = deriveEffectiveComparisonRange(requested, "2026-07-28");
  assert.deepEqual(
    {
      current: effective.current,
      previous: effective.previous,
    },
    {
      current: {
        startDate: "2026-07-23",
        endDate: "2026-07-28",
        days: 6,
        includesToday: false,
      },
      previous: {
        startDate: "2026-07-17",
        endDate: "2026-07-22",
        days: 6,
        includesToday: false,
      },
    },
  );
});
