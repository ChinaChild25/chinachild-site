"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

export type AboutPlatformTab = {
  id: string;
  label: string;
  caption: string;
  media: StaticImageData;
  mediaAlt: string;
};

export default function AboutPlatformTabs({ tabs }: { tabs: AboutPlatformTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const [preloadMedia, setPreloadMedia] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) {
      setPreloadMedia(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPreloadMedia(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div ref={rootRef} className="flex w-full min-w-0 flex-col gap-4">
      {/* Segmented control — strictly one row на любой ширине.
          Сетка с равными колонками: ничего не оверфлоит, не переносится во второй ряд. */}
      <div
        role="tablist"
        aria-label="Возможности платформы ChinaChild"
        className="relative isolate grid w-full grid-cols-5 gap-1 overflow-hidden rounded-full border border-white/[0.24] bg-[rgba(22,22,26,0.28)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-[18px] backdrop-brightness-[1.04] backdrop-saturate-[155%] [-webkit-backdrop-filter:blur(18px)_saturate(155%)_brightness(1.04)] sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.025)_34%,rgba(255,255,255,0.10)_66%,rgba(255,255,255,0.02)_100%)]"
        />
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
              className={`relative z-10 flex min-w-0 items-center justify-center rounded-full px-1 py-2 text-center text-[11px] font-medium leading-[1.15] tracking-[-0.005em] text-white transition-[background-color,border-color,box-shadow,color] sm:px-2.5 sm:py-2.5 sm:text-[13px] lg:text-sm ${
                isActive
                  ? "border border-white/[0.34] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.09)_52%,rgba(255,255,255,0.14))] shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(255,255,255,0.10)]"
                  : "border border-transparent text-white/80 hover:bg-white/[0.08] hover:text-white"
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
          <div className="relative aspect-[1512/982] w-full">
            {(preloadMedia ? tabs : [active]).map((tab) => {
              const isActive = tab.id === active.id;
              return (
                <Image
                  key={tab.id}
                  src={tab.media}
                  alt={isActive ? tab.mediaAlt : ""}
                  aria-hidden={!isActive}
                  fill
                  sizes="(min-width: 1280px) 720px, (min-width: 1024px) 50vw, 92vw"
                  loading={preloadMedia ? "eager" : "lazy"}
                  fetchPriority={isActive ? "auto" : "low"}
                  className={`rounded-[12px] object-cover ${
                    isActive ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                />
              );
            })}
          </div>
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
