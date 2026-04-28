"use client";

import LeadModal from "@/components/forms/LeadModal";

/**
 * Sticky bottom-of-viewport CTA — black pill on a translucent glass-pill
 * backdrop, matching the Practicum reference. Clicking the button opens
 * the lead-capture dialog.
 */
export default function FloatingCta() {
  return (
    <div className="floating-cta-shell">
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
