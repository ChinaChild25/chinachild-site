import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Глоссарий китайского языка ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Глоссарий",
    title: "Термины китайского языка",
    subtitle: "HSK, пиньинь, путунхуа, тоны и ключевые понятия с разбором.",
    footer: "chinachild.ru / glossary",
    accentColor: "#3a4d12",
    background: "#f1f5dc",
    imagePath: "/og/glossary.png",
    imageMime: "image/png",
  });
}
