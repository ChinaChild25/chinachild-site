import { validateYandexClientId } from "./yandex-client-id-value.ts";

export const YANDEX_MEASUREMENT_ENDPOINT = "https://mc.yandex.ru/collect";
export const YANDEX_LEAD_EVENT = "lead_submitted";

export type YandexMeasurementConfig = {
  counterId: string;
  measurementToken: string;
  siteOrigin: string;
};

export type YandexMeasurementConfigResult =
  | { ok: true; config: YandexMeasurementConfig }
  | { ok: false; error: string };

export function validateYandexMeasurementConfig(
  env: Readonly<Record<string, string | undefined>>,
): YandexMeasurementConfigResult {
  const counterId = env.NEXT_PUBLIC_YM_ID?.trim();
  const measurementToken = env.YANDEX_METRIKA_MEASUREMENT_TOKEN?.trim();
  const siteOrigin = (
    env.NEXT_PUBLIC_SITE_URL ||
    env.SITE_URL ||
    "https://chinachild.ru"
  ).replace(/\/$/, "");

  if (!counterId) {
    return { ok: false, error: "NEXT_PUBLIC_YM_ID is not configured" };
  }
  if (!/^\d+$/.test(counterId) || Number(counterId) <= 0) {
    return { ok: false, error: "NEXT_PUBLIC_YM_ID must be a positive integer" };
  }
  if (!measurementToken) {
    return {
      ok: false,
      error: "YANDEX_METRIKA_MEASUREMENT_TOKEN is not configured",
    };
  }
  try {
    const origin = new URL(siteOrigin);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    return {
      ok: false,
      error: "NEXT_PUBLIC_SITE_URL or SITE_URL must be an absolute HTTP(S) URL",
    };
  }

  return {
    ok: true,
    config: { counterId, measurementToken, siteOrigin },
  };
}

export function extractYandexClientId(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
  if (!match) return null;
  try {
    return validateYandexClientId(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function resolveYandexClientId(input: {
  explicitClientId?: unknown;
  cookieHeader?: string | null;
}): string | null {
  return (
    validateYandexClientId(input.explicitClientId) ??
    extractYandexClientId(input.cookieHeader)
  );
}

function resolveMeasurementPageUrl(
  siteOrigin: string,
  sourceUrl?: string,
): string {
  const origin = new URL(siteOrigin);
  if (!sourceUrl) return origin.href;

  try {
    const candidate =
      sourceUrl.startsWith("/") && !sourceUrl.startsWith("//")
        ? new URL(sourceUrl, origin)
        : new URL(sourceUrl);
    const permittedHosts = new Set([
      origin.hostname,
      origin.hostname.startsWith("www.")
        ? origin.hostname.slice(4)
        : `www.${origin.hostname}`,
    ]);
    if (
      (candidate.protocol === "https:" || candidate.protocol === "http:") &&
      permittedHosts.has(candidate.hostname)
    ) {
      return candidate.href;
    }
  } catch {
    // A semantic form source such as "modal" is not a page URL.
  }
  return origin.href;
}

export function buildServerLeadMeasurementBody(input: {
  config: YandexMeasurementConfig;
  clientId: string;
  sourceUrl?: string;
  eventTimeSeconds?: number;
}): URLSearchParams {
  const clientId = validateYandexClientId(input.clientId);
  if (!clientId) {
    throw new Error("Yandex Metrica ClientID must contain digits only");
  }

  const body = new URLSearchParams({
    tid: input.config.counterId,
    cid: clientId,
    t: "event",
    ea: YANDEX_LEAD_EVENT,
    dl: resolveMeasurementPageUrl(
      input.config.siteOrigin,
      input.sourceUrl,
    ),
    et: String(input.eventTimeSeconds ?? Math.floor(Date.now() / 1000)),
    ms: input.config.measurementToken,
  });
  return body;
}
