import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Китайский словарь ChinaChild";

export default function Image() {
  return renderGenericOg({
    badge: "Словарь",
    title: "Китайский словарь HSK",
    subtitle: "Слова, пиньинь, перевод, примеры и списки HSK 2.0 / 3.0.",
    footer: "chinachild.ru / dictionary",
    background: "#f4f0e8",
    cta: "Открыть словарь",
  });
}
