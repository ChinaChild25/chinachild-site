import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Корпоративное обучение китайскому — ChinaChild";

export default async function CorporateOgImage() {
  return renderGenericOg({
    badge: "B2B",
    title: "Китайский для команд — программа под бизнес",
    subtitle:
      "HSK 1–2 · Переговоры · Деловая переписка · Лицензия Москвы · ЭДО · Отчёты HR",
    footer: "chinachild.ru / corporate",
    background: "#cddcee",
  });
}
