"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LeadForm from "@/components/forms/LeadForm";

type LeadModalProps = {
  /** Visible label inside the trigger button */
  children: React.ReactNode;
  /** Class applied to the trigger <button> itself */
  triggerClassName?: string;
  /** Heading shown at the top of the dialog */
  title?: string;
  /** Subheading shown under the title */
  description?: string;
  /** Source attribution written into the lead metadata */
  source?: string;
  /** Optional aria-label override for the trigger button */
  ariaLabel?: string;
};

/**
 * Native <dialog>-based lead modal. Accessible by default — handles ESC,
 * focus trap, backdrop click, and is screen-reader friendly because the
 * browser owns the dialog role and aria-modal semantics.
 */
export default function LeadModal({
  children,
  triggerClassName,
  title = "Оставить заявку",
  description = "Расскажите, что вас интересует — менеджер свяжется в течение рабочего дня и подберёт подходящий формат обучения.",
  source,
  ariaLabel,
}: LeadModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);

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
    setOpen(true);
  }, []);

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
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="lead-modal-title"
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
              width="20"
              height="20"
              viewBox="0 0 20 20"
              aria-hidden
              focusable="false"
            >
              <path
                d="M5 5 L15 15 M15 5 L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <header className="grid gap-3">
            <h2
              id="lead-modal-title"
              className="text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b] sm:text-3xl"
            >
              {title}
            </h2>
            <p className="text-sm leading-6 text-[#6b6b6b]">{description}</p>
          </header>
          <div className="mt-6">
            <LeadForm compact source={source ?? "modal"} />
          </div>
        </div>
      </dialog>
    </>
  );
}
