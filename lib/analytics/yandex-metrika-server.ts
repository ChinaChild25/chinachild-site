import "server-only";

import {
  buildServerLeadMeasurementBody,
  extractYandexClientId,
  validateYandexMeasurementConfig,
  YANDEX_MEASUREMENT_ENDPOINT,
} from "./yandex-metrika-measurement-request";

type TrackOpts = {
  sourceUrl?: string;
  cookieHeader?: string | null;
  userAgent?: string | null;
  clientIp?: string | null;
};

export type ServerLeadTrackingResult =
  | { ok: true; status: number }
  | {
      ok: false;
      kind: "configuration" | "client_id" | "provider" | "network";
      error: string;
      status?: number;
    };

export async function trackServerLead(
  opts: TrackOpts = {},
): Promise<ServerLeadTrackingResult> {
  const configuration = validateYandexMeasurementConfig(process.env);
  if (!configuration.ok) {
    return {
      ok: false,
      kind: "configuration",
      error: configuration.error,
    };
  }

  const clientId = extractYandexClientId(opts.cookieHeader);
  if (!clientId) {
    return {
      ok: false,
      kind: "client_id",
      error: "Yandex Metrica ClientID (_ym_uid) is unavailable or invalid",
    };
  }

  const body = buildServerLeadMeasurementBody({
    config: configuration.config,
    clientId,
    sourceUrl: opts.sourceUrl,
  });
  const headers: Record<string, string> = {
    Accept: "text/plain,*/*;q=0.8",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  };
  if (opts.userAgent) headers["User-Agent"] = opts.userAgent;
  if (opts.clientIp) headers["X-Forwarded-For"] = opts.clientIp;

  try {
    const response = await fetch(YANDEX_MEASUREMENT_ENDPOINT, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        kind: "provider",
        error: `Yandex Measurement Protocol returned HTTP ${response.status}`,
        status: response.status,
      };
    }
    return { ok: true, status: response.status };
  } catch (error) {
    return {
      ok: false,
      kind: "network",
      error:
        error instanceof Error
          ? `Yandex Measurement Protocol request failed: ${error.name}`
          : "Yandex Measurement Protocol request failed",
    };
  }
}
