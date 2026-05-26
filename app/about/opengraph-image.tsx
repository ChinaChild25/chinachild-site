import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "О школе ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "О школе",
    title: "О школе ChinaChild",
    subtitle: "Лицензированная онлайн-школа китайского языка с собственной платформой.",
    footer: "chinachild.ru / about",
    accentColor: "#1b1b1b",
    background: "#efeae0",
    imagePath: "/og/about.png",
    imageMime: "image/png",
  });
}
