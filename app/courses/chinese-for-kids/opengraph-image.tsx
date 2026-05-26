export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Китайский для школьников 12+ — ChinaChild";

import { renderCourseOg } from "@/lib/og-templates";

export default function Image() {
  return renderCourseOg({
    badge: "Курсы",
    title: "Китайский для школьников 12+ онлайн",
    subtitle: "Индивидуальный курс HSK 1–2 · скидка 10% при оплате за 2 месяца",
    price: "от 28 990 ₽",
    background: "#cfe0f4",
    cta: "Записаться",
  });
}
