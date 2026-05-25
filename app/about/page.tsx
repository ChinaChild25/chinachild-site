import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import YandexLocalSection from "@/components/sections/YandexLocalSection";
import AboutPlatformTabs, {
  type AboutPlatformTab,
} from "@/components/sections/AboutPlatformTabs";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import {
  absoluteUrl,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_PROGRAM,
  LICENSE_REGION_INSTRUMENTAL,
  SITE_URL,
} from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title:
      "О школе ChinaChild — онлайн-школа китайского языка с лицензией Москвы",
    description:
      "Онлайн-школа китайского с лицензией Москвы: своя платформа без Zoom, мини-группы до 5, программа HSK 1–2, налоговый вычет 13%.",
    path: "/about",
    keywords: [
      "о школе chinachild",
      "онлайн школа китайского",
      "лицензированная школа китайского",
      "школа китайского языка",
      "онлайн обучение китайскому",
      "разговорный китайский школа",
      "школа китайского с лицензией Москвы",
    ],
  });
}

const principles = [
  {
    eyebrow: "Полностью онлайн",
    title: "Учим из дома, с работы и из дороги",
    body:
      "Уроки идут прямо в браузере — ничего ставить и обновлять не нужно, ссылка на занятие живёт в личном кабинете. Платформа работает на компьютере, планшете и телефоне, поэтому пропустить урок из-за командировки или переезда практически невозможно.",
    card: "card-violet-soft",
  },
  {
    eyebrow: "Лицензия и налоговый вычет",
    title: "Программа HSK 1–2 в реестре Москвы",
    body:
      "Школа работает по образовательной лицензии Департамента образования и науки Москвы. Программа дополнительного профессионального образования соответствует HSK 1–2. После курса выдаём документ — его прикладывают к заявлению на налоговый вычет 13% (до 15 600 ₽ в год).",
    card: "card-cream",
  },
  {
    eyebrow: "Мини-группы и обратная связь",
    title: "До 5 человек — у каждого есть голос",
    body:
      "70% урока — практика речи. В группе на 30 человек ученик молчит и слушает; у нас каждый успевает 5–8 раз произнести фразу, услышать поправку и снова сказать. Параллельно работает индивидуальный формат со скидкой 10% для подростков с 12 лет.",
    card: "card-lime-soft",
  },
];

const platformTabs: AboutPlatformTab[] = [
  {
    id: "video-calls",
    label: "Урок",
    caption:
      "Урок идёт прямо в браузере — без Zoom и без установки. Слышно собеседника, видно доску, всё под рукой.",
    media: "/platform/video-calls.webp",
    mediaAlt: "Видеоурок китайского языка в личном кабинете ChinaChild",
  },
  {
    id: "schedule",
    label: "Расписание",
    caption:
      "Календарь занятий с напоминаниями за час до урока. Синхронизируется с Google Calendar и iCal.",
    media: "/platform/schedule.webp",
    mediaAlt: "Расписание занятий в личном кабинете школы китайского",
  },
  {
    id: "ai-trainer",
    label: "Тренажёр",
    caption:
      "Иероглифы по порядку черт, тоны через микрофон, перевод и подсказка — встроенный ассистент на базе ChatGPT.",
    media: "/platform/ai-trainer.webp",
    mediaAlt: "AI-тренажёр иероглифов и тонов в кабинете ChinaChild",
  },
  {
    id: "recordings",
    label: "Записи",
    caption:
      "Каждое занятие автоматически попадает в кабинет — пересмотреть тему или догнать пропущенный урок легко.",
    media: "/platform/recordings.webp",
    mediaAlt: "Записи уроков китайского языка в личном кабинете",
  },
  {
    id: "progress",
    label: "Прогресс",
    caption:
      "Личный план обучения по HSK 1–6: видно сданные темы и сколько осталось до сертификата.",
    media: "/platform/progress.webp",
    mediaAlt: "Трекинг прогресса по HSK в личном кабинете ChinaChild",
  },
];

