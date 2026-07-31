"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Goals,
  trackEducationOfferEvent,
  trackEvent,
  type EducationOfferAnalyticsContext,
} from "@/lib/analytics";

// LeadForm подтягивает SmartCaptcha (~2 МБ) сразу при монтировании.
// На блог-страницах форма открывается у ~3% посетителей — нет смысла
// тащить эти 2 МБ в initial bundle. Динамический импорт грузит чанк
// только после первого открытия модалки.
const LeadForm = dynamic(() => import("@/components/forms/LeadForm"), {
  ssr: false,
  loading: () => null,
});

type LeadModalProps = {
  /** Visible label inside the trigger button */
  children: React.ReactNode;
  /** Class applied to the trigger <button> itself */
  triggerClassName?: string;
  /** Heading shown at the top of the dialog. Pass "" to hide the heading. */
  title?: string;
  /** Subheading shown under the title */
  description?: string;
  /** Source attribution written into the lead metadata */
  source?: string;
  /** Optional aria-label override for the trigger button */
  ariaLabel?: string;
  /** Pre-select a course in the form (e.g. on a course landing page) */
  defaultCourse?: string;
  /** Non-PII context for Yandex Education offer funnel attribution. */
  offerContext?: EducationOfferAnalyticsContext;
  /** Hide the global floating CTA while this trigger is visible in the viewport */
  suppressFloatingCta?: boolean;
};

/**
 * Native <dialog>-based lead modal. Accessible by default — handles ESC,
 * focus trap, backdrop click, and is screen-reader friendly because the
 * browser owns the dialog role and aria-modal semantics.
 */
export default function LeadModal({
  children,
  triggerClassName,
  title = "",
  description,
  source,
  ariaLabel,
  defaultCourse,
  offerContext,
  suppressFloatingCta = false,
}: LeadModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  // Монтируем LeadForm (и тянем SmartCaptcha) только после первого
  // открытия. После закрытия не размонтируем — state формы сохраняется.
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialog.open) dialog.close();
    setOpen(false);
  }, []);

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    trackEvent("course_cta_click", {
      source: source ?? "modal",
      course: defaultCourse,
    });
    if (offerContext) {
      trackEducationOfferEvent(Goals.EDUCATION_OFFER_CTA_CLICK, {
        source: source ?? "modal",
        course: defaultCourse,
        ...offerContext,
      });
    }
    setHasOpenedOnce(true);
    setOpen(true);
  }, [defaultCourse, offerContext, source]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) closeDialog();
    };
    const handleClose = () => setOpen(false);
    dialog.addEventListener("click", handleClick);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("close", handleClose);
    };
  }, [closeDialog]);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={triggerClassName}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        data-floating-cta-suppress={suppressFloatingCta ? "true" : undefined}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={title || "Оставить заявку"}
        className="lead-dialog"
      >
        <div className="lead-dialog-card">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Закрыть форму"
            className="lead-dialog-close"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              aria-hidden
              focusable="false"
            >
              <path
                d="M5 5 L17 17 M17 5 L5 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {title ? (
            <h2 className="lead-dialog-title">{title}</h2>
          ) : null}
          {description ? (
            <p className="lead-dialog-description">{description}</p>
          ) : null}
          <div className="lead-dialog-form">
            {hasOpenedOnce ? (
              <LeadForm
                compact
                source={source ?? "modal"}
                defaultCourse={defaultCourse}
                offerContext={offerContext}
              />
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
