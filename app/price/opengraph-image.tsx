import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Цены ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Цены",
    title: "Тарифы и оплата",
    subtitle: "Стоимость курсов, помесячная оплата, скидки и налоговый вычет 13%.",
    footer: "chinachild.ru / price",
    accentColor: "#5c5cff",
    background: "#efeae0",
    imagePath: "/og/price.png",
    imageMime: "image/png",
  });
}
