"use client";

import { useEffect } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export default function VioletSpotlightController() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".violet-spotlight");

    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = clamp01((viewportHeight - rect.top) / (rect.height + viewportHeight));
      const fadeIn = smoothstep((progress - 0.16) / 0.12);
      const fadeOut = 1 - smoothstep((progress - 0.76) / 0.12);
      const opacity = clamp01(fadeIn * fadeOut);

      section.style.setProperty("--violet-spotlight-progress", opacity.toFixed(3));
      section.classList.toggle("is-violet-active", opacity > 0.52);
      section.classList.add("violet-spotlight--js");
    };

    const schedule = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      section.style.removeProperty("--violet-spotlight-progress");
      section.classList.remove("is-violet-active", "violet-spotlight--js");
    };
  }, []);

  return null;
}
