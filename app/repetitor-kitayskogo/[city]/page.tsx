import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { cities, getCityBySlug, getCitySlugs, type CityData } from "@/lib/cities";
import { buildMetadata } from "@/lib/metadata";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

type PageProps = {
  params: Promise<{ city: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) {
    return buildMetadata({
      title: "Репетитор китайского — город не найден | ChinaChild",
      description: "Город отсутствует в каталоге.",
      path: `/repetitor-kitayskogo/${slug}`,
    });
  }
  return buildMetadata({
    title: `Репетитор китайского языка ${city.inCity} онлайн — школа ChinaChild`,
    description: `Репетитор китайского ${city.inCity}: индивидуальные онлайн-занятия с преподавателями ЮФУ и ДГТУ, носителем путунхуа, AI-тренажёр иероглифов. ${
      city.licensedRegion
        ? "Налоговый вычет 13% — до 15 600 ₽ в год."
        : "Подбираем расписание под ваш часовой пояс."
    }`,
    path: `/repetitor-kitayskogo/${city.slug}`,
    keywords: [
      `репетитор китайского ${city.name}`,
      `репетитор китайского ${city.inCity}`,
      `учитель китайского ${city.name} онлайн`,
      `индивидуальные занятия китайским ${city.name}`,
      `преподаватель путунхуа ${city.name}`,
      `HSK подготовка ${city.name}`,
    ],
  });
}

function buildTutorGraph(city: CityData) {
  const url = `${SITE_URL}/repetitor-kitayskogo/${city.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "ProfessionalService", "EducationalOrganization"],
        "@id": `${url}#tutor`,
        name: `${SITE_NAME} — репетитор китайского ${city.inCity}`,
        url,
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        priceRange: "от 4 999 ₽",
        areaServed: {
          "@type": "City",
          name: city.name,
          sameAs: city.wikipedia,
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "RU",
          addressRegion: city.region,
          addressLocality: city.name,
        },
        serviceType: [
          "Индивидуальные занятия китайским",
          "Подготовка к HSK",
          "Постановка произношения путунхуа",
        ],
        provider: { "@id": `${SITE_URL}#organization` },
        ...(city.licensedRegion
          ? {
              hasCredential: {
                "@type": "EducationalOccupationalCredential",
                name: `Образовательная лицензия — ${LICENSE_PROGRAM}`,
                recognizedBy: {
                  "@type": "Organization",
                  name: LICENSE_REGION,
                },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Репетитор китайского",
            item: `${SITE_URL}/repetitor-kitayskogo`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${city.name}`,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function RepetitorCityPage({ params }: PageProps) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Репетитор китайского", path: "/repetitor-kitayskogo" },
          { name: city.name, path: `/repetitor-kitayskogo/${city.slug}` },
        ]}
      />
      <JsonLd data={buildTutorGraph(city)} id={`tutor-${city.slug}-graph`} />

      <PageHero
        eyebrow={`Репетитор · ${city.name}`}
        title={`Репетитор китайского языка ${city.inCity} онлайн`}
        description={
          city.licensedRegion
            ? `Индивидуальные онлайн-занятия китайским ${city.inCity}. Лицензированная программа HSK 1–2, преподаватели ЮФУ и ДГТУ, носитель путунхуа, AI-тренажёр иероглифов. Налоговый вычет 13% — до 15 600 ₽ в год.`
            : `Индивидуальные онлайн-занятия китайским ${city.inCity}. Лицензированная программа HSK 1–2, преподаватели ЮФУ и ДГТУ с опытом 10+ лет, носитель путунхуа. Часовой пояс — ${city.timezone}.`
        }
        primaryCta={{ label: "Записаться к репетитору", modal: true }}
        secondaryCta={{ label: "Курсы школы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card-block card-violet-soft">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Кто будет вести
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Репетиторы школы — выпускники ЮФУ и ДГТУ с опытом преподавания
              10+ лет, плюс носитель путунхуа Чжао Ли. Подбираем под цели:
              базовый китайский, HSK, бизнес-китайский, постановку произношения.
            </p>
          </article>
          <article className="card-block card-cream">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Расписание под {city.name}
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Часовой пояс — {city.timezone}. Можно поставить занятия утром до
              работы, вечером после смены или в выходные. Согласовываем с
              репетитором лично — без жёсткой сетки.
            </p>
          </article>
          <article className="card-block card-lime-soft">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Сдача HSK {city.inCity}
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Готовим к официальному экзамену в {city.hskCenter}.
              Помогаем выбрать дату и зарегистрироваться через chinesetest.cn —
              обычно за 4–5 недель до экзамена.
            </p>
          </article>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
            Чем индивидуальный репетитор отличается от группы
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              Индивидуальный формат подходит тем, кому важно идти в своём темпе:
              разбирать ровно те ошибки, которые мешают именно вам, готовиться к
              конкретному собеседованию или экзамену, заниматься в удобные окна
              по графику. Темп урока — ваш темп.
            </p>
            <p>
              Мини-группа до 5 человек — это другой формат: общий темп, живая
              разговорная практика, групповая динамика и стоимость в 1,5–2 раза
              ниже за час. Для общей подготовки к HSK 1–2 группа эффективнее по
              соотношению цена/результат.
            </p>
            <p>
              Часто оптимальное решение — комбинация: группа как основа курса +
              1–2 индивидуальных занятия в месяц для разбора слабых мест. На
              бесплатном пробном поможем подобрать формат под ваши цели.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/compare/mini-group-vs-individual"
              className={buttonStyles({})}
            >
              Сравнение группы и индивидуального
            </Link>
            <Link
              href="/courses/hsk-preparation"
              className={buttonStyles({ variant: "secondary" })}
            >
              Подготовка к HSK
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-[2rem]">
                Связаться с репетитором {city.inCity}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                Звоните или пишите — отвечаем в течение рабочего дня. Учитываем
                ваш часовой пояс ({city.timezone}). Все консультации бесплатны.
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-base text-white/80">
                {CONTACT_EMAIL}
              </a>
              <LeadModal
                triggerClassName={buttonStyles({
                  variant: "secondary",
                  size: "large",
                  className: "mt-4 w-fit",
                })}
                source={`tutor-${city.slug}-contact-card`}
              >
                Записаться к репетитору
              </LeadModal>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
          Репетитор китайского в других городах
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {cities
            .filter((c) => c.slug !== city.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/repetitor-kitayskogo/${c.slug}`}
                  className="tag-pill"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          <li>
            <Link href={`/cities/${city.slug}`} className="tag-pill">
              Курсы китайского {city.inCity} →
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
