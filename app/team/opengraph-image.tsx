import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Преподаватели ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Команда",
    title: "Преподаватели ChinaChild",
    subtitle: "Методисты, авторы курсов и носители путунхуа с открытыми профилями.",
    footer: "chinachild.ru / team",
    accentColor: "#1b1b1b",
    background: "#e7e6ff",
    imagePath: "/og/team.png",
    imageMime: "image/png",
  });
}
