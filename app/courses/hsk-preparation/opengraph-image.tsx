export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Подготовка к HSK 1–6 онлайн — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "HSK 1–6",
    title: "Подготовка к HSK 1–6 онлайн",
    subtitle: "Все уровни международного экзамена · преподаватели ЮФУ и ДГТУ · опыт 10+ лет",
    accentColor: "#1b1b1b",
    background: "#efeae0",
  });
}
