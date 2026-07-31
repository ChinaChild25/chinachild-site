import { gunzipSync } from "node:zlib";
import type { SeoConfig } from "../config.mts";
import {
  discoverMetrikaCounter,
  discoverWebmasterHost,
  type MetrikaCounterCandidate,
  type WebmasterHostCandidate,
} from "../discovery.mts";
import { requestJson, type FetchLike } from "../http.mts";
import {
  asArray,
  asBoolean,
  asNumber,
  asOptionalArray,
  asOptionalString,
  asRecord,
  asString,
} from "../validation.mts";

function urlWithParams(
  base: string,
  params: Record<string, string | number | boolean | string[] | undefined>,
): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

class YandexReadOnlyClient {
  readonly token: string;
  readonly fetchImpl?: FetchLike;
  requestCount = 0;

  constructor(token: string, fetchImpl?: FetchLike) {
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  async get(
    url: string,
    params: Record<string, string | number | boolean | string[] | undefined> = {},
    provider = "Yandex",
  ): Promise<Record<string, unknown>> {
    this.requestCount += 1;
    return requestJson(
      urlWithParams(url, params),
      {
        method: "GET",
        headers: {
          Authorization: `OAuth ${this.token}`,
          Accept: "application/json",
        },
      },
      {
        provider,
        secrets: [this.token],
      },
      { fetch: this.fetchImpl },
    );
  }

  async post(
    url: string,
    body: Record<string, unknown>,
    provider = "Yandex",
  ): Promise<Record<string, unknown>> {
    this.requestCount += 1;
    return requestJson(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `OAuth ${this.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      {
        provider,
        secrets: [this.token],
      },
      { fetch: this.fetchImpl },
    );
  }
}

export class YandexMetrikaClient extends YandexReadOnlyClient {
  constructor(config: SeoConfig["yandex"], fetchImpl?: FetchLike) {
    if (!config.oauthToken) {
      throw new Error("YANDEX_OAUTH_TOKEN is required for Yandex Metrica");
    }
    super(config.oauthToken, fetchImpl);
  }

  async listCounters(): Promise<{
    counters: MetrikaCounterCandidate[];
    rawPages: Record<string, unknown>[];
  }> {
    const counters: MetrikaCounterCandidate[] = [];
    const rawPages: Record<string, unknown>[] = [];
    const perPage = 1000;
    let offset = 1;

    for (let page = 0; page < 100; page += 1) {
      const response = await this.get(
        "https://api-metrika.yandex.net/management/v1/counters",
        { field: "goals,mirrors", offset, per_page: perPage },
        "Yandex Metrica",
      );
      rawPages.push(response);
      const rows = asArray(response.counters, "Metrica counters.counters");
      for (const [index, value] of rows.entries()) {
        const row = asRecord(value, `Metrica counter[${index}]`);
        const mirrors = asOptionalArray(
          row.mirrors,
          `Metrica counter[${index}].mirrors`,
        ).map((mirror, mirrorIndex) => {
          if (typeof mirror === "string") return mirror;
          const record = asRecord(
            mirror,
            `Metrica counter[${index}].mirrors[${mirrorIndex}]`,
          );
          return asString(
            record.site ?? record.address ?? record.name,
            `Metrica counter[${index}].mirrors[${mirrorIndex}]`,
          );
        });
        counters.push({
          id: asNumber(row.id, `Metrica counter[${index}].id`),
          name: asString(row.name, `Metrica counter[${index}].name`),
          site: asString(row.site, `Metrica counter[${index}].site`),
          permission: asOptionalString(
            row.permission,
            `Metrica counter[${index}].permission`,
          ),
          mirrors,
        });
      }
      const total =
        typeof response.rows === "number" ? response.rows : counters.length;
      if (rows.length < perPage || counters.length >= total) break;
      offset += rows.length;
      if (page === 99) {
        throw new Error("Yandex Metrica counter pagination exceeded 100 pages");
      }
    }
    return { counters, rawPages };
  }

  async getCounter(counterId: number): Promise<Record<string, unknown>> {
    return this.get(
      `https://api-metrika.yandex.net/management/v1/counter/${counterId}`,
      { field: "goals,mirrors" },
      "Yandex Metrica",
    );
  }

  async getGoals(counterId: number): Promise<Record<string, unknown>> {
    return this.get(
      `https://api-metrika.yandex.net/management/v1/counter/${counterId}/goals`,
      {},
      "Yandex Metrica",
    );
  }

  async report(
    params: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.get(
      "https://api-metrika.yandex.net/stat/v1/data",
      params,
      "Yandex Metrica",
    );
  }

  discoverCounter(
    counters: readonly MetrikaCounterCandidate[],
    explicitId: string | undefined,
    domain: string,
  ): MetrikaCounterCandidate {
    return discoverMetrikaCounter(counters, explicitId, domain);
  }
}

export class YandexWebmasterClient extends YandexReadOnlyClient {
  constructor(config: SeoConfig["yandex"], fetchImpl?: FetchLike) {
    if (!config.oauthToken) {
      throw new Error("YANDEX_OAUTH_TOKEN is required for Yandex Webmaster");
    }
    super(config.oauthToken, fetchImpl);
  }

