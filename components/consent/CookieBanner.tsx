"use client";

import Link from "next/link";
import { useState } from "react";
import { useConsent } from "@/lib/consent/context";

export default function CookieBanner() {
  const { isBannerOpen, acceptAll, acceptNecessaryOnly, updatePreferences } = useConsent();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [analyticsPref, setAnalyticsPref] = useState(true);
  const [marketingPref, setMarketingPref] = useState(false);

  if (!isBannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Согласие на использование cookies"
      aria-live="polite"
      className="cookie-banner-shell"
    >
      <div className="cookie-banner-card">
        {!detailsOpen ? (
          <>
            <div className="flex items-start gap-3">
              <div className="text-2xl leading-none" aria-hidden>
                🍪
              </div>
              <div className="flex-1">
                <h2 className="cookie-banner-title">Cookies и аналитика</h2>
                <p className="cookie-banner-text">
                  Используем для понимания, как улучшить сайт. Подробнее в{" "}
                  <Link href="/privacy-policy" className="cookie-banner-link">
                    политике конфиденциальности
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={acceptNecessaryOnly}
                className="cookie-banner-btn cookie-banner-btn-secondary"
              >
                Только необходимые
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="cookie-banner-btn cookie-banner-btn-primary"
              >
                Принять все
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="cookie-banner-link-button"
            >
              Настроить
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Назад"
                className="cookie-banner-back"
              >
                ←
              </button>
              <h2 className="cookie-banner-title">Настройки cookies</h2>
            </div>
            <div className="mt-4 space-y-3">
              <CategoryRow
                title="Необходимые"
                description="Нужны для базовой работы сайта"
                checked
                disabled
              />
              <CategoryRow
                title="Аналитика"
                description="Помогают понять, как улучшить сайт"
                checked={analyticsPref}
                onChange={setAnalyticsPref}
              />
              <CategoryRow
                title="Маркетинг"
                description="Персонализация и реклама"
                checked={marketingPref}
                onChange={setMarketingPref}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                updatePreferences({ analytics: analyticsPref, marketing: marketingPref })
              }
              className="cookie-banner-btn cookie-banner-btn-primary mt-5 w-full"
            >
              Сохранить выбор
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className={`cookie-banner-row${disabled ? " is-disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="cookie-banner-checkbox"
      />
      <div className="min-w-0 flex-1">
        <div className="cookie-banner-row-title">{title}</div>
        <div className="cookie-banner-row-desc">{description}</div>
      </div>
    </label>
  );
}
