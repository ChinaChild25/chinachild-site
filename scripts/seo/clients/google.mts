import { readFile } from "node:fs/promises";
import type { SeoConfig } from "../config.mts";
import { requestJson, type FetchLike } from "../http.mts";
import {
  asOptionalString,
  asRecord,
  asString,
  requireKeys,
} from "../validation.mts";

type AuthorizedUserAdc = {
  type: "authorized_user";
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  quotaProjectId?: string;
};

type AccessToken = {
  value: string;
  expiresAt: number;
};

export type GaReportRequest = {
  dateRanges: Array<{ startDate: string; endDate: string; name?: string }>;
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: Record<string, unknown>;
  metricFilter?: Record<string, unknown>;
  orderBys?: Array<Record<string, unknown>>;
  limit?: string;
  offset?: string;
  keepEmptyRows?: boolean;
  returnPropertyQuota?: boolean;
};

export class GoogleReadOnlyClient {
  readonly config: SeoConfig["google"];
  readonly fetchImpl?: FetchLike;
  requestCount = 0;
  private adc?: AuthorizedUserAdc;
  private token?: AccessToken;

  constructor(config: SeoConfig["google"], fetchImpl?: FetchLike) {
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  async inspectAdc(): Promise<{
    path: string;
    type: string;
    quotaProjectConfigured: boolean;
  }> {
    const raw: unknown = JSON.parse(await readFile(this.config.adcPath, "utf8"));
    const record = asRecord(raw, "Google ADC");
    const type = asString(record.type, "Google ADC.type");
    return {
      path: this.config.adcPath,
      type,
      quotaProjectConfigured: Boolean(
        asOptionalString(record.quota_project_id, "Google ADC.quota_project_id"),
      ),
    };
  }

  private async loadAdc(): Promise<AuthorizedUserAdc> {
    if (this.adc) return this.adc;
    const raw: unknown = JSON.parse(await readFile(this.config.adcPath, "utf8"));
    const record = asRecord(raw, "Google ADC");
    requireKeys(
      record,
      ["type", "client_id", "client_secret", "refresh_token"],
      "Google ADC",
    );
    const type = asString(record.type, "Google ADC.type");
    if (type !== "authorized_user") {
      throw new Error(
        `Google ADC type "${type}" is unsupported by this local collector. ` +
          "Use user ADC from gcloud auth application-default login; do not create a service-account key.",
      );
    }
    this.adc = {
      type,
      clientId: asString(record.client_id, "Google ADC.client_id"),
      clientSecret: asString(record.client_secret, "Google ADC.client_secret"),
      refreshToken: asString(record.refresh_token, "Google ADC.refresh_token"),
      quotaProjectId: asOptionalString(
        record.quota_project_id,
        "Google ADC.quota_project_id",
      ),
    };
    return this.adc;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt - Date.now() > 60_000) {
      return this.token.value;
    }
    const adc = await this.loadAdc();
    const body = new URLSearchParams({
      client_id: adc.clientId,
      client_secret: adc.clientSecret,
      refresh_token: adc.refreshToken,
      grant_type: "refresh_token",
    });
    this.requestCount += 1;
    const response = await requestJson(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      {
        provider: "Google OAuth",
        secrets: [adc.clientSecret, adc.refreshToken],
      },
      { fetch: this.fetchImpl },
    );
    const value = asString(response.access_token, "Google OAuth.access_token");
    const expiresIn =
      typeof response.expires_in === "number" ? response.expires_in : 3600;
    this.token = {
      value,
      expiresAt: Date.now() + Math.max(expiresIn, 60) * 1000,
    };
    return value;
  }

  private async headers(): Promise<Record<string, string>> {
    const token = await this.accessToken();
    const adc = await this.loadAdc();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(adc.quotaProjectId
        ? { "X-Goog-User-Project": adc.quotaProjectId }
        : {}),
    };
  }

  async get(url: string): Promise<Record<string, unknown>> {
    const headers = await this.headers();
    this.requestCount += 1;
    return requestJson(
      url,
      { method: "GET", headers },
      {
        provider: "Google",
        secrets: [this.token?.value ?? ""],
      },
      { fetch: this.fetchImpl },
    );
  }

  async post(
    url: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const headers = await this.headers();
    this.requestCount += 1;
    return requestJson(
      url,
      { method: "POST", headers, body: JSON.stringify(body) },
      {
        provider: "Google",
        secrets: [this.token?.value ?? ""],
      },
      { fetch: this.fetchImpl },
    );
  }

  async getSearchConsoleProperty(property: string): Promise<Record<string, unknown>> {
    return this.get(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}`,
    );
  }

  async querySearchConsole(
    property: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.post(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
      body,
    );
  }

  async getGaMetadata(propertyId: string): Promise<Record<string, unknown>> {
    return this.get(
      `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}/metadata`,
    );
  }

  async runGaReport(
    propertyId: string,
    body: GaReportRequest,
  ): Promise<Record<string, unknown>> {
    return this.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
      body as unknown as Record<string, unknown>,
    );
  }
}
