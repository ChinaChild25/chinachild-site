export const YANDEX_MEASUREMENT_ENDPOINT = "https://mc.yandex.ru/collect";
export const SERVER_LEAD_GOAL_PATH = "/lead-success/server";

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
    const clientId = decodeURIComponent(match[1]).trim();
    return /^\d+$/.test(clientId) ? clientId : null;
  } catch {
    return null;
  }
}

export function buildServerLeadMeasurementBody(input: {
  config: YandexMeasurementConfig;
  clientId: string;
  sourceUrl?: string;
  eventTimeSeconds?: number;
}): URLSearchParams {
  if (!/^\d+$/.test(input.clientId)) {
    throw new Error("Yandex Metrica ClientID must contain digits only");
  }

  const pageUrl = `${input.config.siteOrigin}${SERVER_LEAD_GOAL_PATH}`;
  const body = new URLSearchParams({
    tid: input.config.counterId,
    cid: input.clientId,
    t: "pageview",
    dr: input.sourceUrl || input.config.siteOrigin,
    dl: pageUrl,
    dt: "Stored lead server fallback",
    et: String(input.eventTimeSeconds ?? Math.floor(Date.now() / 1000)),
    ms: input.config.measurementToken,
  });
  return body;
}
