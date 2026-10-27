"use client";

import { attributionHistory, sourceTouch, type AttributionHistory, type SourceTouch } from "./history.ts";

export const ATTRIBUTION_STORAGE_KEY = "cc-attribution-v1";
let analyticsConsent = false;
let consentVersion: string | undefined;
let consentAt: string | undefined;
let arrival: SourceTouch | null | undefined;
let memory: AttributionHistory | undefined;

export function hasAnalyticsConsent(): boolean { return analyticsConsent; }

export function rememberDocumentArrival(): void {
  if (arrival !== undefined || typeof window === "undefined") return;
  if (!analyticsConsent) return;
  // Read the document's original URL only after consent. Navigation Timing keeps
  // it through SPA navigation, without collecting or persisting anything beforehand.
  const navigation = window.performance?.getEntriesByType("navigation")[0];
  arrival = sourceTouch(navigation?.name || window.location.href, document.referrer,
    Math.min(Date.now(), Math.floor(window.performance?.timeOrigin || Date.now())));
}

export function applyAttributionConsent(allowed: boolean, version?: string, timestamp?: string): void {
  analyticsConsent = allowed;
  consentVersion = allowed ? version : undefined;
  consentAt = allowed ? timestamp : undefined;
  if (allowed) { captureAttribution(); return; }
  memory = undefined;
  if (typeof window !== "undefined") {
    try { window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY); } catch { /* unavailable storage */ }
  }
}

export function captureAttribution(): AttributionHistory | undefined {
  if (!analyticsConsent || typeof window === "undefined") return undefined;
  rememberDocumentArrival();
  let saved: unknown = memory;
  try { const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY); if (raw) saved = JSON.parse(raw); } catch { /* memory fallback */ }
  memory = attributionHistory(saved, arrival ?? null);
  // The same document arrival is consumed once; internal SPA navigation is not a source.
  arrival = null;
  try { window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(memory)); } catch { /* memory fallback */ }
  return memory;
}

export function getLeadAttribution() {
  const history = captureAttribution();
  return {
    analytics_consent: analyticsConsent,
    ...(analyticsConsent ? { direct_visit: !history?.last && typeof document !== "undefined" && !document.referrer } : {}),
    ...(analyticsConsent ? { analytics_consent_version: consentVersion, analytics_consent_at: consentAt, attribution: history } : {}),
    utm: history?.last?.tags ?? {},
  };
}

export function getLeadPageContext(sourcePage: string, pagePath: string) {
  return {
    ...getLeadAttribution(),
    source_page: sourcePage.split(/[?#]/, 1)[0],
    page_path: pagePath.split(/[?#]/, 1)[0],
    referrer: analyticsConsent && typeof document !== "undefined" ? document.referrer : undefined,
  };
}
