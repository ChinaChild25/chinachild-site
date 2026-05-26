import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Отзывы учеников ChinaChild";

export default function Image() {
  return renderGenericOg({
    badge: "Отзывы",
    title: "Отзывы учеников ChinaChild",
    subtitle: "Истории учеников о курсе, преподавателях и прогрессе в китайском.",
    footer: "chinachild.ru / reviews",
    accentColor: "#1b1b1b",
    background: "#efeae0",
  });
}
