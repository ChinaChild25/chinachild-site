import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHero from "@/components/layout/PageHero";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  REGISTER_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Курсы китайского языка в Москве онлайн — школа ChinaChild",
    description:
      "Лицензированные онлайн-курсы китайского языка для жителей Москвы. Программа HSK 1–2, мини-группы до 5 человек, индивидуальные занятия. Образовательная лицензия выдана департаментом города Москвы — налоговый вычет 13%.",
    path: "/cities/moscow",
    keywords: [
      "курсы китайского в Москве",
      "учить китайский в Москве",
      "школа китайского Москва",
      "репетитор китайского Москва онлайн",
      "HSK Москва",
    ],
  });
}

const localBusinessGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id": `${SITE_URL}/cities/moscow#localbusiness`,
      name: `${SITE_NAME} — Москва`,
      url: `${SITE_URL}/cities/moscow`,
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      areaServed: {
        "@type": "City",
        name: "Москва",
        sameAs: "https://ru.wikipedia.org/wiki/Москва",
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
        addressRegion: "Москва",
        addressLocality: "Москва",
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        name: `Образовательная лицензия — ${LICENSE_PROGRAM}`,
        recognizedBy: { "@type": "Organization", name: LICENSE_REGION },
      },
    },
  ],
};

export default function MoscowLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Города", path: "/cities/moscow" },
          { name: "Москва", path: "/cities/moscow" },
        ]}
      />
      <JsonLd data={localBusinessGraph} id="moscow-localbusiness" />

      <PageHero
        eyebrow="Москва"
        title="Курсы китайского языка в Москве онлайн"
        description="ChinaChild — онлайн-школа китайского языка с образовательной лицензией департамента Москвы. Мини-группы до 5 человек, индивидуальные занятия, программа HSK 1–2 за 6 месяцев. Налоговый вычет 13% — до 15 600 ₽ в год."
        primaryCta={{ label: "Записаться на пробное", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card-block card-violet-soft">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Лицензия Москвы
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
              Образовательная лицензия выдана {LICENSE_REGION}. Документ о прохождении
              программы дополнительного профессионального образования можно использовать
              для возврата налогового вычета.
            </p>
          </article>
          <article className="card-block card-cream">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Удобный часовой пояс
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
              Расписание занятий по Московскому времени (MSK / UTC+3). Можно подобрать
              удобное окно — утром до работы или вечером.
            </p>
          </article>
          <article className="card-block card-lime-soft">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Сдача HSK в Москве
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
              Готовим к официальному экзамену HSK, который сдают в Институте Конфуция при
              МГУ и других центрах Москвы. Помогаем выбрать ближайшую дату.
            </p>
          </article>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            Почему москвичи выбирают ChinaChild
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              ChinaChild работает онлайн, поэтому курс доступен из любой точки Москвы и
              Подмосковья без поездок в учебный центр. Это удобно для тех, кто живёт в
              ТиНАО, Балашихе, Химках, Реутове или Зеленограде — не нужно тратить 1–2 часа
              на дорогу до офлайн-школы.
            </p>
            <p>
              Лицензия выдана департаментом города Москвы на программу {LICENSE_PROGRAM}.
              Это значит, что ученик-резидент Москвы может вернуть налоговый вычет 13% от
              стоимости обучения — до 15 600 ₽ в год — через личный кабинет ФНС или через
              работодателя.
            </p>
            <p>
              Преподаватели школы — выпускники ЮФУ и ДГТУ с опытом 10+ лет, плюс носитель
              языка. Программа HSK 1–2 рассчитана на достижение разговорного уровня за 6
              месяцев. Дальше можно продолжить обучение на платформе вплоть до HSK 6.
            </p>
            <p>
              Для подготовки к официальному экзамену HSK — школа не является
              экзаменационным центром, но помогает выбрать ближайшую дату в Институте
              Конфуция при МГУ или другом московском центре. Регистрация на экзамен идёт
              через chinesetest.cn.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses/online-chinese" className={buttonStyles({})}>
              Онлайн-курс с нуля
            </Link>
            <Link href="/courses/hsk-preparation" className={buttonStyles({ variant: "secondary" })}>
              Подготовка к HSK
            </Link>
            <Link href="/courses/chinese-for-kids" className={buttonStyles({ variant: "secondary" })}>
              Школьникам 12+
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-violet">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                Контакты для жителей Москвы
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                Звоните или пишите — отвечаем в течение рабочего дня по московскому
                времени. Все консультации бесплатны.
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-2xl font-bold tracking-[-0.02em]">
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-base text-white/80">
                {CONTACT_EMAIL}
              </a>
              <Link
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: "secondary", size: "large", className: "mt-4 w-fit" })}
              >
                Записаться на пробное
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
