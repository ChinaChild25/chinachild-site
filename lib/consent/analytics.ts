"use client";

import { applyAttributionConsent, hasAnalyticsConsent } from "../attribution/browser.ts";
import { clearYandexClientId } from "../analytics/yandex-client-id.ts";

export function syncAnalyticsConsent(allowed: boolean, version?: string, timestamp?: string): void {
  const wasAllowed = hasAnalyticsConsent();
  applyAttributionConsent(allowed, version, timestamp);
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId) (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = !allowed;
  if (allowed) return;
  clearYandexClientId();
  const ymId = Number(process.env.NEXT_PUBLIC_YM_ID);
  try {
    if (window.__ccYmLoaderPending) {
      const queue = (window.ym as unknown as { a?: unknown[] } | undefined)?.a;
      if (Array.isArray(queue)) queue.length = 0;
    } else if (wasAllowed && ymId && window.ym) window.ym(ymId, "destruct");
  } catch { /* vendor failure cannot block withdrawal */ }
  window.__lastYmUrl = undefined;
  window.__ymFullModeInited = false;
  // Only analytics cookies; consent and operational chat cookies are preserved.
  for (const pair of document.cookie.split(";")) {
    const name = pair.trim().split("=", 1)[0];
    if (!/^(_ym_|_ga(?:_|$)|_gid$)/.test(name)) continue;
    const domains = ["", window.location.hostname, ".chinachild.ru"];
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""} SameSite=Lax`;
    }
  }
}
