export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Китайский для взрослых онлайн — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "Курсы",
    title: "Китайский язык для взрослых онлайн с нуля",
    subtitle: "Лицензированный курс HSK 1–2 · разговорный уровень за 6 месяцев",
    price: "от 4 990 ₽",
    background: "#e9f4b5",
    cta: "Записаться",
  });
}
