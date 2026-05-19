"use client";

import { GoogleAnalytics as NextGA } from "@next/third-parties/google";
import { useConsent } from "@/lib/consent/context";

export function GoogleAnalytics() {
  const { consent } = useConsent();
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || process.env.NODE_ENV !== "production") return null;
  if (consent?.analytics !== true) return null;
  return <NextGA gaId={id} />;
}
