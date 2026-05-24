"use client";

import { useConsent } from "@/lib/consent/context";

export default function CookieSettingsButton() {
  const { reopenBanner } = useConsent();
  return (
    <button
      type="button"
      onClick={reopenBanner}
      className="text-sm text-white/55 underline underline-offset-4 transition hover:text-white"
    >
      Настройки cookies
    </button>
  );
}
