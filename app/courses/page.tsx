import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Курсы китайского языка онлайн — все программы школы ChinaChild",
    description:
      "Все курсы китайского языка онлайн в школе ChinaChild: HSK 1–6, для детей 12+, для взрослых, бизнес-китайский. Лицензированная программа, мини-группы до 5 человек, налоговый вычет 13%.",
    path: "/courses",
    keywords: [
      "курсы китайского языка онлайн",
      "курсы китайского для детей",
      "курсы китайского для взрослых",
      "обучение китайскому языку",
      "учить китайский онлайн",
      "подготовка к HSK",
    ],
  });
}

const courses = [
  {
    title: "Онлайн-курсы китайского с нуля",
    description:
      "Лицензированная программа HSK 1–2 для подростков 12+ и взрослых. Мини-группы до 5 человек или индивидуально.",
    href: "/courses/online-chinese",
    tone: "card-violet-soft",
    badge: "Самый популярный",
  },
  {
    title: "Подготовка к HSK 1–6",
    description:
      "Все уровни международного экзамена. Базовый курс HSK 1–2 за 6 месяцев, далее на платформе до HSK 6.",
    href: "/courses/hsk-preparation",
    tone: "card-cream",
    badge: "HSK 1–6",
  },
  {
    title: "Китайский язык для детей",
    description:
      "Индивидуальный курс или мини-группа для школьников 12+. Скидка 10% при оплате за 2 месяца.",
    href: "/courses/chinese-for-kids",
    tone: "card-lime-soft",
    badge: "12+",
  },
  {
    title: "Китайский для взрослых",
    description:
      "Курс для взрослых без подготовки: разговорный уровень за 6 месяцев. Гибкий формат, налоговый вычет 13%.",
    href: "/courses/chinese-for-adults",
    tone: "card-sky",
    badge: "С нуля",
  },
  {
    title: "Бизнес-китайский для команд",
    description:
      "Корпоративное обучение по программе HSK 1–2. Отчётность для HR, закрывающие документы, ЭДО.",
    href: "/courses/business-chinese",
    tone: "card-peach-soft",
    badge: "Корпоративно",
  },
];

export default function CoursesIndexPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Курсы", path: "/courses" },
        ]}
      />
      <PageHero
        eyebrow="Курсы школы"
        title="Все курсы китайского языка онлайн в ChinaChild"
        description="Подбираем формат под уровень, возраст и темп: мини-группа до 5 человек, индивидуальные занятия или корпоративное обучение. Программа лицензирована департаментом города Москвы."
        primaryCta={{ label: "Записаться на пробное", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${c.tone}`}
            >
              <span className="tag-pill self-start">{c.badge}</span>
              <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">{c.description}</p>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                Подробнее →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            Какой курс китайского выбрать
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              Программы школы ChinaChild построены на единой методике, лицензированной
              департаментом города Москвы. Если вы взрослый и никогда не учили китайский —
              начинайте с курса для взрослых: лицензированная программа HSK 1–2, разговорный
              уровень за 6 месяцев. Если вы школьник от 12 лет — рекомендуем индивидуальный
              курс с преподавателем со скидкой 10%.
            </p>
            <p>
              Если у вас уже есть какая-то база и вы готовитесь к экзамену HSK — переходите на
              страницу подготовки к HSK. Там разобраны все шесть уровней и сроки. Если вы —
              руководитель команды и хотите обучить сотрудников, посмотрите формат бизнес-
              китайского: мини-группы под расписание команды, отчётность HR, закрывающие
              документы.
            </p>
            <p>
              Если вы не уверены в своём уровне, пройдите бесплатный тест на уровень HSK на
              сайте chinachild.ru. По результатам мы порекомендуем подходящий курс.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
