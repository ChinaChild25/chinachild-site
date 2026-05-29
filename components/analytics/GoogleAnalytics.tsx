"use client";

import Script from "next/script";

/**
 * gtag.js — лениво. Стратегия `lazyOnload` ставит загрузку скрипта (172 КБ)
 * в очередь после `window.load`, то есть после FCP/LCP. Тем самым GA4 не
 * конкурирует с критическим путём (HTML → CSS → шрифт → LCP).
 *
 * Consent Mode v2 (lib/consent/gtag.ts) всё равно денитит analytics_storage
 * до согласия — то есть до клика «Принять» Google получает только
 * безличные cookieless-пинги, а после согласия — полноценные хиты.
 *
 * Раньше использовался <GoogleAnalytics> из @next/third-parties/google,
 * но он жёстко задаёт strategy="afterInteractive" — это раньше критического
 * рендера, что на медленной сети заметно вредит LCP.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
