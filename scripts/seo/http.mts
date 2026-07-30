import { asRecord } from "./validation.mts";

export type FetchLike = (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => Promise<Response>;

export type RequestPolicy = {
  provider: string;
  maxAttempts?: number;
  timeoutMs?: number;
  secrets?: string[];
};

export class ProviderHttpError extends Error {
  readonly provider: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(options: {
    provider: string;
    message: string;
    status?: number;
    retryable?: boolean;
  }) {
    super(options.message);
    this.name = "ProviderHttpError";
    this.provider = options.provider;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export function redactSecrets(value: string, secrets: readonly string[] = []): string {
  let redacted = value;
  for (const secret of secrets) {
    if (!secret) continue;
    redacted = redacted.split(secret).join("[REDACTED]");
  }
  return redacted
    .replace(
      /(authorization\s*[:=]\s*(?:bearer|oauth)\s+)[^\s,;"']+/gi,
      "$1[REDACTED]",
    )
    .replace(
      /("(?:access_token|refresh_token|client_secret|token)"\s*:\s*")[^"]+(")/gi,
      "$1[REDACTED]$2",
    )
    .replace(
      /([?&](?:access_token|oauth_token|token)=)[^&\s]+/gi,
      "$1[REDACTED]",
    )
    .replace(/\b(?:Bearer|OAuth)\s+[A-Za-z0-9._~+/-]{12,}/g, (match) => {
      const prefix = match.startsWith("Bearer") ? "Bearer" : "OAuth";
      return `${prefix} [REDACTED]`;
    });
}

function retryDelayMs(response: Response | undefined, attempt: number): number {
  const header = response?.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 0), 10_000);
    const date = Date.parse(header);
    if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), 10_000);
  }
  return Math.min(400 * 2 ** (attempt - 1), 3_200);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function responseErrorText(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return response.statusText || "request failed";
  try {
    const parsed: unknown = JSON.parse(text);
    const record = asRecord(parsed, "provider error");
    const nested =
      typeof record.error === "object" && record.error !== null
        ? asRecord(record.error, "provider error.error")
        : undefined;
    const message =
      nested?.message ??
      record.error_message ??
      record.message ??
      record.error_description ??
      record.error_code;
    return typeof message === "string" ? message : text.slice(0, 800);
  } catch {
    return text.slice(0, 800);
  }
}

export async function requestJson(
  url: string | URL,
  init: RequestInit,
  policy: RequestPolicy,
  dependencies: { fetch?: FetchLike; sleep?: (ms: number) => Promise<void> } = {},
): Promise<Record<string, unknown>> {
  const fetchImpl = dependencies.fetch ?? fetch;
  const sleepImpl = dependencies.sleep ?? sleep;
  const maxAttempts = policy.maxAttempts ?? 4;
  const timeoutMs = policy.timeoutMs ?? 20_000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response | undefined;
    try {
      response = await fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) {
        const parsed: unknown = await response.json();
        return asRecord(parsed, `${policy.provider} response`);
      }

      const message = redactSecrets(
        await responseErrorText(response),
        policy.secrets,
      );
      const retryable = RETRYABLE_STATUSES.has(response.status);
      lastError = new ProviderHttpError({
        provider: policy.provider,
        status: response.status,
        retryable,
        message: `${policy.provider} API returned ${response.status}: ${message}`,
      });
      if (!retryable || attempt === maxAttempts) throw lastError;
    } catch (error) {
      if (error instanceof ProviderHttpError && !error.retryable) throw error;
      lastError = error;
      if (attempt === maxAttempts) break;
    }
    await sleepImpl(retryDelayMs(response, attempt));
  }

  const message = redactSecrets(
    lastError instanceof Error ? lastError.message : String(lastError),
    policy.secrets,
  );
  throw new ProviderHttpError({
    provider: policy.provider,
    retryable: true,
    message: `${policy.provider} API failed after ${maxAttempts} attempts: ${message}`,
  });
}
