import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { asArray, asString } from "./validation.mts";

export type SeoConfig = {
  domain: string;
  outputDirectory: string;
  google: {
    searchConsoleProperty?: string;
    ga4PropertyId?: string;
    adcPath: string;
  };
  yandex: {
    oauthToken?: string;
    metrikaCounterId?: string;
    webmasterHostId?: string;
  };
  commercialQueries: string[];
};

export type ConfigIssue = {
  variable: string;
  provider: "google" | "yandex";
  message: string;
};

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readCommercialQueries(cwd: string): string[] {
  const filename = path.join(
    cwd,
    "scripts/seo/config/commercial-query-cluster.json",
  );
  const parsed: unknown = JSON.parse(readFileSync(filename, "utf8"));
  return asArray(parsed, "commercial-query-cluster.json").map((value, index) =>
    asString(value, `commercial-query-cluster.json[${index}]`),
  );
}

export function resolveAdcPath(
  env: NodeJS.ProcessEnv,
  homeDirectory = os.homedir(),
): string {
  return (
    optional(env.GOOGLE_APPLICATION_CREDENTIALS) ??
    path.join(homeDirectory, ".config/gcloud/application_default_credentials.json")
  );
}

export function loadSeoConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): SeoConfig {
  return {
    domain: "chinachild.ru",
    outputDirectory: path.join(cwd, "seo-data"),
    google: {
      searchConsoleProperty: optional(env.GOOGLE_SEARCH_CONSOLE_PROPERTY),
      ga4PropertyId: optional(env.GA4_PROPERTY_ID),
      adcPath: resolveAdcPath(env),
    },
    yandex: {
      oauthToken: optional(env.YANDEX_OAUTH_TOKEN),
      metrikaCounterId: optional(env.YANDEX_METRIKA_COUNTER_ID),
      webmasterHostId: optional(env.YANDEX_WEBMASTER_HOST_ID),
    },
    commercialQueries: readCommercialQueries(cwd),
  };
}

export function validateSeoConfig(config: SeoConfig): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!config.google.searchConsoleProperty) {
    issues.push({
      variable: "GOOGLE_SEARCH_CONSOLE_PROPERTY",
      provider: "google",
      message: "Search Console property is missing",
    });
  } else if (
    !config.google.searchConsoleProperty.startsWith("sc-domain:") &&
    !/^https?:\/\//.test(config.google.searchConsoleProperty)
  ) {
    issues.push({
      variable: "GOOGLE_SEARCH_CONSOLE_PROPERTY",
      provider: "google",
      message: "must be sc-domain:example.com or an exact URL-prefix property",
    });
  }

  if (!config.google.ga4PropertyId) {
    issues.push({
      variable: "GA4_PROPERTY_ID",
      provider: "google",
      message: "GA4 property ID is missing",
    });
  } else if (!/^\d+$/.test(config.google.ga4PropertyId)) {
    issues.push({
      variable: "GA4_PROPERTY_ID",
      provider: "google",
      message: "must contain digits only",
    });
  }

  if (!existsSync(config.google.adcPath)) {
    issues.push({
      variable: "Google ADC",
      provider: "google",
      message: `credential file was not found at ${config.google.adcPath}`,
    });
  }

  if (!config.yandex.oauthToken) {
    issues.push({
      variable: "YANDEX_OAUTH_TOKEN",
      provider: "yandex",
      message: "read-only Yandex OAuth token is missing",
    });
  }
  if (
    config.yandex.metrikaCounterId &&
    !/^\d+$/.test(config.yandex.metrikaCounterId)
  ) {
    issues.push({
      variable: "YANDEX_METRIKA_COUNTER_ID",
      provider: "yandex",
      message: "must contain digits only",
    });
  }
  return issues;
}
