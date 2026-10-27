export const ANALYTICS_CONSENT_VERSION = "v2";

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
