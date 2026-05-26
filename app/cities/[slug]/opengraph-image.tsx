import { getCityBySlug, getCitySlugs } from "@/lib/cities";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Курсы китайского по городам — ChinaChild";

export function generateStaticParams() {
  return getCitySlugs().map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function CityOgImage({ params }: Params) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  return renderGenericOg({
    badge: "Города",
    title: city ? `Курсы китайского ${city.inCity}` : "Курсы китайского в России",
    subtitle: city
      ? `${city.timezone} · подготовка к HSK · пробный урок 0 ₽`
      : "Онлайн-школа ChinaChild для городов России",
    footer: "chinachild.ru / cities",
    background: "#eff7dd",
    cta: "Выбрать курс",
  });
}
