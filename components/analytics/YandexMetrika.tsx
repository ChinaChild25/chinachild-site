"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

// Cookieless-then-upgrade pattern. Metrika tag.js loads unconditionally and
// the counter is init'd in a minimal mode that does NOT set first-party
// cookies, record sessions, or build heat maps. Pageviews still flow so we
// can see traffic shape. Once the user accepts analytics consent we fire a
// second ym('init', ...) on the same counter — that call merges its params
// onto the existing one, lighting up webvisor / clickmap / accurateTrackBounce
// without re-loading the script.
export function YandexMetrika() {
  const { consent } = useConsent();
  const analyticsEnabled = consent?.analytics === true;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Promote to full mode once consent flips to true.
  useEffect(() => {
    if (!analyticsEnabled) return;
    if (typeof window === "undefined" || !window.ym) return;
    if (window.__ymFullModeInited) return;
    window.ym(YM_ID, "init", {
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
    });
    window.__ymFullModeInited = true;
  }, [analyticsEnabled]);

  // SPA hit tracking runs regardless of consent — the counter is already
  // running in cookieless mode and a pageview is the minimum signal we want.
  useEffect(() => {
    if (!YM_ID || typeof window === "undefined" || !window.ym) return;
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    if (window.__lastYmUrl === url) return;
    const referer = window.__lastYmUrl || document.referrer;
    window.__lastYmUrl = url;
    window.ym(YM_ID, "hit", url, { referer });
  }, [pathname, searchParams]);

  if (!YM_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Split loader. The `ym` stub + init run early (afterInteractive) so the
          counter queues pageview hits from the very first render — but the heavy
          ~90 KiB tag.js DOWNLOAD is deferred to `lazyOnload` (after window.load),
          so it no longer competes with the critical path (HTML → CSS → font →
          LCP). When tag.js finally loads it drains the queued ym() calls, so no
          pageviews are lost. Previously the whole thing was afterInteractive,
          which pulled 90 KiB into the LCP window and inflated mobile LCP. This
          mirrors the GA4 lazyOnload strategy in GoogleAnalytics.tsx. */}
      <Script id="yandex-metrika-stub" strategy="afterInteractive">
        {`
window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};
window.ym.l=1*new Date();
ym(${YM_ID}, "init", { defer: true, ecommerce: "dataLayer" });
        `}
      </Script>
      <Script
        id="yandex-metrika-tag"
        src={`https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`}
        strategy="lazyOnload"
      />
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
