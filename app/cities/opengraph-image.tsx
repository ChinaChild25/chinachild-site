import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Курсы китайского языка по городам";

export default function Image() {
  return renderGenericOg({
    badge: "Города",
    title: "Китайский онлайн по всей России",
    subtitle: "Москва, Санкт-Петербург, Казань, Екатеринбург, Новосибирск и другие города.",
    footer: "chinachild.ru / cities",
    background: "#e8f1f4",
    cta: "Выбрать город",
  });
}
