"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // useSearchParams() resolves through Suspense asynchronously, so this effect
  // can fire twice for the same pageview (once with empty params, once when
  // they arrive). Track the last URL we already reported and skip duplicates.
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!YM_ID || typeof window === "undefined" || !window.ym) return;
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    if (lastUrl.current === url) return;
    lastUrl.current = url;
    window.ym(YM_ID, "hit", url, { referer: document.referrer });
  }, [pathname, searchParams]);

  if (!YM_ID || process.env.NODE_ENV !== "production") return null;

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
