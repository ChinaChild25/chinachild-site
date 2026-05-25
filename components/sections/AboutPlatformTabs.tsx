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
    <div className="flex flex-col gap-4">
      {/* Tabs row — horizontally scrollable on mobile, wraps on desktop. */}
      <div
        role="tablist"
        aria-label="Возможности платформы ChinaChild"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible"
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
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium leading-none tracking-[-0.005em] transition-colors ${
                isActive
                  ? "bg-[#262626] text-white"
                  : "bg-white/70 text-[#262626] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        id={`about-platform-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`about-platform-tab-${active.id}`}
        className="flex flex-col gap-3"
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
