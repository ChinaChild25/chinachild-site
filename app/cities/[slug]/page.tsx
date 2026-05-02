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

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) {
    return buildMetadata({
      title: "Город не найден | ChinaChild",
      description: "Запрошенный город отсутствует в каталоге.",
      path: `/cities/${slug}`,
    });
  }
  return buildMetadata({
    title: `Курсы китайского языка ${city.inCity} онлайн — школа ChinaChild`,
    description: `Онлайн-курсы китайского языка для жителей ${city.ofCity}. Лицензированная программа HSK 1–2, мини-группы до 5 человек, индивидуальные занятия. ${
      city.licensedRegion
        ? "Налоговый вычет 13% — до 15 600 ₽ в год."
        : "Удобное расписание, преподаватели ЮФУ и ДГТУ, носитель путунхуа."
    }`,
    path: `/cities/${city.slug}`,
    keywords: [
      `курсы китайского ${city.inCity}`,
      `учить китайский ${city.inCity}`,
      `школа китайского ${city.name}`,
      `репетитор китайского ${city.name} онлайн`,
      `HSK ${city.name}`,
    ],
  });
}

function buildLocalBusinessGraph(city: CityData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "@id": `${SITE_URL}/cities/${city.slug}#localbusiness`,
        name: `${SITE_NAME} — ${city.name}`,
        url: `${SITE_URL}/cities/${city.slug}`,
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
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
    ],
  };
}

export default async function CityLandingPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Города", path: "/cities" },
          { name: city.name, path: `/cities/${city.slug}` },
        ]}
      />
      <JsonLd data={buildLocalBusinessGraph(city)} id={`city-${city.slug}-localbusiness`} />

      <PageHero
        eyebrow={city.name}
        title={`Курсы китайского языка ${city.inCity} онлайн`}
        description={
          city.licensedRegion
            ? `ChinaChild — онлайн-школа китайского языка с образовательной лицензией ${LICENSE_REGION.toLowerCase()}. Мини-группы до 5 человек, индивидуальные занятия, программа HSK 1–2 за 6 месяцев. Налоговый вычет 13% — до 15 600 ₽ в год.`
            : `ChinaChild — онлайн-школа китайского языка с лицензированной программой HSK 1–2. Курс доступен из любой точки ${city.ofCity} и пригородов: ${city.suburbs}. Расписание подбираем под ваш часовой пояс.`
        }
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card-block card-violet-soft">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              {city.licensedRegion ? "Лицензия Москвы" : "Лицензированная программа"}
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              {city.licensedRegion
                ? `Образовательная лицензия выдана ${LICENSE_REGION}. Документ о прохождении программы дополнительного профессионального образования можно использовать для возврата налогового вычета 13%.`
                : `Программа лицензирована ${LICENSE_REGION}. Получаете документ о прохождении программы дополнительного профессионального образования по итогам курса.`}
            </p>
          </article>
          <article className="card-block card-cream">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Удобное расписание
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Расписание занятий подстраиваем под ваш часовой пояс — {city.timezone}.
              Можно подобрать удобное окно — утром до работы, вечером или в выходные.
            </p>
          </article>
          <article className="card-block card-lime-soft">
            <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Сдача HSK {city.inCity}
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Готовим к официальному экзамену HSK, который сдают в {city.hskCenter}.
              Помогаем выбрать ближайшую дату и зарегистрироваться через chinesetest.cn.
            </p>
          </article>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Почему {city.name} выбирает ChinaChild
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              ChinaChild работает онлайн, поэтому курс доступен из любой точки {city.ofCity}{" "}
              и пригородов — {city.suburbs}. Это удобно тем, кто живёт далеко от центра города:
              не нужно тратить часы на дорогу до офлайн-школы.
            </p>
            {city.hook ? <p>{city.hook}</p> : null}
            <p>
              Преподаватели школы — выпускники ЮФУ и ДГТУ с опытом 10+ лет, плюс носитель
              языка. Программа HSK 1–2 рассчитана на достижение разговорного уровня за 6
              месяцев. Дальше можно продолжить обучение на платформе вплоть до HSK 6.
            </p>
            <p>
              Для подготовки к официальному экзамену HSK школа не является экзаменационным
              центром, но помогает выбрать ближайшую дату — в {city.name} это{" "}
              {city.hskCenter}. Регистрация на экзамен идёт через chinesetest.cn —
              обычно за 4–5 недель до даты.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses/online-chinese" className={buttonStyles({})}>
              Онлайн-курс с нуля
            </Link>
            <Link href="/courses/hsk-preparation" className={buttonStyles({ variant: "secondary" })}>
              Подготовка к HSK
            </Link>
            <Link
              href="/courses/chinese-for-kids"
              className={buttonStyles({ variant: "secondary" })}
            >
              Школьникам 12+
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Контакты для жителей {city.ofCity}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                Звоните или пишите — отвечаем в течение рабочего дня. Все консультации
                бесплатны. Учитываем ваш часовой пояс — {city.timezone}.
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
                source={`city-${city.slug}-contact-card`}
              >
                Записаться на пробное
              </LeadModal>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-link to other cities for topical authority */}
      <section className="page-shell-wide section-space">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1e1e1e] leading-[1.2]">
          Другие города
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {cities
            .filter((c) => c.slug !== city.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link href={`/cities/${c.slug}`} className="tag-pill">
                  {c.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
