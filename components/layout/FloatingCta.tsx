"use client";

import LeadModal from "@/components/forms/LeadModal";
import { useConsent } from "@/lib/consent/context";

/**
 * Sticky bottom-of-viewport CTA — black pill on a translucent glass-pill
 * backdrop, matching the Practicum reference. Clicking the button opens
 * the lead-capture dialog.
 *
 * Hidden on mobile while the cookie banner is open: the banner spans the
 * viewport width below 640px and would otherwise sit on top of the pill.
 * On desktop the banner is a 420px card pinned bottom-left, so no overlap.
 */
export default function FloatingCta() {
  const { isBannerOpen } = useConsent();
  const shellClassName = isBannerOpen
    ? "floating-cta-shell floating-cta-shell--mobile-hidden"
    : "floating-cta-shell";
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
