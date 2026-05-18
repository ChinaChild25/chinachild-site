import { GoogleAnalytics as NextGA } from "@next/third-parties/google";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || process.env.NODE_ENV !== "production") return null;
  return <NextGA gaId={id} />;
}
