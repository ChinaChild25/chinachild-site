import type { Metadata } from "next";
import Image from "next/image";
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
        heroToneClass="card-hero-cities"
        illustration="/heroes/kursy-kitajskogo-v-gorodah-rossii.webp"
        illustrationAlt="Онлайн-курсы китайского языка ChinaChild для учеников из городов России"
        illustrationWidth={3024}
        illustrationHeight={1730}
        illustrationFill
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cities.map((city) => (
            <Reveal key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="group relative isolate block aspect-[748/734] overflow-hidden rounded-[8%] transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.012] focus-visible:-translate-y-1.5 focus-visible:scale-[1.012] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6c5ce7] active:translate-y-0 active:scale-[0.995] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <Image
                  src={`/cities/${city.slug}.webp`}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                />

                <div className="absolute inset-0 z-10 flex flex-col p-[7.5%]">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="max-w-[76%] text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.08] tracking-[-0.025em] text-[#171717]">
                      {city.name}
                    </h2>
                    {city.licensedRegion ? (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-semibold text-[#1b1b1b] shadow-sm backdrop-blur-sm">
                        Лицензия
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 max-w-[68%] text-[clamp(0.72rem,1vw,0.86rem)] leading-[1.35] text-[#303030]">
                    {city.timezone}
                  </p>
                  <span className="sr-only">
                    Сдача HSK — {city.hskCenter}.
                  </span>

                  <span
                    className="absolute bottom-[7.5%] left-[7.5%] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#171717] text-[#171717] opacity-60 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[17px] w-[17px] transition-transform duration-200 group-hover:rotate-90 group-focus-visible:rotate-90 motion-reduce:transition-none"
                    >
                      <path d="M4 20 20 4" />
                      <path d="M9 4h11v11" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
