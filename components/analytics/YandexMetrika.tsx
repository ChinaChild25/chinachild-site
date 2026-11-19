"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { startYandexClientIdCapture } from "@/lib/analytics/yandex-client-id";
import { useConsent } from "@/lib/consent/context";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    // Global dedupe survives Suspense re-mounts and prevents duplicate pageviews
    // for the same URL. With defer:true, every pageview is sent manually here.
    __lastYmUrl?: string;
    // Set once the analytics-consent upgrade init has run so we never double-
    // enable webvisor/clickmap in the same tab.
    __ymFullModeInited?: boolean;
    __ccYmLoaderPending?: boolean;
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

// The tag and all pageviews require explicit analytics consent.
export function YandexMetrika() {
  const { consent } = useConsent();
  const analyticsEnabled = consent?.analytics === true;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!analyticsEnabled || !YM_ID || process.env.NODE_ENV !== "production") return;
    if (!window.ym) {
      const queue: unknown[][] = [];
      const stub = (...args: unknown[]) => { queue.push(args); };
      Object.assign(stub, { a: queue, l: Date.now() });
      window.ym = stub;
      window.__ccYmLoaderPending = true;
    }
    if (!window.__ymFullModeInited) {
      window.ym(YM_ID, "init", {
        defer: true, ecommerce: "dataLayer", webvisor: true, clickmap: true,
        accurateTrackBounce: true, trackLinks: true,
      });
      window.__ymFullModeInited = true;
      startYandexClientIdCapture();
    }
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    if (window.__lastYmUrl === url) return;
    const referer = window.__lastYmUrl || document.referrer;
    window.__lastYmUrl = url;
    window.ym(YM_ID, "hit", url, { referer });
  }, [analyticsEnabled, pathname, searchParams]);

  if (!YM_ID || process.env.NODE_ENV !== "production" || !analyticsEnabled) return null;
  return (
    <Script
      id="yandex-metrika-tag"
      src={`https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`}
      strategy="lazyOnload"
      onLoad={() => { window.__ccYmLoaderPending = false; }}
    />
  );
}
