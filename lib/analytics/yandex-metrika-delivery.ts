import {
  buildServerLeadMeasurementBody,
  resolveYandexClientId,
  validateYandexMeasurementConfig,
  YANDEX_MEASUREMENT_ENDPOINT,
} from "./yandex-metrika-measurement-request.ts";

export type YandexLeadDeliveryInput = {
  env: Readonly<Record<string, string | undefined>>;
  explicitClientId?: unknown;
  sourceUrl?: string;
  cookieHeader?: string | null;
  userAgent?: string | null;
  clientIp?: string | null;
};

export type ServerLeadTrackingResult =
  | { ok: true; status: number }
  | {
      ok: false;
      kind:
        | "configuration"
        | "client_id_unavailable"
        | "provider"
        | "network";
      error: string;
      status?: number;
    };

export async function deliverYandexLeadEvent(
  input: YandexLeadDeliveryInput,
  fetchImpl: typeof fetch = fetch,
): Promise<ServerLeadTrackingResult> {
  const configuration = validateYandexMeasurementConfig(input.env);
  if (!configuration.ok) {
    return {
      ok: false,
      kind: "configuration",
      error: configuration.error,
    };
  }

  const clientId = resolveYandexClientId({
    explicitClientId: input.explicitClientId,
    cookieHeader: input.cookieHeader,
  });
  if (!clientId) {
    return {
      ok: false,
      kind: "client_id_unavailable",
      error: "Yandex Metrica ClientID is unavailable",
    };
  }

  const body = buildServerLeadMeasurementBody({
    config: configuration.config,
    clientId,
    sourceUrl: input.sourceUrl,
  });
  const headers: Record<string, string> = {
    Accept: "text/plain,*/*;q=0.8",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  };
  if (input.userAgent) headers["User-Agent"] = input.userAgent;
  if (input.clientIp) headers["X-Forwarded-For"] = input.clientIp;

  try {
    const response = await fetchImpl(YANDEX_MEASUREMENT_ENDPOINT, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(3_000),
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
