export const ANALYTICS_CONSENT_VERSION = "v3";

/** Missing or invalid evidence disables optional tracking, never the application. */
export function hasAnalyticsConsentEvidence(input: {
  analytics_consent?: unknown;
  analytics_consent_version?: unknown;
  analytics_consent_at?: unknown;
}, now = Date.now()): boolean {
  if (input.analytics_consent !== true || input.analytics_consent_version !== ANALYTICS_CONSENT_VERSION ||
    typeof input.analytics_consent_at !== "string") return false;
  const at = Date.parse(input.analytics_consent_at);
  return Number.isFinite(at) && at > 0 && at <= now + 5 * 60_000;
}

export function readConsent(raw: string | null): { necessary: true; analytics: boolean; marketing: boolean; timestamp: string; version: string } | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (!value || (value.version !== ANALYTICS_CONSENT_VERSION && !(value.version === "v2" && value.analytics === false)) ||
      typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean" ||
      typeof value.timestamp !== "string" || !Number.isFinite(Date.parse(value.timestamp)) ||
      Date.parse(value.timestamp) <= 0 || Date.parse(value.timestamp) > Date.now() + 300_000) return null;
    return { necessary: true, analytics: value.analytics, marketing: value.marketing, timestamp: value.timestamp, version: ANALYTICS_CONSENT_VERSION };
  } catch { return null; }
}
