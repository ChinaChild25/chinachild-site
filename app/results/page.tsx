import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Результаты учеников ChinaChild — кейсы и прогресс",
    description:
      "Что получают ученики ChinaChild: разговорный уровень за 6 месяцев, сертификат HSK 2, мини-группы до 5, налоговый вычет до 19 500 ₽ — реальные кейсы.",
    path: "/results",
    keywords: [
      "результаты обучения китайскому",
      "кейсы учеников китайского",
      "выучить китайский за 6 месяцев",
      "разговорный китайский результат",
    ],
  });
}

const outcomes = [
  {
    title: "Разговорный уровень за 6 месяцев",
    body:
      "Базовая лицензированная программа выводит на уровень HSK 2. Это около 300 слов, 347 иероглифов и уверенный диалог в типовых ситуациях.",
    card: "card-violet-soft",
  },
  {
    title: "Сертификат HSK как документ для резюме",
    body:
      "После HSK 2 многие ученики идут на официальный экзамен и получают международный сертификат, который признают вузы Китая и работодатели.",
    card: "card-cream",
  },
  {
    title: "Готовность к поступлению в Китае",
    body:
      "Дальнейшее обучение на платформе доводит до HSK 4–5 — уровней, признанных большинством университетов Китая для поступления на бакалавриат и магистратуру.",
    card: "card-lime-soft",
  },
];

const cases = [
  {
    name: "Школьник 12 лет",
    track: "Индивидуальный курс HSK 1",
    body:
      "За 4 месяца — постановка фонетики, 174 иероглифа уровня HSK 1, уверенный диалог о школе, увлечениях и семье. Сейчас готовится к HSK 2.",
    card: "card-cream-soft",
  },
  {
    name: "Взрослый с нуля",
    track: "Мини-группа HSK 1–2",
    body:
      "За 6 месяцев — разговорный уровень HSK 2. По итогу программы запланирована поездка в Шанхай и сдача официального экзамена.",
    card: "card-sky-soft",
  },
  {
    name: "Сотрудник логистической компании",
    track: "Корпоративная мини-группа",
    body:
      "За 8 месяцев — деловая переписка с китайскими поставщиками, понимание счетов и спецификаций, простые созвоны без переводчика.",
    card: "card-peach-soft",
  },
];

export default function ResultsPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Результаты", path: "/results" },
        ]}
      />
      <PageHero
        eyebrow="Результаты"
        title="Что получают ученики ChinaChild"
        description="Программа рассчитана на конкретный измеримый результат: разговорный уровень HSK 2 за 6 месяцев, сертификат HSK для резюме и понятный маршрут к HSK 4 для поступления в Китай."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {outcomes.map((o) => (
            <article key={o.title} className={`card-block h-full ${o.card}`}>
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                {o.title}
              </h2>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{o.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Кейсы учеников</h2>
          <p className="section-description">
            Маршруты, по которым проходят разные категории учеников — от школьников до
            корпоративных команд.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cases.map((c) => (
            <article key={c.name} className={`card-block h-full ${c.card}`}>
              <span className="tag-pill">{c.track}</span>
              <h3 className="mt-6 text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                {c.name}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Хотите такой же результат?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Запишитесь на бесплатное пробное занятие. Преподаватель оценит ваш уровень,
            поставит цель и подберёт подходящий курс.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source="results-cta"
            >
              Записаться на пробное
            </LeadModal>
            <Link href="/reviews" className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}>
              Отзывы учеников
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
