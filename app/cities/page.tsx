import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import { cities } from "@/lib/cities";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Курсы китайского языка по городам России — школа ChinaChild онлайн",
  description:
    "Онлайн-школа китайского ChinaChild с программой HSK 1–2. Доступна в Москве, Санкт-Петербурге, Казани, Екатеринбурге, Новосибирске и других городах России.",
  path: "/cities",
  keywords: [
    "курсы китайского по городам",
    "китайский онлайн города России",
    "школа китайского регионы",
  ],
});

const palette = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
];

export default function CitiesIndexPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Города", path: "/cities" },
        ]}
      />
      <PageHero
        eyebrow="Города"
        title="Курсы китайского языка в России"
        description="Учим онлайн со всей России. Подбираем расписание под ваш часовой пояс, готовим к ближайшему центру сдачи HSK. Выберите свой город, чтобы посмотреть локальную информацию."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city, idx) => (
            <Reveal key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                    {city.name}
                  </h2>
                  {city.licensedRegion ? (
                    <span className="tag-pill tag-pill-ink">Лицензия</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                  {city.timezone}. Сдача HSK — {city.hskCenter}.
                </p>
                <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                  Открыть страницу города →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
