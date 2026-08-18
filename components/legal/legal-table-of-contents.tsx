"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLegalReadingSettings } from "@/components/legal/legal-reading-context";

export interface TocEntry {
  id: string;
  title: string;
}

function useActiveSectionId(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

/**
 * Reference behavior (yandex.ru/legal/.../ru/, confirmed by inspecting its actual computed
 * styles): the mini-TOC row hides on scroll-down and slides back in on scroll-up, while the
 * title bar above it stays put. Small deltas are ignored so it doesn't flicker.
 *
 * Toggling `hidden` changes this row's height, which — since it lives inside the header's
 * `position: sticky` box — reflows the content below it and fires its own synthetic `scroll`
 * event. Left unguarded, that self-triggered event immediately flips `hidden` back, which
 * reflows again, forever. `ignoreUntil` mutes the listener for one CSS-transition's worth of
 * time after every decision so our own layout shift is never mistaken for the next scroll.
 */
function useHideOnScrollDown({ suspend }: { suspend: boolean }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ignoreUntil = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function handleScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;
      if (performance.now() < ignoreUntil.current) return;
      if (Math.abs(delta) < 6) return;
      if (y < 120) {
        setHidden(false);
      } else if (delta > 0) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      ignoreUntil.current = performance.now() + 260;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return suspend ? false : hidden;
}

// Plain text rows with a left accent bar on the active item — no fill, matching the
// reading UI this component ports over from the chinachild-my app.
const listItemClass = "block border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors";
const listItemActiveClass = "border-[var(--ink)] font-semibold text-[var(--ink)]";
const listItemInactiveClass = "border-transparent text-[var(--muted)] hover:text-[var(--ink)]";

export function LegalTableOfContentsDesktop({ sections, className }: { sections: TocEntry[]; className?: string }) {
  const { tocVisible } = useLegalReadingSettings();
  const activeId = useActiveSectionId(sections.map((section) => section.id));

  if (!tocVisible) return null;

  return (
    <nav aria-label="Содержание документа" className={cn("hidden lg:block", className)}>
      <div className="rounded-2xl bg-[var(--surface-neutral)] p-5">
        <h2 className="text-sm font-semibold text-[var(--ink)]">В этой статье</h2>
        <ol className="mt-3 list-none space-y-0.5 pl-0">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className={cn(listItemClass, section.id === activeId ? listItemActiveClass : listItemInactiveClass)}>
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

/**
 * Mobile: portals its compact current-section row into `#site-header-legal-slot`
 * (rendered by components/layout/Header.tsx only on legal routes), so it becomes the
 * bottom half of the SAME glass pill as the site nav — one shape, split by a hairline —
 * instead of a second floating card underneath it. Hides on scroll-down, reveals on
 * scroll-up, matching the reference exactly (icon + title + chevron + share, no settings
 * here — those stay in the desktop-only title bar; the mobile bar mirrors Yandex's own,
 * which doesn't carry a settings gear either).
 */
export function LegalTableOfContentsMobile({ sections }: { sections: TocEntry[]; className?: string }) {
  const { tocVisible } = useLegalReadingSettings();
  const activeId = useActiveSectionId(sections.map((section) => section.id));
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const hiddenOnScroll = useHideOnScrollDown({ suspend: isOpen });

  useEffect(() => {
    setPortalTarget(document.getElementById("site-header-legal-slot"));
  }, []);

  const activeIndex = Math.max(
    sections.findIndex((section) => section.id === activeId),
    0
  );
  const activeSection = sections[activeIndex];

  function handleCopyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${activeSection.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!tocVisible || !portalTarget) return null;

  return createPortal(
    <div className="lg:hidden">
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-out", hiddenOnScroll ? "grid-rows-[0fr]" : "grid-rows-[1fr]")}>
        <div className="min-h-0 overflow-hidden">
          {/* Border lives here, inside the clipped/collapsing box, so it hides together with
              the row instead of staying visible as a stray line across the pill's rounded
              corners while scrolled down. */}
          <div className="flex min-w-0 items-center gap-1 border-t border-[var(--line)] py-1.5">
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              className="flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg px-1.5 py-1 text-left text-xs font-medium text-[var(--ink)] transition-colors hover:bg-black/[0.04]"
            >
              <span className="min-w-0 flex-1 truncate">
                {activeIndex + 1}. {activeSection?.title}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition-transform", isOpen && "rotate-180")} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Скопировать ссылку на раздел"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--ink)]"
            >
              {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Link2 className="size-3.5" strokeWidth={2} />}
            </button>
          </div>

          {isOpen ? (
            <ol className="max-h-[55vh] list-none space-y-0.5 overflow-y-auto pb-2 pl-0">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(listItemClass, section.id === activeId ? listItemActiveClass : listItemInactiveClass)}
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </div>,
    portalTarget
  );
}
