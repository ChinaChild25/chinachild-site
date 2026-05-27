import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import FAQSection from "@/components/sections/FAQSection";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SITE_URL } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Корпоративное обучение китайскому — ChinaChild для бизнеса",
  description:
    "Бизнес-китайский для команд: HSK 1–2, переговоры, переписка с поставщиками. Лицензия Москвы, ЭДО, отчёты HR, закрывающие документы.",
  path: "/corporate",
  keywords: [
    "корпоративное обучение китайскому",
    "бизнес китайский",
    "китайский для компаний",
    "корпоративный курс китайского",
    "обучение сотрудников китайскому",
    "переговоры на китайском",
    "переписка с китайскими партнёрами",
  ],
});

const FORMATS = [
  {
    title: "HSK 1–2 для команды",
    description:
      "Базовая программа для сотрудников, которые впервые сталкиваются с китайским. 80 занятий, разговорный уровень за 6 месяцев, мини-группа до 5 человек.",
    href: "/courses/business-chinese",
    tone: "card-violet-soft",
    badge: "База",
    cta: "Подробнее о курсе",
  },
  {
    title: "Переговорщики и закупщики",
    description:
      "Углублённый курс для тех, кто ведёт переговоры с китайской стороной. Лексика контрактов, торговые термины, культурные паттерны, отказ без потери лица.",
    href: "/blog/business-chinese-online-courses",
    tone: "card-cream",
    badge: "B2B-переговоры",
    cta: "Кейсы импортёров",
  },
  {
    title: "Письменный регистр и WeChat",
    description:
      "Деловая переписка, шаблоны писем, общение в WeChat, грамотный отказ, эскалация. Подходит для логистики и закупок.",
    href: "/courses/business-chinese",
    tone: "card-lime-soft",
    badge: "Переписка",
    cta: "Записаться на демо",
  },
];

const ADVANTAGES = [
  {
    title: "Образовательная лицензия",
    body:
      "Л035-01298-77/04021301 от Департамента образования и науки г. Москвы. Закрывающие документы для бухгалтерии — без вопросов.",
  },
  {
    title: "Отчёты HR раз в месяц",
    body:
      "Прогресс по каждому сотруднику: посещаемость, итоги модулей, рекомендации преподавателя. Формат — Excel или CSV, на выбор.",
  },
  {
    title: "ЭДО через Контур / Диадок",
    body:
      "Подписываем договоры и акты по ЭДО — никаких бумажных оригиналов. Для крупных команд есть рамочные договоры.",
  },
  {
    title: "Гибкий график под команду",
    body:
      "Уроки в удобное для команды время: рабочие часы, после работы или сплит — например, 50% индивидуально, 50% в группе.",
  },
  {
    title: "Налоговый вычет и компенсация",
    body:
      "Сотрудники могут вернуть 13% НДФЛ как за обучение себя или ребёнка — это работает и при корпоративном обучении.",
  },
  {
    title: "Носитель путунхуа",
    body:
      "Чжао Ли (носитель путунхуа, родом из Хэбэя) ведёт занятия по живой речи — обязательная часть программ для переговорщиков.",
  },
];

const FAQ = [
  {
    question: "С какой команды имеет смысл начинать?",
    answer:
      "Минимальная мини-группа — 3 человека, максимальная — 5. Команды от 10 сотрудников разбиваем на две параллельные группы с общим менеджером. Если команда меньше 3 — берём индивидуальные занятия с гибким бюджетом.",
  },
  {
    question: "Можно ли начать обучение в течение месяца?",
    answer:
      "Да. Запуск — 2–3 недели от подписания договора. Мы успеваем согласовать программу, провести входное тестирование сотрудников, подобрать преподавателя и собрать расписание.",
  },
  {
    question: "Какие документы выдаём по итогам?",
    answer:
      "Договор на оказание образовательных услуг, акт о выполнении услуг, опционально — сертификат для каждого сотрудника по итогам модуля. Все документы — с лицензией школы.",
  },
  {
    question: "Что с НДС и закрывающими документами?",
    answer:
      "Школа работает по УСН без НДС, но как лицензированное образовательное учреждение. Закрывающие документы — акт и счёт-фактура без НДС. Это работает для большинства корпоративных контрактов.",
  },
  {
    question: "Есть ли пробное занятие для команды?",
    answer:
      "Да, обязательно. Перед заключением договора проводим бесплатный пробный урок для команды (45 минут), на котором преподаватель оценивает уровни, цели и обсуждает программу.",
  },
  {
    question: "Можно ли выкупить только модуль «переговоры»?",
    answer:
      "Да. Помимо полного курса HSK 1–2 мы делаем короткие модули по 8–16 занятий: переговоры, переписка, презентации, выезд в Китай. Подходит, если у команды уже есть база.",
  },
];

