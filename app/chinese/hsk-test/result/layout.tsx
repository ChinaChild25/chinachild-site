import type { Metadata } from "next";

// Transient result page — content depends on user-specific test state.
// Crawlers should see noindex; canonical points to the landing page.
//
// The brush-calligraphy accent font (Ma Shan Zheng) used by the certificate is
// self-hosted and text-subsetted in globals.css (`--font-hanzi-callig`), so it
// no longer needs a global next/font import — that shipped ~32 KiB of
// render-blocking @font-face CSS to every page for 4 glyphs.
export const metadata: Metadata = {
  title: "Результат теста HSK — ChinaChild",
  description: "Персональный результат теста HSK. Откройте /chinese/hsk-test, чтобы пройти тест заново.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/chinese/hsk-test" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
