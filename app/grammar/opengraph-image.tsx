import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Грамматика китайского языка ChinaChild";

export default function Image() {
  return renderGenericOg({
    badge: "Грамматика",
    title: "Грамматика китайского языка",
    subtitle: "Правила, конструкции, частицы и порядок слов с примерами по HSK.",
    footer: "chinachild.ru / grammar",
    background: "#eef5c8",
    cta: "Открыть правила",
  });
}