export default async function CorporateHub() {
  const posts = await getAllPosts();
  const businessPost = posts.find(
    (p) => p.slug === "business-chinese-online-courses",
  );

  const serviceGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${absoluteUrl("/corporate")}#service`,
        serviceType: "Корпоративное обучение китайскому языку",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Russia" },
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Компании и команды",
        },
        url: absoluteUrl("/corporate"),
        description:
          "Программы HSK 1–2 для команд, обучение переговорщиков и закупщиков, деловая переписка. Лицензия Москвы, ЭДО, закрывающие документы.",
        offers: {
          "@type": "Offer",
          url: absoluteUrl("/corporate"),
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          businessFunction: "https://purl.org/goodrelations/v1#ProvideService",
        },
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Бизнесу", path: "/corporate" },
        ]}
      />
      <JsonLd data={serviceGraph} id="corporate-service-graph" />

      <PageHero
        eyebrow="Корпоративное обучение"
        title="Китайский для команд — программа под бизнес-задачу"
        description="Лицензированная программа HSK 1–2 для сотрудников, обучение переговорщиков и закупщиков, шаблоны деловой переписки. Закрывающие документы, ЭДО, отчёты HR — для бухгалтерии и для HR-директора одновременно."
        primaryCta={{
          label: "Заявка для команды",
          modal: true,
          defaultCourse: "business-chinese",
        }}
        secondaryCta={{ label: "Курс бизнес-китайского", href: "/courses/business-chinese" }}
        variant="sky"
      />

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
          Три формата под задачи бизнеса
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {FORMATS.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${f.tone}`}
            >
              <span className="tag-pill self-start">{f.badge}</span>
              <h3 className="mt-5 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{f.description}</p>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                {f.cta} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
          Почему компании выбирают ChinaChild
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((a, idx) => (
            <article
              key={a.title}
              className={`card-block ${idx % 2 === 0 ? "card-cream-soft" : "card-violet-soft"}`}
            >
              <h3 className="text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626] leading-[1.2]">
                {a.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      {businessPost ? (
        <section className="page-shell-wide section-space">
          <div className="card-block card-block-lg card-cream">
            <span className="tag-pill">Кейс</span>
            <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
              Как импортёр электроники окупил курс за 4 месяца
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-[1.6] text-[#4b4b4b]">
              Команда из 8 человек прошла программу HSK 1–2 с уклоном в переговоры.
              Через 4 месяца сократили расходы на переводчика, начали вести
              предварительные переговоры с поставщиками напрямую — и обнаружили
              скидки, которые посредник не показывал. Полный кейс с цифрами —
              в статье.
            </p>
            <div className="mt-6">
              <Link
                href={`/blog/${businessPost.slug}`}
                className={buttonStyles({ variant: "secondary" })}
              >
                Прочитать кейс →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-lime-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Стоимость
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-[1.125rem] font-medium text-[#262626]">
                Базовая программа HSK 1–2
              </h3>
              <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">
                Мини-группа до 5 человек, 80 занятий, программа лицензирована.
                Стоимость зависит от размера команды, графика и формата (онлайн
                или гибрид). Минимальный бюджет — 250 000 ₽ за группу.
              </p>
            </div>
            <div>
              <h3 className="text-[1.125rem] font-medium text-[#262626]">
                Модуль «Переговоры» или «Переписка»
              </h3>
              <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">
                Короткая программа на 8–16 занятий для команд, у которых уже
                есть HSK 1–2. От 120 000 ₽ за группу. Цена включает разбор
                реальных кейсов команды.
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-[1.55] text-[#262626]/72">
            Подробную смету готовим после первой встречи. На ней разбираем задачу
            команды, формат, расписание, документооборот. Это бесплатно и без
            обязательств.
          </p>
        </div>
      </section>

      <FAQSection
        id="corporate-faq"
        title="Частые вопросы HR-директоров"
        items={FAQ}
        schemaId="corporate-faq-schema"
      />

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Подобрать программу под вашу команду
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Расскажите про задачу — размер команды, цель, сроки, формат. В течение
            рабочего дня вернёмся с предварительной программой и сметой.
            Без обязательств.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({
                variant: "secondary",
                size: "large",
              })}
              source="corporate-hub-cta"
              defaultCourse="business-chinese"
            >
              Заявка для команды
            </LeadModal>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              {CONTACT_PHONE}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