const platformPoints = [
  {
    title: "Один кабинет вместо пяти ссылок",
    body:
      "Урок, расписание, чат с куратором, домашка, записи и тренажёр — в одном личном кабинете. Не нужно искать ссылку на Zoom и переписку в трёх мессенджерах.",
  },
  {
    title: "Видеозаписи и конспекты",
    body:
      "Каждый урок автоматически попадает в кабинет в хорошем качестве. Пропустил занятие — посмотрел запись; забыл правило — открыл конспект к нужной теме.",
  },
  {
    title: "Тренажёр между уроками",
    body:
      "30 минут в день закрывают главный провал онлайн-обучения. Тренажёр проверяет тоны через микрофон, иероглифы по порядку черт и ведёт короткий диалог в роли собеседника.",
  },
  {
    title: "Расписание и напоминания",
    body:
      "Календарь занятий синхронизируется с привычным календарём на телефоне, а уведомления приходят за час до урока. Школьники и взрослые с плотным графиком перестают пропускать.",
  },
];

const journey = [
  {
    month: "0 → 1 мес.",
    title: "Пиньинь, тоны, первые иероглифы",
    body:
      "Учим читать пиньинь, ставим четыре тона на микрофоне тренажёра, разбираем структуру иероглифа. Цель — понять, что китайский — это система, а не хаос знаков.",
  },
  {
    month: "1 → 3 мес.",
    title: "HSK 1 — простые диалоги",
    body:
      "150 слов, базовая грамматика, бытовые сценарии: знакомство, числа, время, семья. К концу третьего месяца ученик заказывает чай и спрашивает дорогу.",
  },
  {
    month: "3 → 5 мес.",
    title: "HSK 2 — связная речь",
    body:
      "300 слов, прошедшее время, сравнения, причины. Ученики собирают фразы в связную речь и впервые проходят пробный HSK на платформе.",
  },
  {
    month: "5 → 6 мес.",
    title: "Разговорный уровень",
    body:
      "Финальный спринт: уроки с носителем, ролевые диалоги, мини-презентации. На выходе ученик уверенно говорит на бытовые темы и сдаёт HSK 2 на сертификат.",
  },
];

const comparison = [
  {
    feature: "Лицензия и налоговый вычет 13%",
    chinachild: true,
    selfStudy: false,
    tutor: false,
    massCourse: false,
  },
  {
    feature: "Видеозаписи всех уроков в кабинете",
    chinachild: true,
    selfStudy: "частично",
    tutor: false,
    massCourse: true,
  },
  {
    feature: "Мини-группы до 5 человек",
    chinachild: true,
    selfStudy: false,
    tutor: "1 на 1",
    massCourse: false,
  },
  {
    feature: "Преподаватель + носитель + AI",
    chinachild: true,
    selfStudy: false,
    tutor: false,
    massCourse: false,
  },
  {
    feature: "AI-тренажёр тонов и иероглифов",
    chinachild: true,
    selfStudy: false,
    tutor: false,
    massCourse: false,
  },
  {
    feature: "Документ об образовании",
    chinachild: true,
    selfStudy: false,
    tutor: false,
    massCourse: "редко",
  },
];

const audiences = [
  {
    badge: "Подросткам 12+",
    body:
      "Школьники, которым нужен китайский для поступления, ОГЭ-сценариев или дополнительного языка. Скидка 10% при оплате за 2 месяца — родителям и так понятно, что результат не за неделю.",
  },
  {
    badge: "Взрослым с нуля",
    body:
      "Бухгалтеры, дизайнеры, инженеры, мамы в декрете — все, кто хочет начать с чистого листа. Учим без академической муштры, но по структуре HSK.",
  },
  {
    badge: "Работающим с Китаем",
    body:
      "Закупки, логистика, маркетплейсы, фабрики. Курс «Бизнес-китайский» с Анастасией Ериной — лексика переговоров и переписки с поставщиками.",
  },
  {
    badge: "Готовящимся к HSK",
    body:
      "Поступление в китайский вуз, стажировка, виза. Преподаватель ведёт ученика к нужному уровню HSK по официальной структуре экзамена.",
  },
];

