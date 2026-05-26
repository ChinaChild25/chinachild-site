import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Методика ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Методика",
    title: "Платформа, AI и преподаватели",
    subtitle: "Как устроены уроки, тренажеры, записи занятий и прогресс по HSK.",
    footer: "chinachild.ru / methodology",
    background: "#e8f1f4",
    imagePath: "/og/methodology.png",
    imageMime: "image/png",
    cta: "Смотреть методику",
  });
}
