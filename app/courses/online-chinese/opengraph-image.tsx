export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Онлайн-курсы китайского языка с нуля — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "Курсы",
    title: "Онлайн-курсы китайского языка с нуля",
    subtitle: "HSK 1–2 за 6 месяцев · мини-группы до 5 · документы для соцвычета",
    price: "от 4 999 ₽",
    background: "#e7e6ff",
    cta: "Записаться",
  });
}
