import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Работа в ChinaChild";

export default function CareersOgImage() {
  return renderGenericOg({
    badge: "Карьера",
    title: "Делать китайский ближе. Вместе.",
    subtitle: "Полностью онлайн, гибкая занятость и 4 открытые роли.",
    footer: "chinachild.ru / careers",
    background: "#dce8ff",
    cta: "Смотреть вакансии",
  });
}