const facts = [
  { value: "HSK 1–6", label: "все уровни международного экзамена" },
  { value: "6 мес.", label: "до разговорного уровня по программе HSK 2" },
  { value: "до 5", label: "человек в мини-группе" },
  { value: "13%", label: "налоговый вычет — лицензия Москвы" },
];

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${absoluteUrl("/about")}#aboutpage`,
  url: absoluteUrl("/about"),
  name: "О школе ChinaChild",
  description:
    "ChinaChild — лицензированная онлайн-школа китайского языка для подростков с 12 лет и взрослых. Программа HSK 1–2, мини-группы до 5 человек, своя обучающая платформа.",
  mainEntity: { "@id": `${SITE_URL}/#organization` },
  isPartOf: { "@id": `${SITE_URL}/#website` },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${absoluteUrl("/about")}#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "Что такое ChinaChild?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChinaChild — это онлайн-школа китайского языка с образовательной лицензией Москвы. Программа HSK 1–2, формат полностью онлайн, мини-группы до 5 человек и собственная обучающая платформа без Zoom.",
      },
    },
    {
      "@type": "Question",
      name: "Как устроено обучение в школе?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Уроки идут прямо в браузере. У ученика есть личный кабинет с расписанием, чатом, домашкой, записями уроков и тренажёром. Между занятиями — 30 минут в день в тренажёре: тоны, иероглифы и короткие диалоги с умным помощником.",
      },
    },
    {
      "@type": "Question",
      name: "Сколько времени занимает курс?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Базовый маршрут — 6 месяцев до разговорного уровня HSK 2: первый месяц — пиньинь и тоны, к третьему — HSK 1, к пятому — HSK 2, шестой — разговорный спринт с носителем.",
      },
    },
    {
      "@type": "Question",
      name: "Можно ли получить налоговый вычет?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да. Школа работает по лицензии Департамента образования и науки Москвы, выдаёт документ о прохождении программы. Этот документ прикладывают к заявлению на налоговый вычет 13% — до 15 600 ₽ в год.",
      },
    },
  ],
};

