"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LegalReadingSettingsProvider, legalTextScale, useLegalReadingSettings } from "@/components/legal/legal-reading-context";
import { LegalReadingToolbarActions } from "@/components/legal/legal-reading-toolbar";
import { LegalWordmark } from "@/components/legal/legal-wordmark";

interface LegalReadingLayoutProps {
  main: ReactNode;
  sidebar: ReactNode;
}

function LegalReadingLayout({ main, sidebar }: LegalReadingLayoutProps) {
  const { wide, tocVisible, textSize } = useLegalReadingSettings();

  return (
    // Reuses the site's own two container tiers (.page-shell / .page-shell-wide,
    // 940px / 1424px) instead of inventing new max-widths for "wide mode".
    <div
      className={cn("legal-reading-shell", wide ? "page-shell-wide" : "page-shell", "pt-6 pb-16 lg:pb-24")}
      style={{ "--legal-scale": legalTextScale[textSize] } as CSSProperties}
    >
      {/* Desktop only — mobile gets its own sticky title+toc header, rendered inline by
          LegalTableOfContentsMobile so it can glue directly to the compact section bar. */}
      <div className="hidden items-center justify-between gap-4 border-b border-[var(--line)] pb-4 lg:flex">
        <div className="flex min-w-0 items-center gap-2">
          <LegalWordmark className="h-4 w-auto shrink-0 text-[var(--ink)]" />
          <span className="truncate text-xl font-semibold text-[var(--ink)]">Правовые документы</span>
        </div>
        <LegalReadingToolbarActions />
      </div>

      <div className={cn("mt-4 lg:mt-9", tocVisible && "lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-16")}>
        {main}
        {/* top-24 matches the fixed header's cleared height (same offset headings use via
            scroll-mt-24) so the sticky sidebar settles below it instead of sliding underneath. */}
        {tocVisible ? <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{sidebar}</div> : null}
      </div>
    </div>
  );
}

export function LegalReadingShell(props: LegalReadingLayoutProps) {
  return (
    <LegalReadingSettingsProvider>
      <LegalReadingLayout {...props} />
    </LegalReadingSettingsProvider>
  );
}
