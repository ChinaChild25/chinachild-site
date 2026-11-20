import type { ErrorEvent } from "@sentry/nextjs";

export const ERROR_DATA_COLLECTION = {
  userInfo: false, cookies: false, httpHeaders: false, httpBodies: [],
  urlQueryParams: false, graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false }, databaseQueryData: false,
  stackFrameVariables: false, frameContextLines: 0,
};

/** Only source-code locations are useful here; never retain request paths or queries. */
function frameFilename(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.split(/[?#]/, 1)[0];
  const next = clean.indexOf("/_next/");
  if (next >= 0 && /^\/_next\/static\/[a-zA-Z0-9_./%~-]+\.[cm]?js$/.test(clean.slice(next))) return clean.slice(next, next + 400);
  const bundled = clean.match(/(?:^|\/)(\.next\/(?:server|static)\/[^\s<>"'\\]+\.[cm]?js)$/);
  return bundled?.[1]?.slice(0, 400);
}

/** Rebuild an error from a strict allowlist, including for unexpected SDK context. */
export function privateErrorEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.type || !event.exception?.values?.length) return null;
  return {
    type: undefined,
    event_id: typeof event.event_id === "string" && /^[a-f0-9]{32}$/i.test(event.event_id) ? event.event_id : undefined,
    timestamp: Number.isFinite(event.timestamp) ? event.timestamp : undefined,
    level: "error",
    platform: "javascript",
    environment: event.environment === "production" ? "production" : "development",
    release: typeof event.release === "string" && /^[a-f0-9]{7,40}$/i.test(event.release) ? event.release : undefined,
    exception: { values: event.exception.values.slice(-3).map(exception => ({
      type: ["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "URIError", "EvalError"].includes(exception.type ?? "") ? exception.type : "Error",
      value: "Application error (details removed)",
      stacktrace: { frames: (exception.stacktrace?.frames ?? []).slice(-30).flatMap(frame => {
        const filename = frameFilename(frame.filename);
        return filename ? [{ filename,
          ...(Number.isSafeInteger(frame.lineno) && frame.lineno! > 0 ? { lineno: frame.lineno } : {}),
          ...(Number.isSafeInteger(frame.colno) && frame.colno! >= 0 ? { colno: frame.colno } : {}),
          in_app: frame.in_app === true,
        }] : [];
      }) },
    })) },
  };
}

export function monitoringDsn(enabled: string | undefined, dsn: string | undefined): string | undefined {
  if (enabled !== "true" || !dsn) return undefined;
  try {
    const url = new URL(dsn);
    return url.protocol === "https:" && /^o\d+\.ingest(?:\.[a-z]+)?\.sentry\.io$/.test(url.hostname)
      && /^[a-f0-9]{32}$/.test(url.username) && !url.password && /^\/\d+$/.test(url.pathname)
      && !url.search && !url.hash ? url.href : undefined;
  } catch { return undefined; }
}
