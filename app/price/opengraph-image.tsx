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
    subtitle: "Стоимость модулей и курсов · документы для социального вычета",
    footer: "chinachild.ru / price",
    background: "#efeae0",
    imagePath: "/og/price.png",
    imageMime: "image/png",
    cta: "Смотреть цены",
  });
}
