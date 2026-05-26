"use client";

import LeadModal from "@/components/forms/LeadModal";
import { useConsent } from "@/lib/consent/context";
import { useEffect, useState } from "react";

/**
 * Sticky bottom-of-viewport CTA — black pill on a translucent glass-pill
 * backdrop, matching the Practicum reference. Clicking the button opens
 * the lead-capture dialog.
 *
 * Hidden while the first screen is visible, so the fixed pill does not cover
 * the hero's own conversion buttons. Hidden on mobile while the cookie banner
 * is open: the banner spans the viewport width below 640px and would otherwise
 * sit on top of the pill. On desktop the banner is a 420px card pinned
 * bottom-left, so no overlap.
 */
export default function FloatingCta() {
  const { isBannerOpen } = useConsent();
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsPastHero(window.scrollY > window.innerHeight * 0.72);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const shellClassName = [
    "floating-cta-shell",
    !isPastHero && "floating-cta-shell--hidden",
    isBannerOpen && "floating-cta-shell--mobile-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <div className="floating-cta-glass">
        <LeadModal
          source="floating-cta"
          triggerClassName="floating-cta-btn"
          ariaLabel="Оставить заявку — открыть форму"
        >
          Оставить заявку
        </LeadModal>
      </div>
    </div>
  );
}
