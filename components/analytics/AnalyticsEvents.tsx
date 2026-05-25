"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === "/price") {
      trackEvent("pricing_view", { path: pathname });
    }
    if (pathname === "/free-trial") {
      trackEvent("free_trial_view", { path: pathname });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        trackEvent("phone_click", { href, path: window.location.pathname });
      } else if (href.startsWith("mailto:")) {
        trackEvent("email_click", { href, path: window.location.pathname });
      } else if (/wa\.me|whatsapp\.com/i.test(href)) {
        trackEvent("whatsapp_click", { href, path: window.location.pathname });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
