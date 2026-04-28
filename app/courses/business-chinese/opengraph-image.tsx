export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Корпоративный китайский для команд — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "Корпоративно",
    title: "Корпоративный китайский для команд",
    subtitle: "Программа HSK 1–2 · отчётность для HR · закрывающие документы и ЭДО",
    accentColor: "#a04020",
    background: "#ffe7d6",
  });
}
