import type { Metadata } from "next";
import { DiagnosticProvider } from "@/lib/diagnostic/state";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Узнайте, какой вы китаист — AI-диагностика уровня | ChinaChild",
  description:
    "Семиминутная AI-диагностика: уровень HSK, сильные и слабые стороны, время до беглости. Адаптивный CAT-тест по китайскому.",
  path: "/diagnostic",
  keywords: [
    "тест на знание китайского",
    "уровень китайского онлайн",
    "AI диагностика китайского",
    "HSK тест онлайн",
    "адаптивный тест китайский",
  ],
});

export default function DiagnosticLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiagnosticProvider>
      {/* Скрываем глобальный header / footer / floating-CTA на experience-страницах,
          чтобы экран ощущался как самостоятельный продукт. Доступная навигация
          и брендирование возвращаются в финале (Result / Tutor). */}
      <style>{`
        body { padding-top: 0 !important; padding-bottom: 0 !important; }
        .site-shell > header,
        .site-shell > .floating-cta-shell,
        .site-shell .site-header,
        .site-shell footer,
        #__next > footer,
        .site-shell > footer { display: none !important; }
      `}</style>
      <div className="d-root">{children}</div>
    </DiagnosticProvider>
  );
}