  private base(userId: number, hostId?: string): string {
    const root = `https://api.webmaster.yandex.net/v4/user/${encodeURIComponent(String(userId))}`;
    return hostId
      ? `${root}/hosts/${encodeURIComponent(hostId)}`
      : root;
  }

  async getUser(): Promise<Record<string, unknown>> {
    return this.get(
      "https://api.webmaster.yandex.net/v4/user",
      {},
      "Yandex Webmaster",
    );
  }

  async listHosts(userId: number): Promise<{
    hosts: WebmasterHostCandidate[];
    raw: Record<string, unknown>;
  }> {
    const raw = await this.get(
      `${this.base(userId)}/hosts`,
      {},
      "Yandex Webmaster",
    );
    const hosts = asArray(raw.hosts, "Webmaster hosts.hosts").map(
      (value, index): WebmasterHostCandidate => {
        const row = asRecord(value, `Webmaster host[${index}]`);
        const mainMirrorValue = row.main_mirror;
        const mainMirror =
          mainMirrorValue && typeof mainMirrorValue === "object"
            ? asRecord(mainMirrorValue, `Webmaster host[${index}].main_mirror`)
            : undefined;
        return {
          hostId: asString(row.host_id, `Webmaster host[${index}].host_id`),
          asciiHostUrl: asString(
            row.ascii_host_url,
            `Webmaster host[${index}].ascii_host_url`,
          ),
          unicodeHostUrl: asOptionalString(
            row.unicode_host_url,
            `Webmaster host[${index}].unicode_host_url`,
          ),
          verified: asBoolean(
            row.verified,
            `Webmaster host[${index}].verified`,
          ),
          mainMirror: mainMirror
            ? {
                hostId: asString(
                  mainMirror.host_id,
                  `Webmaster host[${index}].main_mirror.host_id`,
                ),
                asciiHostUrl: asOptionalString(
                  mainMirror.ascii_host_url,
                  `Webmaster host[${index}].main_mirror.ascii_host_url`,
                ),
                unicodeHostUrl: asOptionalString(
                  mainMirror.unicode_host_url,
                  `Webmaster host[${index}].main_mirror.unicode_host_url`,
                ),
                verified:
                  typeof mainMirror.verified === "boolean"
                    ? mainMirror.verified
                    : undefined,
              }
            : undefined,
        };
      },
    );
    return { hosts, raw };
  }

  discoverHost(
    hosts: readonly WebmasterHostCandidate[],
    explicitId: string | undefined,
    domain: string,
  ): WebmasterHostCandidate {
    return discoverWebmasterHost(hosts, explicitId, domain);
  }

  async hostGet(
    userId: number,
    hostId: string,
    suffix: string,
    params: Record<string, string | number | boolean | string[] | undefined> = {},
  ): Promise<Record<string, unknown>> {
    return this.get(
      `${this.base(userId, hostId)}${suffix}`,
      params,
      `Yandex Webmaster (${suffix})`,
    );
  }

  async hostPost(
    userId: number,
    hostId: string,
    suffix: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.post(
      `${this.base(userId, hostId)}${suffix}`,
      body,
      `Yandex Webmaster (${suffix})`,
    );
  }

  async downloadText(url: string): Promise<string> {
    this.requestCount += 1;
    const response = await (this.fetchImpl ?? fetch)(url, {
      method: "GET",
      headers: {
        Accept: "text/csv, text/plain, application/octet-stream",
      },
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      throw new Error(
        `Yandex Webmaster export download returned ${response.status}`,
      );
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      return gunzipSync(bytes).toString("utf8");
    }
    return bytes.toString("utf8");
  }
}
