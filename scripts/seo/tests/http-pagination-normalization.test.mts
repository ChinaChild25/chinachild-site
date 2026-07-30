import assert from "node:assert/strict";
import test from "node:test";
import { YandexMetrikaClient } from "../clients/yandex.mts";
import {
  mergeConfiguredKeyEvents,
  normalizeGaLeadCandidateForTest,
  validateGaZeroDimensionResponseForTest,
} from "../collectors/google-analytics.mts";
import { validateSearchConsoleResponseForTest } from "../collectors/google-search-console.mts";
import { normalizeEmptyMetrikaGoalTotalsForTest } from "../collectors/yandex-metrika.mts";
import { splitYandexQueryText } from "../collectors/yandex-webmaster.mts";
import {
  ProviderHttpError,
  redactSecrets,
  requestJson,
  type FetchLike,
} from "../http.mts";

test("response normalization validates numeric API values", () => {
  assert.equal(
    validateSearchConsoleResponseForTest({
      rows: [{ keys: ["query"], clicks: 2.5 }],
    }),
    2.5,
  );
  assert.throws(
    () =>
      validateSearchConsoleResponseForTest({
        rows: [{ keys: ["query"], clicks: "not-a-number" }],
      }),
    /finite number/,
  );
});

test("GA4 totals accept omitted dimensionValues for zero dimensions", () => {
  assert.equal(
    validateGaZeroDimensionResponseForTest({
      rows: [{ metricValues: [{ value: "12" }] }],
    }),
    12,
  );
});

test("Yandex query normalization separates query text from target artifacts", () => {
  assert.deepEqual(
    splitYandexQueryText(
      "школа китайского онлайн@dzen.ru/a/yovleb1leybuaib2",
    ),
    {
      query: "школа китайского онлайн",
      page: "https://dzen.ru/a/yovleb1leybuaib2",
      targetHost: "dzen.ru",
    },
  );
  assert.deepEqual(splitYandexQueryText("репетитор китайского онлайн"), {
    query: "репетитор китайского онлайн",
  });
});

test("configured zero-count goals and key events remain in normalized output", () => {
  assert.deepEqual(mergeConfiguredKeyEvents(["purchase"], []), [
    { name: "purchase", conversions: 0 },
  ]);
  const metrika = normalizeEmptyMetrikaGoalTotalsForTest();
  assert.equal(metrika.length, 1);
  assert.equal(metrika[0].goalName, "Configured goal");
  assert.equal(metrika[0].period, "previous");
  assert.equal(metrika[0].conversions, 0);
});

test("GA4 generate_lead is retained as an event-count lead candidate even when it is not a key event", () => {
  const [candidate] = normalizeGaLeadCandidateForTest({
    rows: [
      {
        dimensionValues: [{ value: "generate_lead" }],
        metricValues: [{ value: "3" }],
      },
    ],
  });
  assert.equal(candidate.goalName, "generate_lead");
  assert.equal(candidate.conversions, 3);
  assert.equal(candidate.sourceMetadata.metric, "eventCount");
  assert.equal(candidate.sourceMetadata.configuredAsKeyEvent, false);
  assert.equal(candidate.sourceMetadata.repositoryDocumentedCandidate, true);
});

test("Metrica counter pagination follows offset and total rows", async () => {
  const offsets: string[] = [];
  const firstPage = Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    name: `Counter ${index + 1}`,
    site: `site-${index + 1}.example`,
    mirrors: [],
  }));
  const mockFetch: FetchLike = async (input) => {
    const url = new URL(String(input));
    offsets.push(url.searchParams.get("offset") ?? "");
    const body =
      url.searchParams.get("offset") === "1"
        ? { rows: 1001, counters: firstPage }
        : {
            rows: 1001,
            counters: [
              {
                id: 1001,
                name: "Last",
                site: "chinachild.ru",
                mirrors: [],
              },
            ],
          };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const client = new YandexMetrikaClient(
    { oauthToken: "test-token" },
    mockFetch,
  );
  const result = await client.listCounters();
  assert.equal(result.counters.length, 1001);
  assert.deepEqual(offsets, ["1", "1001"]);
});

test("provider client retries rate limits within a bound", async () => {
  let calls = 0;
  const mockFetch: FetchLike = async () => {
    calls += 1;
    if (calls < 3) {
      return new Response(JSON.stringify({ message: "rate limited" }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "0" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const result = await requestJson(
    "https://api.example.test/read",
    { method: "GET" },
    { provider: "mock", maxAttempts: 4 },
    { fetch: mockFetch, sleep: async () => undefined },
  );
  assert.equal(result.ok, true);
  assert.equal(calls, 3);
});

test("provider client does not retry permanent authorization errors", async () => {
  let calls = 0;
  const mockFetch: FetchLike = async () => {
    calls += 1;
    return new Response(JSON.stringify({ message: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  };
  await assert.rejects(
    requestJson(
      "https://api.example.test/read",
      { method: "GET" },
      { provider: "mock", maxAttempts: 4 },
      { fetch: mockFetch, sleep: async () => undefined },
    ),
    ProviderHttpError,
  );
  assert.equal(calls, 1);
});

test("secret redaction covers known values, headers, JSON, and URL parameters", () => {
  const secret = "sensitive-token-value";
  const output = redactSecrets(
    `Authorization: OAuth ${secret} {"refresh_token":"${secret}"} ` +
      `https://example.test/?access_token=${secret}`,
    [secret],
  );
  assert.equal(output.includes(secret), false);
  assert.match(output, /\[REDACTED\]/);
});
