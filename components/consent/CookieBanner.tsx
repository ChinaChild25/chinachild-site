"use client";

import Link from "next/link";
import { useConsent } from "@/lib/consent/context";

export default function CookieBanner() {
  const { isBannerOpen, acceptAll, acceptNecessaryOnly } = useConsent();

  if (!isBannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Согласие на использование cookies"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[rgba(0,0,0,0.08)] bg-[#f8f7f2] text-[#262626] shadow-[0_-12px_32px_rgba(0,0,0,0.08)]"
    >
      <div className="page-shell-wide flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:py-5">
        <p className="max-w-2xl text-sm leading-[1.55] text-[#6b6b6b]">
          Мы используем cookies и сервисы аналитики (Яндекс Метрика, Google Analytics),
          чтобы понимать, какие страницы помогают выбрать курс. Подробнее — в{" "}
          <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-[#262626]">
            политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
          <button
            type="button"
            onClick={acceptNecessaryOnly}
            className="btn-pill btn-white"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="btn-pill btn-ink"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
