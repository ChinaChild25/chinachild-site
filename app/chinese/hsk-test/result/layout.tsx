import type { Metadata } from "next";

// Transient result page — content depends on user-specific test state.
// Crawlers should see noindex; canonical points to the landing page.
export const metadata: Metadata = {
  title: "Результат теста HSK — ChinaChild",
  description: "Персональный результат теста HSK. Откройте /chinese/hsk-test, чтобы пройти тест заново.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/chinese/hsk-test" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
