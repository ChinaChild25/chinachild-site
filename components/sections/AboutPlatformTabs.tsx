"use client";

import Image from "next/image";
import { useState } from "react";

export type AboutPlatformTab = {
  id: string;
  label: string;
  caption: string;
  media: string;
  mediaAlt: string;
};

export default function AboutPlatformTabs({ tabs }: { tabs: AboutPlatformTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* Segmented control — strictly one row на любой ширине.
          Сетка с равными колонками: ничего не оверфлоит, не переносится во второй ряд. */}
      <div
        role="tablist"
        aria-label="Возможности платформы ChinaChild"
        className="grid w-full grid-cols-5 gap-1 rounded-[14px] bg-white/55 p-1 sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`about-platform-panel-${tab.id}`}
              id={`about-platform-tab-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={`flex min-w-0 items-center justify-center rounded-[10px] px-1 py-2 text-center text-[11px] font-medium leading-[1.15] tracking-[-0.005em] transition-colors sm:px-2.5 sm:py-2.5 sm:text-[13px] lg:text-sm ${
                isActive
                  ? "bg-[#262626] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "text-[#262626]/72 hover:bg-white/55 hover:text-[#262626]"
              }`}
            >
              <span className="block break-words">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        id={`about-platform-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`about-platform-tab-${active.id}`}
        className="flex min-w-0 flex-col gap-3"
      >
        <div className="overflow-hidden rounded-[20px] bg-[#262626] p-2 sm:p-3">
          <Image
            key={active.media}
            src={active.media}
            alt={active.mediaAlt}
            width={1512}
            height={982}
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 50vw, 92vw"
            className="aspect-[1512/982] w-full rounded-[12px] object-cover"
            priority={false}
          />
        </div>
        <p
          className="text-sm leading-[1.5] text-[#262626]/70 sm:text-[15px]"
          aria-live="polite"
        >
          {active.caption}
        </p>
      </div>
    </div>
  );
}
