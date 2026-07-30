export type MetrikaCounterCandidate = {
  id: number;
  name: string;
  site: string;
  permission?: string;
  mirrors: string[];
};

export type WebmasterHostCandidate = {
  hostId: string;
  asciiHostUrl: string;
  unicodeHostUrl?: string;
  verified: boolean;
  mainMirror?: {
    hostId: string;
    asciiHostUrl?: string;
    unicodeHostUrl?: string;
    verified?: boolean;
  };
};

export class AmbiguousResourceError extends Error {
  readonly candidates: string[];

  constructor(message: string, candidates: string[]) {
    super(message);
    this.name = "AmbiguousResourceError";
    this.candidates = candidates;
  }
}

function hostname(value: string): string | null {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function counterMatches(counter: MetrikaCounterCandidate, domain: string): boolean {
  return [counter.site, ...counter.mirrors].some(
    (value) => hostname(value) === domain,
  );
}

export function discoverMetrikaCounter(
  counters: readonly MetrikaCounterCandidate[],
  explicitId: string | undefined,
  domain: string,
): MetrikaCounterCandidate {
  if (explicitId) {
    const match = counters.find((counter) => String(counter.id) === explicitId);
    if (!match) {
      throw new AmbiguousResourceError(
        `YANDEX_METRIKA_COUNTER_ID=${explicitId} is not accessible`,
        counters.map((counter) => `${counter.id}: ${counter.name} (${counter.site})`),
      );
    }
    return match;
  }

  const candidates = counters.filter((counter) => counterMatches(counter, domain));
  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) {
    throw new AmbiguousResourceError(
      `No accessible Yandex Metrica counter matches ${domain}`,
      counters.map((counter) => `${counter.id}: ${counter.name} (${counter.site})`),
    );
  }
  throw new AmbiguousResourceError(
    `Multiple Yandex Metrica counters match ${domain}; set YANDEX_METRIKA_COUNTER_ID`,
    candidates.map((counter) => `${counter.id}: ${counter.name} (${counter.site})`),
  );
}

function hostMatches(host: WebmasterHostCandidate, domain: string): boolean {
  return [
    host.asciiHostUrl,
    host.unicodeHostUrl,
    host.mainMirror?.asciiHostUrl,
    host.mainMirror?.unicodeHostUrl,
  ].some((value) => value && hostname(value) === domain);
}

export function discoverWebmasterHost(
  hosts: readonly WebmasterHostCandidate[],
  explicitId: string | undefined,
  domain: string,
): WebmasterHostCandidate {
  if (explicitId) {
    const match = hosts.find((host) => host.hostId === explicitId);
    if (!match) {
      throw new AmbiguousResourceError(
        `YANDEX_WEBMASTER_HOST_ID=${explicitId} is not accessible`,
        hosts.map((host) => `${host.hostId}: ${host.asciiHostUrl}`),
      );
    }
    return match;
  }

  const candidates = hosts.filter((host) => hostMatches(host, domain));
  if (candidates.length === 1) return candidates[0];

  const mirrorIds = new Set(
    candidates.map((host) => host.mainMirror?.hostId ?? host.hostId),
  );
  if (candidates.length > 1 && mirrorIds.size === 1) {
    const mainId = [...mirrorIds][0];
    return (
      candidates.find((host) => host.hostId === mainId) ??
      candidates.find((host) => host.mainMirror?.hostId === mainId) ??
      candidates[0]
    );
  }

  if (candidates.length === 0) {
    throw new AmbiguousResourceError(
      `No accessible Yandex Webmaster host matches ${domain}`,
      hosts.map((host) => `${host.hostId}: ${host.asciiHostUrl}`),
    );
  }
  throw new AmbiguousResourceError(
    `Multiple Yandex Webmaster hosts match ${domain}; set YANDEX_WEBMASTER_HOST_ID`,
    candidates.map((host) => `${host.hostId}: ${host.asciiHostUrl}`),
  );
}
