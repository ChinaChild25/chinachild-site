"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  /** Slug статьи для сегментации в Я.Метрике (по какой статье дочитывают). */
  slug: string;
};

const MILESTONES = [25, 50, 75, 100] as const;

/**
 * Шлёт `scroll_depth` в Я.Метрику при достижении 25/50/75/100% длины статьи.
 * Каждый рубеж — один раз за визит страницы. Считаем от верха основного
 * <article> до его низа, а не от документа — header/footer не должны
 * засчитываться как «прочитано».
 *
 * Зачем: помогает понять, какие статьи бросают на первом экране, а какие
 * дочитывают. Не прямой SEO-фактор, но даёт сигнал «что переписать».
 */
export default function ScrollDepthTracker({ slug }: Props) {
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const fired = new Set<number>();

    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const articleH = article.scrollHeight;
      // Сколько от низа статьи уже видно/прокручено сверху.
      const scrolled = Math.min(articleH, Math.max(0, -rect.top + viewportH));
      const pct = articleH > 0 ? (scrolled / articleH) * 100 : 0;

      for (const m of MILESTONES) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          trackEvent("scroll_depth", { depth: m, slug });
        }
      }

      if (fired.size === MILESTONES.length) {
        window.removeEventListener("scroll", onScroll);
      }
    };

    let ticking = false;
    const throttled = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    };

    window.addEventListener("scroll", throttled, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", throttled);
  }, [slug]);

  return null;
}
