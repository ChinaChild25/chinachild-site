"use client";

import { useConsent } from "@/lib/consent/context";

export default function CookieSettingsButton() {
  const { reopenBanner } = useConsent();
  return (
    <button
      type="button"
      onClick={reopenBanner}
      className="text-sm text-[#6b6b6b] underline underline-offset-4 transition hover:text-[#262626]"
    >
      Настройки cookies
    </button>
  );
}
