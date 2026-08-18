"use client";

import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import { useConsent } from "@/lib/consent/context";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LEGAL_DOCUMENT_PATHS } from "@/lib/legal/document-paths";

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
  const pathname = usePathname();
  const [isPastHero, setIsPastHero] = useState(false);
  const [hasVisiblePageCta, setHasVisiblePageCta] = useState(false);

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

  useEffect(() => {
    const selector = "[data-floating-cta-suppress='true']";
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));

    if (!targets.length || !("IntersectionObserver" in window)) {
      setHasVisiblePageCta(false);
      return;
    }

    const visibleTargets = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
            visibleTargets.add(entry.target);
          } else {
            visibleTargets.delete(entry.target);
          }
        }
        setHasVisiblePageCta(visibleTargets.size > 0);
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: [0, 0.15, 0.5, 1],
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      visibleTargets.clear();
    };
  }, [pathname]);

  // The immersive HSK-test runner is a full-screen overlay with its own
  // fixed bottom nav — never show the floating CTA over it.
  if (pathname === "/chinese/hsk-test/take") return null;

  // Legal documents: keep the top glass header, but a conversion CTA fighting for
  // attention while someone reads an offer/policy is out of place — and it would be a
  // second floating glass surface on top of the reading UI's own chrome.
  if (LEGAL_DOCUMENT_PATHS.has(pathname)) return null;

  // On the HSK-test landing the floating CTA starts the test («Начать тест»),
  // not the lead form. Same visibility logic: hidden while a page start-button
  // is on screen, shown (on the glass) when scrolled past it.
  const isHskLanding = pathname === "/chinese/hsk-test";

  // On a level page the CTA jumps to that level's test instead of the lead form.
  const isHskLevel = /^\/chinese\/hsk-test\/level-\d+$/.test(pathname);

  const shellClassName = [
    "floating-cta-shell",
    (!isPastHero || hasVisiblePageCta) && "floating-cta-shell--hidden",
    isBannerOpen && "floating-cta-shell--mobile-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <div className="floating-cta-glass">
        {isHskLevel ? (
          <Link
            href="#start"
            className="floating-cta-btn"
            aria-label="Пройти тест HSK бесплатно"
          >
            Пройти тест бесплатно
          </Link>
        ) : isHskLanding ? (
          <Link
            href="#levels"
            className="floating-cta-btn"
            aria-label="Начать тест HSK"
          >
            Начать тест
          </Link>
        ) : (
          <LeadModal
            source="floating-cta"
            triggerClassName="floating-cta-btn"
            ariaLabel="Оставить заявку — открыть форму"
          >
            Оставить заявку
          </LeadModal>
        )}
      </div>
    </div>
  );
}
