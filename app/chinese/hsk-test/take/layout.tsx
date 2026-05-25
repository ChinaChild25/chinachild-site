import type { Metadata } from "next";

// Transient flow step — requires localStorage state from the landing page.
// Direct crawler visits would see a redirect, so we noindex to keep the
// indexed surface clean and canonicalize back to the landing.
export const metadata: Metadata = {
  title: "Прохождение теста HSK — ChinaChild",
  description: "Шаг прохождения интерактивного теста HSK. Откройте /chinese/hsk-test, чтобы начать.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/chinese/hsk-test" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
