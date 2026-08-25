import { careers } from "@/lib/careers";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Вакансия в ChinaChild";

export function generateStaticParams() {
  return careers.map((career) => ({ slug: career.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function CareerOgImage({ params }: Params) {
  const { slug } = await params;
  const career = careers.find((item) => item.slug === slug);

  return renderGenericOg({
    badge: career?.direction ?? "Карьера",
    title: career?.title ?? "Работа в ChinaChild",
    subtitle: career?.summary ?? "Полностью онлайн и без лишней бюрократии.",
    footer: "chinachild.ru / careers",
    background: "#e7e6ff",
    cta: "Откликнуться",
  });
}
