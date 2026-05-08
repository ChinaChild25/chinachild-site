import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { cities } from "@/lib/cities";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Репетитор китайского языка онлайн — школа ChinaChild по городам",
  description:
    "Репетитор китайского языка онлайн в любом городе России: индивидуальные занятия с лицензированной программой HSK 1–2, преподаватели с опытом 10+ лет, носитель путунхуа.",
  path: "/repetitor-kitayskogo",
  keywords: [
    "репетитор китайского",
    "репетитор китайского онлайн",
    "репетитор китайского языка",
    "учитель китайского онлайн",
    "индивидуальные занятия китайским",
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

export default function RepetitorIndexPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Репетитор китайского", path: "/repetitor-kitayskogo" },
        ]}
      />
      <PageHero
        eyebrow="Репетитор онлайн"
        title="Репетитор китайского языка по всей России"
        description="Индивидуальные онлайн-занятия с преподавателями ЮФУ и ДГТУ, носителем путунхуа и методистом по AI-постановке тонов. Лицензия Департамента образования и науки города Москвы. Часовой пояс подбираем под ваш."
        primaryCta={{ label: "Записаться к репетитору", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
          Найдите репетитора в своём городе
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-[1.55] text-[#4b4b4b]">
          Все занятия проходят онлайн через видеосвязь и платформу с AI-тренажёром
          иероглифов, поэтому выбрать репетитора можно из любого города России.
          Ниже — страницы со специфическими для города нюансами: ближайший центр
          сдачи HSK, расписание под местный часовой пояс, налоговый вычет 13%
          для жителей региона лицензии.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city, idx) => (
            <Reveal key={city.slug}>
              <Link
                href={`/repetitor-kitayskogo/${city.slug}`}
                className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-[1.35rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                    Репетитор китайского {city.inCity}
                  </h3>
                  {city.licensedRegion ? (
                    <span className="tag-pill tag-pill-ink">Лицензия</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                  Индивидуальные онлайн-занятия для жителей {city.ofCity}.
                  Часовой пояс — {city.timezone}. Сдача HSK — {city.hskCenter}.
                </p>
                <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                  Открыть страницу города →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
            Чем репетитор онлайн отличается от группы
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              На индивидуальном занятии преподаватель работает только с вами:
              корректирует тоны, разбирает именно ваши ошибки в иероглифах,
              подстраивает темп. В мини-группе до 5 человек темп общий, зато
              есть живая разговорная практика и групповая динамика.
            </p>
            <p>
              Сравнение форматов и стоимости — в отдельной статье. Если ещё не
              решили, какой формат подойдёт, посмотрите её или сразу запишитесь
              на бесплатное пробное — там покажем оба формата и поможем выбрать.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/compare/mini-group-vs-individual"
              className={buttonStyles({ variant: "secondary", size: "large" })}
            >
              Сравнение форматов
            </Link>
            <Link
              href="/free-trial"
              className={buttonStyles({ size: "large" })}
            >
              Бесплатное пробное
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
