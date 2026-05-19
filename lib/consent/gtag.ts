"use client";

// Google Consent Mode v2 helpers. The contract:
//
//  1. initConsentMode() must run BEFORE gtag.js loads (otherwise gtag would
//     send a hit with the implicit-grant default and Consent Mode is moot).
//     We do this from ConsentProvider's first useEffect, and we mount the
//     <GoogleAnalytics /> client component lexically AFTER <ConsentProvider />
//     in app/layout.tsx so the gtag bootstrap script can't race ahead.
//
//  2. updateConsent({ analytics, marketing }) flips storage flags after the
//     user picks an option. With wait_for_update: 500 in the default, gtag
//     buffers events for up to 500ms so the first pageview lands with the
//     correct state — there's no leak window for users who already decided
//     in a previous visit.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let consentDefaultEmitted = false;

export function initConsentMode() {
  if (typeof window === "undefined") return;
  if (consentDefaultEmitted) return;
  consentDefaultEmitted = true;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // The same shape @next/third-parties' GoogleAnalytics installs later.
    // Defining it here just ensures consent('default', ...) lands in the
    // dataLayer FIRST, before gtag.js downloads and processes the queue.
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    // Hold events for up to 500ms while ConsentProvider reads localStorage and
    // fires consent('update', ...) for returning users.
    wait_for_update: 500,
  });
}

export function updateConsent(opts: { analytics: boolean; marketing: boolean }) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: opts.analytics ? "granted" : "denied",
    ad_storage: opts.marketing ? "granted" : "denied",
    ad_user_data: opts.marketing ? "granted" : "denied",
    ad_personalization: opts.marketing ? "granted" : "denied",
  });
}