function Mark({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2e7d32]/12 text-[#2e7d32]"
        aria-label="да"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7.5l3.2 3 6.3-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#262626]/8 text-[#262626]/45"
        aria-label="нет"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 2l10 10M12 2L2 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-[#4b4b4b]">{value}</span>
  );
}

export default function AboutPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "О школе", path: "/about" },
        ]}
      />
      <JsonLd data={aboutSchema} id="about-page" />
      <JsonLd data={faqSchema} id="about-faq" />

      <PageHero
        eyebrow="О школе"
        title="ChinaChild — лицензированная онлайн-школа китайского языка"
        description="Помогаем подросткам с 12 лет и взрослым без подготовки выйти на разговорный китайский за 6 месяцев. Программа HSK 1–2 в реестре Москвы, своя обучающая платформа без Zoom и налоговый вычет 13% по итогам курса."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Методика школы", href: "/methodology" }}
        illustration="/heroes/about.webp"
        illustrationAlt="ChinaChild — онлайн-школа китайского языка с лицензией Москвы"
        illustrationWidth={1254}
        illustrationHeight={1254}
      />

      {/* === FACTS STRIP =================================================== */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <Reveal key={fact.label}>
              <div className="card-block h-full bg-[var(--background-2)]">
                <div className="text-[2.5rem] font-medium tracking-[-0.02em] leading-[1.05] text-[var(--ink)]">
                  {fact.value}
                </div>
                <p className="mt-3 text-sm leading-[1.55] text-[var(--muted-strong)]">
                  {fact.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === MISSION (split: dark accent + text) =========================== */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <Reveal>
            <div className="card-block card-block-lg card-ink h-full">
              <span className="tag-pill tag-pill-ink">Зачем мы существуем</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-[2.25rem]">
                Чтобы китайский перестал быть «когда-нибудь потом»
              </h2>
              <p className="mt-5 text-base leading-7 text-white/85">
                Большинство людей бросают китайский в первые два месяца — не из-за
                сложности языка, а из-за неудобных инструментов: ссылка на
                видеозвонок теряется, домашка лежит в одном чате, преподаватель
                пишет в другом, конспект — в третьем. Мы собрали школу так, чтобы
                убрать это трение и оставить только то, что важно: регулярные
                занятия, понятную программу и человека, который ведёт ученика до
                результата.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="card-block card-block-lg card-cream h-full">
              <span className="tag-pill">Что мы делаем</span>
              <h3 className="mt-5 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626] sm:text-[1.75rem]">
                Онлайн-школа китайского с лицензией, платформой и программой
              </h3>
              <ul className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
                <li className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#262626]" />
                  <span>
                    Учим китайскому с нуля до разговорного уровня по программе
                    HSK 1–2 — за 6 месяцев в мини-группах.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#262626]" />
                  <span>
                    Работаем по образовательной лицензии Москвы, по итогам выдаём
                    документ для налогового вычета.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#262626]" />
                  <span>
                    Уроки идут на собственной платформе: видеозвонок, чат, домашка,
                    записи занятий и тренажёр — в одной вкладке браузера.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#262626]" />
                  <span>
                    На каждом курсе работают трое: русскоязычный методист,
                    преподаватель-носитель из Китая и умный помощник в кабинете —
                    он подсказывает ученику между уроками.
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === 3 PRINCIPLES ================================================= */}
      <section className="page-shell-wide section-space">
        <div className="max-w-3xl">
          <span className="tag-pill">Три кита школы</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Почему здесь удобно и комфортно заниматься
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[#4b4b4b]">
            ChinaChild — это не «ещё одни курсы китайского». Школа собрана вокруг
            трёх решений, которые делают онлайн-обучение действительно рабочим, а
            не «вебинарами с Zoom-усталостью».
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map((p) => (
            <Reveal key={p.title}>
              <article className={`card-block h-full ${p.card}`}>
                <div className="text-sm font-medium text-[#262626]/55">
                  {p.eyebrow}
                </div>
                <h3 className="mt-4 text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === PLATFORM SHOWCASE (text + real screenshots mosaic) ============ */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet-soft">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <span className="tag-pill">Собственная платформа</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2.25rem]">
                Урок, чат, домашка и записи — в одном кабинете
              </h2>
              <p className="mt-5 text-base leading-[1.65] text-[#4b4b4b]">
                Мы перенесли в личный кабинет всё, что обычно расползается по
                разным сервисам и мессенджерам. Получается простая вещь: меньше
                трения — больше регулярности. А регулярность в китайском важнее,
                чем талант.
              </p>
              <ul className="mt-6 grid gap-4">
                {platformPoints.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#726BFF]"
                    />
                    <div>
                      <h3 className="text-base font-medium text-[#262626]">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-sm leading-[1.55] text-[#4b4b4b]">
                        {point.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/methodology"
                className="mt-7 inline-flex text-sm font-semibold text-[#262626] underline underline-offset-4 hover:no-underline"
              >
                Подробнее о методике и платформе →
              </Link>
            </div>
            <Reveal className="min-w-0">
              <AboutPlatformTabs tabs={platformTabs} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* === JOURNEY TIMELINE ============================================= */}
      <section className="page-shell-wide section-space">
        <div className="max-w-3xl">
          <span className="tag-pill">Маршрут за 6 месяцев</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Что ученик умеет в конце каждого этапа
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[#4b4b4b]">
            Программа лицензирована и разбита на этапы: после каждого блока есть
            понятный результат — не «прошли тему», а «уже могу сказать».
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journey.map((step, i) => (
            <Reveal key={step.month}>
              <article
                className={`card-block h-full ${
                  ["card-cream", "card-sky", "card-lime-soft", "card-violet-soft"][i]
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-medium tracking-[-0.01em] text-[#262626]">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-medium text-[#262626]/55">
                    {step.month}
                  </span>
                </div>
                <h3 className="mt-4 text-[1.125rem] font-medium leading-[1.25] text-[#262626]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">
                  {step.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === COMPARISON TABLE ============================================= */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream-soft">
          <div className="max-w-3xl">
            <span className="tag-pill">Чем мы отличаемся</span>
            <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
              Школа vs самоучитель, репетитор и массовые курсы
            </h2>
            <p className="mt-4 text-base leading-[1.65] text-[#4b4b4b]">
              Короткое сравнение по тому, что чаще всего сравнивают перед стартом:
              лицензия, формат группы, записи, инструменты.
            </p>
          </div>
          {/* Desktop: full 5-column table */}
          <div className="mt-8 hidden md:block">
            <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-sm font-medium text-[#262626]/55">
                  <th className="py-2 pr-4 font-medium">Что важно</th>
                  <th className="py-2 px-4 font-medium text-[#262626]">
                    ChinaChild
                  </th>
                  <th className="py-2 px-4 font-medium">Самоучитель</th>
                  <th className="py-2 px-4 font-medium">Репетитор</th>
                  <th className="py-2 px-4 font-medium">Массовые курсы</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`rounded-[14px] ${
                      i % 2 === 0 ? "bg-white/70" : "bg-white/40"
                    }`}
                  >
                    <td className="py-3 pr-4 pl-4 align-middle text-[#262626] first:rounded-l-[14px]">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <Mark value={row.chinachild} />
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <Mark value={row.selfStudy} />
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <Mark value={row.tutor} />
                    </td>
                    <td className="py-3 px-4 align-middle last:rounded-r-[14px]">
                      <Mark value={row.massCourse} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: each row becomes a card — никакого горизонтального скролла. */}
          <ul className="mt-7 grid gap-3 md:hidden" role="list">
            {comparison.map((row) => (
              <li
                key={row.feature}
                className="rounded-[16px] bg-white/75 p-4"
              >
                <div className="text-[15px] font-medium leading-[1.3] text-[#262626]">
                  {row.feature}
                </div>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#262626]/[0.04] px-3 py-2">
                    <dt className="text-[#262626]">ChinaChild</dt>
                    <dd className="m-0">
                      <Mark value={row.chinachild} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <dt className="text-[#4b4b4b]">Самоучитель</dt>
                    <dd className="m-0">
                      <Mark value={row.selfStudy} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <dt className="text-[#4b4b4b]">Репетитор</dt>
                    <dd className="m-0">
                      <Mark value={row.tutor} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <dt className="text-[#4b4b4b]">Массовые курсы</dt>
                    <dd className="m-0">
                      <Mark value={row.massCourse} />
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* === TEAM PHILOSOPHY (links to /team) ============================= */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <Reveal>
            <div className="card-block card-block-lg card-sky h-full">
              <span className="tag-pill">Команда</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2.25rem]">
                Методист, носитель и AI — три уровня преподавания
              </h2>
              <p className="mt-5 text-base leading-[1.65] text-[#4b4b4b]">
                Китайский нельзя выучить только с русскоязычным методистом —
                нужна живая речь. И только с носителем тоже нельзя — взрослому
                ученику с русским языком в голове нужна логика и сравнение.
                Поэтому у нас на каждом курсе работает связка людей и инструментов,
                а не один универсальный «преподаватель на всё».
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/team" className={buttonStyles({})}>
                  Все преподаватели
                </Link>
                <Link
                  href="/methodology"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Как устроена методика
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4">
            <Reveal>
              <article className="card-block card-cream">
                <div className="tag-pill">Русскоязычный методист</div>
                <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">
                  Выпускники Даляньского университета и других китайских вузов.
                  Ставят фонетику, объясняют грамматику через русский язык и
                  заранее знают, где русскоязычный ученик ошибётся.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article className="card-block card-violet-soft">
                <div className="tag-pill">Носитель путунхуа</div>
                <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">
                  Преподаватель из Китая с сертификатом HSK 6 даёт живую речь,
                  культурный контекст и разговорную скорость, к которой не
                  привыкаешь по учебнику.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article className="card-block card-lime-soft">
                <div className="tag-pill">Умный помощник в кабинете</div>
                <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">
                  Не заменяет преподавателя — держит ритм между уроками: напоминает
                  слабые слова, слушает произношение и поднимает нужные задания в
                  тренажёре. Работает круглосуточно.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* === AUDIENCES ==================================================== */}
      <section className="page-shell-wide section-space">
        <div className="max-w-3xl">
          <span className="tag-pill">Кому подходит</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Кого мы учим в ChinaChild
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[#4b4b4b]">
            Школа работает с четырьмя типами учеников. Программа и темп
            подстраиваются под цель — поступление, экзамен, работа или просто
            интерес.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {audiences.map((a, i) => (
            <Reveal key={a.badge}>
              <article
                className={`card-block h-full ${
                  ["card-violet-soft", "card-cream-soft", "card-lime-soft", "card-sky-soft"][i]
                }`}
              >
                <div className="tag-pill">{a.badge}</div>
                <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === LICENSE & DOCS (compact, links to /license) ================== */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <span className="tag-pill">Лицензия и документы</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2.25rem]">
                Образовательная лицензия Москвы и налоговый вычет 13%
              </h2>
              <p className="mt-5 text-base leading-[1.65] text-[#4b4b4b]">
                Школа ведёт деятельность на основании лицензии
                {" "}{LICENSE_REGION_INSTRUMENTAL}. Программа {LICENSE_PROGRAM}
                {" "}соответствует международной системе HSK и регулируется ФЗ-273
                «Об образовании в Российской Федерации». По итогам обучения
                выдаём документ — его прикладывают к заявлению на налоговый вычет
                13% до 15&nbsp;600 ₽ в год.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/license" className={buttonStyles({})}>
                  Посмотреть лицензию
                </Link>
                <Link
                  href="/courses"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Все курсы
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Reveal>
                <figure className="m-0 rounded-[18px] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <Image
                    src="/license/license-scan.webp"
                    alt="Образовательная лицензия ChinaChild — основная страница"
                    title="Образовательная лицензия ChinaChild"
                    width={800}
                    height={1132}
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 45vw"
                    className="h-auto w-full rounded-[10px] object-contain"
                  />
                </figure>
              </Reveal>
              <Reveal>
                <figure className="m-0 rounded-[18px] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <Image
                    src="/license/license-app-1.webp"
                    alt="Приложение к образовательной лицензии ChinaChild с печатью"
                    title="Приложение к лицензии ChinaChild"
                    width={800}
                    height={1132}
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 45vw"
                    className="h-auto w-full rounded-[10px] object-contain"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* === YANDEX LOCAL (map + reviews) ================================ */}
      <YandexLocalSection />

      {/* === CONTACTS CTA ================================================= */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="tag-pill tag-pill-ink">Остались вопросы?</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Расскажем про лицензию, программу и формат лично
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                На пробном занятии покажем личный кабинет, проверим произношение
                и подберём маршрут под вашу цель — разговор, HSK, поступление
                или работа. Отвечаем в течение рабочего дня.
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-base text-white/80"
              >
                {CONTACT_EMAIL}
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                <LeadModal
                  triggerClassName={buttonStyles({
                    variant: "secondary",
                    size: "large",
                  })}
                  source="about-contact-card"
                >
                  Записаться на пробное
                </LeadModal>
                <Link
                  href="/diagnostic"
                  className={buttonStyles({
                    size: "large",
                    className: "bg-white/15 text-white hover:bg-white/25",
                  })}
                >
                  Пройти диагностику
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
