import { GoogleReadOnlyClient } from "./clients/google.mts";
import {
  YandexMetrikaClient,
  YandexWebmasterClient,
} from "./clients/yandex.mts";
import type { SeoConfig } from "./config.mts";
import { validateSeoConfig } from "./config.mts";
import { buildComparisonRange } from "./date-range.mts";
import type { CheckItem } from "./types.mts";
import { asNumber } from "./validation.mts";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runSeoCheck(config: SeoConfig): Promise<CheckItem[]> {
  const items: CheckItem[] = [];
  const issues = validateSeoConfig(config);

  const googleClient = new GoogleReadOnlyClient(config.google);
  const googleIssues = issues.filter((issue) => issue.provider === "google");
  if (googleIssues.some((issue) => issue.variable === "Google ADC")) {
    items.push({
      provider: "google_search_console",
      status: "missing",
      message: googleIssues
        .filter((issue) => issue.variable === "Google ADC")
        .map((issue) => issue.message)
        .join("; "),
    });
  } else {
    try {
      const adc = await googleClient.inspectAdc();
      if (adc.type !== "authorized_user") {
        throw new Error(
          `ADC type is ${adc.type}; expected local authorized_user credentials`,
        );
      }
      items.push({
        provider: "google_search_console",
        status: "ok",
        message: "Google Application Default Credentials are available",
        details: [
          `ADC type: ${adc.type}`,
          `Quota project configured: ${adc.quotaProjectConfigured ? "yes" : "no"}`,
          "Credential values were not read into output",
        ],
      });
    } catch (error) {
      items.push({
        provider: "google_search_console",
        status: "error",
        message: `Google ADC check failed: ${errorMessage(error)}`,
      });
    }
  }

  if (!config.google.searchConsoleProperty) {
    items.push({
      provider: "google_search_console",
      status: "missing",
      message: "GOOGLE_SEARCH_CONSOLE_PROPERTY is missing",
    });
  } else if (
    !items.some(
      (item) =>
        item.provider === "google_search_console" &&
        item.status !== "ok" &&
        item.message.includes("ADC"),
    )
  ) {
    try {
      const property = await googleClient.getSearchConsoleProperty(
        config.google.searchConsoleProperty,
      );
      items.push({
        provider: "google_search_console",
        status: "ok",
        message: `Search Console property is accessible: ${config.google.searchConsoleProperty}`,
        details: [
          `Permission: ${typeof property.permissionLevel === "string" ? property.permissionLevel : "reported without permissionLevel"}`,
        ],
      });
    } catch (error) {
      items.push({
        provider: "google_search_console",
        status: "error",
        message: `Search Console access failed: ${errorMessage(error)}`,
      });
    }
  }

  if (!config.google.ga4PropertyId) {
    items.push({
      provider: "google_analytics",
      status: "missing",
      message: "GA4_PROPERTY_ID is missing",
    });
  } else {
    try {
      const metadata = await googleClient.getGaMetadata(
        config.google.ga4PropertyId,
      );
      await googleClient.runGaReport(config.google.ga4PropertyId, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
        metrics: [{ name: "activeUsers" }],
        limit: "1",
        returnPropertyQuota: true,
      });
      items.push({
        provider: "google_analytics",
        status: "ok",
        message: `GA4 property is accessible: ${config.google.ga4PropertyId}`,
        details: [
          `Metadata dimensions: ${Array.isArray(metadata.dimensions) ? metadata.dimensions.length : "unknown"}`,
          `Metadata metrics: ${Array.isArray(metadata.metrics) ? metadata.metrics.length : "unknown"}`,
        ],
      });
    } catch (error) {
      items.push({
        provider: "google_analytics",
        status: "error",
        message: `GA4 access failed: ${errorMessage(error)}`,
      });
    }
  }

  if (!config.yandex.oauthToken) {
    items.push(
      {
        provider: "yandex_metrika",
        status: "missing",
        message:
          "YANDEX_OAUTH_TOKEN is missing; create a local token with metrika:read only",
      },
      {
        provider: "yandex_webmaster",
        status: "missing",
        message:
          "YANDEX_OAUTH_TOKEN is missing; grant Yandex Webmaster read access only",
      },
    );
    return items;
  }

  try {
    const metrika = new YandexMetrikaClient(config.yandex);
    const list = await metrika.listCounters();
    const selected = metrika.discoverCounter(
      list.counters,
      config.yandex.metrikaCounterId,
      config.domain,
    );
    const goals = await metrika.getGoals(selected.id);
    items.push({
      provider: "yandex_metrika",
      status: "ok",
      message: `Yandex Metrica token is valid; selected counter ${selected.id}`,
      details: [
        ...list.counters.map(
          (counter) =>
            `${counter.id}: ${counter.name} — ${counter.site} (${counter.permission ?? "permission not reported"})`,
        ),
        `Selected: ${selected.id} (${selected.site})`,
        `Accessible goals: ${Array.isArray(goals.goals) ? goals.goals.length : 0}`,
      ],
    });
  } catch (error) {
    const candidateDetails =
      error &&
      typeof error === "object" &&
      "candidates" in error &&
      Array.isArray(error.candidates)
        ? error.candidates.filter(
            (value): value is string => typeof value === "string",
          )
        : undefined;
    items.push({
      provider: "yandex_metrika",
      status: "error",
      message: `Yandex Metrica check failed: ${errorMessage(error)}`,
      details: candidateDetails,
    });
  }

  let webmasterStage = "token and user discovery";
  let webmasterDetails: string[] | undefined;
  try {
    const webmaster = new YandexWebmasterClient(config.yandex);
    const user = await webmaster.getUser();
    const userId = asNumber(user.user_id, "Webmaster user.user_id");
    const list = await webmaster.listHosts(userId);
    webmasterDetails = list.hosts.map(
      (host) =>
        `${host.hostId}: ${host.asciiHostUrl} (${host.verified ? "verified" : "not verified"})`,
    );
    const selected = webmaster.discoverHost(
      list.hosts,
      config.yandex.webmasterHostId,
      config.domain,
    );
    const selectedHostId = selected.mainMirror?.hostId ?? selected.hostId;
    webmasterDetails.push(`Selected: ${selectedHostId}`);
    webmasterStage = "core read access";
    const checkRange = buildComparisonRange({ days: 7 }).current;
    await webmaster.hostGet(userId, selectedHostId, "/summary");
    await webmaster.hostGet(
      userId,
      selectedHostId,
      "/search-queries/all/history",
      {
        query_indicator: ["TOTAL_SHOWS", "TOTAL_CLICKS"],
        device_type_indicator: "ALL",
        date_from: checkRange.startDate,
        date_to: checkRange.endDate,
      },
    );
    items.push({
      provider: "yandex_webmaster",
      status: "ok",
      message: `Yandex Webmaster core reads are accessible; user ${userId}`,
      details: [
        ...webmasterDetails,
        "Site summary and search-query history read checks succeeded",
      ],
    });
  } catch (error) {
    const candidateDetails =
      error &&
      typeof error === "object" &&
      "candidates" in error &&
      Array.isArray(error.candidates)
        ? error.candidates.filter(
            (value): value is string => typeof value === "string",
          )
        : undefined;
    items.push({
      provider: "yandex_webmaster",
      status: "error",
      message: `Yandex Webmaster ${webmasterStage} failed: ${errorMessage(error)}`,
      details: [
        ...(webmasterDetails ?? []),
        ...(candidateDetails ?? []),
        ...(webmasterStage === "core read access"
          ? [
              "The token can discover the user/hosts, but its OAuth application does not authorize every required read endpoint.",
            ]
          : []),
      ],
    });
  }
  return items;
}
