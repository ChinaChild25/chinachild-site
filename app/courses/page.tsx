import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { courseMediaBySlug, type CourseMedia } from "@/lib/course-media";
import { buildMetadata } from "@/lib/metadata";
import { createCoursesItemListSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Курсы китайского языка онлайн — все программы школы ChinaChild",
    description:
      "Все курсы китайского онлайн в ChinaChild: HSK 1–6, для школьников 12+, взрослых и бизнеса. Налоговый вычет: до 19 500 ₽ за себя или до 14 300 ₽ за ребёнка.",
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
    tone: "card-course-violet",
    badge: "Самый популярный",
  },
  {
    title: "Подготовка к HSK 1–6",
    description:
      "Все уровни международного экзамена. Базовый курс HSK 1–2 за 6 месяцев, далее на платформе до HSK 6.",
    href: "/courses/hsk-preparation",
    tone: "card-course-blue",
    badge: "HSK 1–6",
  },
  {
    title: "Китайский язык для детей",
    description:
      "Индивидуальный модуль для школьников строго с 12 лет: 17 990 ₽ за месяц и 8 занятий по 60 минут. Продолжение — отдельным модулем по решению ученика.",
    href: "/courses/chinese-for-kids",
    tone: "card-course-sand",
    badge: "12+",
  },
  {
    title: "Китайский для взрослых",
    description:
      "Курс для взрослых без подготовки: разговорный уровень за 6 месяцев. Гибкий формат, налоговый вычет 13%.",
    href: "/courses/chinese-for-adults",
    tone: "card-course-rose",
    badge: "С нуля",
  },
  {
    title: "Бизнес-китайский для команд",
    description:
      "Корпоративное обучение по программе HSK 1–2. Отчётность для HR, закрывающие документы, ЭДО.",
    href: "/courses/business-chinese",
    tone: "card-course-lime",
    badge: "Корпоративно",
  },
];

const coursesCardMediaOverride: Record<string, CourseMedia> = {
  "chinese-for-kids": {
    src: "/heroes/kitajskij-dlya-detej-card.webp",
    alt: "Курс китайского языка для детей 12+ в ChinaChild",
    width: 2000,
    height: 3000,
  },
};

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
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
        heroToneClass="card-hero-courses"
        illustration="/heroes/courses.webp"
        illustrationAlt="Иероглиф 课程 курсы"
        illustrationWidth={1500}
        illustrationHeight={1500}
      />
      <JsonLd data={createCoursesItemListSchema()} id="courses-item-list-schema" />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const slug = c.href.replace("/courses/", "");
            const media = coursesCardMediaOverride[slug] ?? courseMediaBySlug[slug];
            const isKidsCardMedia = media?.src === "/heroes/kitajskij-dlya-detej-card.webp";
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`courses-card card-block group flex h-full flex-col transition hover:-translate-y-1 ${c.tone}`}
              >
                <div className="courses-card-copy flex h-full flex-col">
                  <span className="tag-pill self-start">{c.badge}</span>
                  <h2 className="mt-6 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                    {c.title}
                  </h2>
                  <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{c.description}</p>
                  <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                    Подробнее →
                  </div>
                </div>
                {media ? (
                  <Image
                    src={media.src}
                    alt=""
                    width={media.width}
                    height={media.height}
                    className={`courses-card-art${isKidsCardMedia ? " courses-card-art-kids" : ""}`}
                    sizes="(min-width: 1280px) 220px, (min-width: 768px) 36vw, 44vw"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Какой курс китайского выбрать
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              Программы школы ChinaChild построены на единой методике, лицензированной
              департаментом города Москвы. Если вы взрослый и никогда не учили китайский —
              начинайте с курса для взрослых: лицензированная программа HSK 1–2, разговорный
              уровень за 6 месяцев. Если вы школьник строго с 12 лет — доступен
              индивидуальный модуль: 17 990 ₽ за месяц и 8 занятий по 60 минут,
              без подписки и автоматического списания. После него можно продолжить
              обучение, отдельно оплатив следующий модуль.
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
