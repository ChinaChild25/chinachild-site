export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Корпоративный китайский для команд — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "Курсы",
    title: "Корпоративный китайский для команд",
    subtitle: "Программа HSK 1–2 · отчётность для HR · закрывающие документы и ЭДО",
    price: "по запросу",
    background: "#ffe7d6",
    cta: "Записаться",
  });
}
