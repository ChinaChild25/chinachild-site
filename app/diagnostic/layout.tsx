import type { Metadata } from "next";
import { DiagnosticProvider } from "@/lib/diagnostic/state";
import { buildMetadata } from "@/lib/metadata";

// Дифференцируем /diagnostic от /chinese/hsk-test: тут адаптивный AI-тест с
// GPT-4o-разбором, типажом и радарной диаграммой. Описание и ключи не
// пересекаются с «тест HSK» — за классическим тестом ходит /chinese/hsk-test.
export const metadata: Metadata = buildMetadata({
  title: "AI-диагностика китайского — узнайте свой типаж | ChinaChild",
  description:
    "AI-диагностика китайского за 7 минут: адаптивный CAT-тест, GPT-4o-разбор, ваш типаж изучающего, радар по шести навыкам и время до беглости.",
  path: "/diagnostic",
  keywords: [
    "AI диагностика китайского",
    "адаптивный тест по китайскому",
    "CAT тест китайский язык",
    "типаж изучающего китайский",
    "сильные стороны в китайском",
    "разбор китайского GPT",
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
