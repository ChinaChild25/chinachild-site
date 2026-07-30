import { collectGoogleAnalytics } from "./collectors/google-analytics.mts";
import { collectGoogleSearchConsole } from "./collectors/google-search-console.mts";
import { collectYandexMetrika } from "./collectors/yandex-metrika.mts";
import { collectYandexWebmaster } from "./collectors/yandex-webmaster.mts";
import { GoogleReadOnlyClient } from "./clients/google.mts";
import {
  YandexMetrikaClient,
  YandexWebmasterClient,
} from "./clients/yandex.mts";
import type { SeoConfig } from "./config.mts";
import { redactSecrets } from "./http.mts";
import { createRunId, storeCollection } from "./storage.mts";
import type {
  ComparisonRange,
  NormalizedCollection,
  Provider,
  SourceResult,
} from "./types.mts";

type Collector = () => Promise<SourceResult>;

function failedSource(
  provider: Provider,
  ranges: ComparisonRange,
  startedAt: string,
  error: unknown,
  secrets: readonly string[],
  requestCount: number,
  status: "failed" | "skipped" = "failed",
): SourceResult {
  const message = redactSecrets(
    error instanceof Error ? error.message : String(error),
    secrets,
  );
  return {
    provider,
    raw: {},
    metadata: {
      provider,
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      requestedRanges: ranges,
      requestCount,
      recordCount: 0,
      warnings: [],
      limitations: [],
      error: message,
    },
  };
}

export async function runCollection(
  config: SeoConfig,
  ranges: ComparisonRange,
): Promise<{
  collection: NormalizedCollection;
  sources: SourceResult[];
  stored: Awaited<ReturnType<typeof storeCollection>>;
}> {
  const sources: SourceResult[] = [];
  const secrets = [config.yandex.oauthToken ?? ""];
  const webmasterClient = config.yandex.oauthToken
    ? new YandexWebmasterClient(config.yandex)
    : undefined;
  const metrikaClient = config.yandex.oauthToken
    ? new YandexMetrikaClient(config.yandex)
    : undefined;
  const searchConsoleClient = new GoogleReadOnlyClient(config.google);
  const analyticsClient = new GoogleReadOnlyClient(config.google);
  const jobs: Array<{
    provider: Provider;
    enabled: boolean;
    missingMessage: string;
    collect: Collector;
    requestCount: () => number;
  }> = [
    {
      provider: "yandex_webmaster",
      enabled: Boolean(config.yandex.oauthToken),
      missingMessage: "YANDEX_OAUTH_TOKEN is missing",
      collect: () => collectYandexWebmaster(config, ranges, webmasterClient!),
      requestCount: () => webmasterClient?.requestCount ?? 0,
    },
    {
      provider: "yandex_metrika",
      enabled: Boolean(config.yandex.oauthToken),
      missingMessage: "YANDEX_OAUTH_TOKEN is missing",
      collect: () => collectYandexMetrika(config, ranges, metrikaClient!),
      requestCount: () => metrikaClient?.requestCount ?? 0,
    },
    {
      provider: "google_search_console",
      enabled: Boolean(config.google.searchConsoleProperty),
      missingMessage: "GOOGLE_SEARCH_CONSOLE_PROPERTY is missing",
      collect: () =>
        collectGoogleSearchConsole(config, ranges, searchConsoleClient),
      requestCount: () => searchConsoleClient.requestCount,
    },
    {
      provider: "google_analytics",
      enabled: Boolean(config.google.ga4PropertyId),
      missingMessage: "GA4_PROPERTY_ID is missing",
      collect: () =>
        collectGoogleAnalytics(config, ranges, analyticsClient),
      requestCount: () => analyticsClient.requestCount,
    },
  ];

  for (const job of jobs) {
    const startedAt = new Date().toISOString();
    if (!job.enabled) {
      sources.push(
        failedSource(
          job.provider,
          ranges,
          startedAt,
          job.missingMessage,
          secrets,
          0,
          "skipped",
        ),
      );
      continue;
    }
    try {
      sources.push(await job.collect());
    } catch (error) {
      sources.push(
        failedSource(
          job.provider,
          ranges,
          startedAt,
          error,
          secrets,
          job.requestCount(),
        ),
      );
    }
  }

  const runId = createRunId();
  const collection: NormalizedCollection = {
    schemaVersion: 1,
    runId,
    generatedAt: new Date().toISOString(),
    requestedRanges: ranges,
    searchPerformance: sources.flatMap(
      (source) => source.searchPerformance ?? [],
    ),
    traffic: sources.flatMap((source) => source.traffic ?? []),
    goals: sources.flatMap((source) => source.goals ?? []),
    technical: sources.flatMap((source) => source.technical ?? []),
    sourceMetadata: sources.map((source) => source.metadata),
    configuredCommercialQueries: config.commercialQueries,
    notes: [
      "Yandex is listed first in reports because it is the business-priority search engine.",
      "Provider metrics retain their original definitions and are never summed across providers.",
      "The collector is local and read-only; no provider write endpoint is implemented.",
    ],
  };
  const stored = await storeCollection(
    config.outputDirectory,
    collection,
    sources,
  );
  return { collection, sources, stored };
}
