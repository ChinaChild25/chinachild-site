"use client";

import { useState } from "react";
import TestArt from "./TestArt";

export type Step = {
  key: string;
  art: string;
  title: string;
  /** Full text shown when the card is expanded. */
  long: string;
};

/**
 * Interactive «что даст тест» cards (Praktikum). Each card is clickable:
 *  - collapsed → number (top-left), large 3D object, short title + ⓘ;
 *    the object scales up sharply on hover;
 *  - expanded → the full descriptive text with a × to close.
 */
export default function StepCards({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="hsk-steps">
      {steps.map((step, i) => {
        const isOpen = open === step.key;
        const no = String(i + 1).padStart(2, "0");
        return (
          <div
            key={step.key}
            className={`hsk-step${isOpen ? " hsk-step--open" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={step.title}
            onClick={() => setOpen(isOpen ? null : step.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(isOpen ? null : step.key);
              }
            }}
          >
            <span className="hsk-step-no">{no}</span>
            <span className="hsk-step-icon" aria-hidden>
              {isOpen ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M6 6l10 10M16 6L6 16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </span>

            {isOpen ? (
              <p className="hsk-step-text">{step.long}</p>
            ) : (
              <div className="hsk-step-face">
                <div className="hsk-step-figure">
                  {/* First two cards sit above the fold on mobile — load their
                      art eagerly so it isn't the lazy-delayed LCP. */}
                  <TestArt name={step.art} className="hsk-step-art" priority={i < 2} />
                </div>
                <h3 className="hsk-step-title">
                  {step.title}
                  <svg
                    className="hsk-step-info"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8.4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <rect x="9.1" y="8.8" width="1.8" height="5.2" rx="0.9" fill="currentColor" />
                    <circle cx="10" cy="6.1" r="1.05" fill="currentColor" />
                  </svg>
                </h3>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
