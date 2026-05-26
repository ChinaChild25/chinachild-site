import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Китайский с нуля — хаб ChinaChild";

export default async function LearnBeginnersOgImage() {
  return renderGenericOg({
    badge: "С нуля",
    title: "Китайский с нуля — всё в одном месте",
    subtitle:
      "Пиньинь · Тоны · Иероглифы · Грамматика HSK 1 · Пошаговый план для взрослых и подростков 12+",
    footer: "chinachild.ru / learn / beginners",
    background: "#f4f0e8",
  });
}
