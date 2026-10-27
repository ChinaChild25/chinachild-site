"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent/context";
import { hasAnalyticsConsent } from "@/lib/attribution/browser";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const { consent } = useConsent();
  if (!id || process.env.NODE_ENV !== "production" || consent?.analytics !== true) return null;
  return (
    <Script
      id="ga4-loader"
      src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      strategy="afterInteractive"
      onReady={() => {
        if (!hasAnalyticsConsent()) return;
        window.gtag?.("js", new Date());
        window.gtag?.("config", id, { send_page_view: true });
      }}
    />
  );
}
