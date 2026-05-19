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
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

export function YandexMetrika() {
  const { consent } = useConsent();
  const analyticsEnabled = consent?.analytics === true;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!analyticsEnabled) return;
    if (!YM_ID || typeof window === "undefined" || !window.ym) return;
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    if (window.__lastYmUrl === url) return;
    const referer = window.__lastYmUrl || document.referrer;
    window.__lastYmUrl = url;
    window.ym(YM_ID, "hit", url, { referer });
  }, [analyticsEnabled, pathname, searchParams]);

  if (!YM_ID || process.env.NODE_ENV !== "production") return null;
  if (!analyticsEnabled) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}", "ym");
ym(${YM_ID}, "init", {
  defer: true,
  webvisor: true,
  clickmap: true,
  accurateTrackBounce: true,
  trackLinks: true,
  ecommerce: "dataLayer"
});
        `}
      </Script>
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
