import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Курсы китайского языка ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Курсы",
    title: "Курсы китайского онлайн",
    subtitle: "HSK 1-6, школьникам 12+, взрослым и корпоративным командам.",
    footer: "chinachild.ru / courses",
    accentColor: "#5c5cff",
    background: "#e7e6ff",
    imagePath: "/og/courses.png",
    imageMime: "image/png",
  });
}
