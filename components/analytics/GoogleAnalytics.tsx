import { GoogleAnalytics as NextGA } from "@next/third-parties/google";

// gtag.js loads unconditionally on production. Consent Mode v2 (configured
// via lib/consent/gtag.ts and driven by ConsentProvider) is what governs
// whether real measurement happens: until the user opts in, ad_storage and
// analytics_storage stay 'denied', so Google receives only anonymised cookie-
// less pings — never personalised hits or cross-session IDs. This replaces
// the previous hard-block (return null) approach.
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || process.env.NODE_ENV !== "production") return null;
  return <NextGA gaId={id} />;
}
