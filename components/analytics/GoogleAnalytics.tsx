"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * gtag.js (~174 KiB) is GA4 — the SECONDARY counter on this RU site (Yandex
 * Metrika is primary). It previously loaded `lazyOnload`, but on PageSpeed's
 * throttled mobile CPU the script's parse/eval lands inside the LCP window of
 * the heavy home page and inflates LCP. We now load it on the FIRST user
 * interaction (pointer/key/scroll/touch), with a 6 s idle fallback, so the
 * 174 KiB never competes with the initial render.
 *
 * Consent Mode v2 is unaffected: ConsentProvider.initConsentMode() already put
 * `gtag('consent','default', …denied)` into the dataLayer before this runs, and
 * gtag.js drains that queue whenever it loads. Clicking the cookie banner is
 * itself an interaction, so a user who accepts triggers the load immediately.
 *
 * Trade-off: a visitor who leaves WITHOUT any interaction inside the 6 s window
 * is not counted in GA4 — Yandex (primary, loaded `lazyOnload`) still records
 * them. The 6 s fallback sits past the LCP/TTI window, so it doesn't tax the
 * throttled-CPU score while still catching engaged readers who don't scroll.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (!id) return;
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      setLoad(true);
      cleanup();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) =>
      window.addEventListener(e, fire, { once: true, passive: true }),
    );
    const timer = window.setTimeout(fire, 6000);
    function cleanup() {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, fire));
    }
    return cleanup;
  }, [id]);

  if (!id || process.env.NODE_ENV !== "production" || !load) return null;

  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
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
