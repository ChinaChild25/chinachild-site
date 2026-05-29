import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Мини-группа или индивидуально — какой формат китайского выбрать",
  description:
    "Мини-группа до 5 vs индивидуально по китайскому: темп, стоимость, гибкость, мотивация. Что выбрать новичку и занятому взрослому — таблица сравнения.",
  path: "/compare/mini-group-vs-individual",
  keywords: [
    "мини-группа или индивидуально китайский",
    "групповые или индивидуальные занятия HSK",
    "сравнение форматов обучения китайскому",
    "что лучше группа или репетитор",
  ],
});

const rows: Array<{
  feature: string;
  group: string;
  individual: string;
}> = [
  {
    feature: "Темп",
    group: "Средний — равняется на группу",
    individual: "Свой — преподаватель подстраивается",
  },
  {
    feature: "Цена за час",
    group: "Существенно ниже",
    individual: "Выше",
  },
  {
    feature: "Гибкость расписания",
    group: "Фиксированное расписание группы",
    individual: "Перенос и изменения возможны",
  },
  {
    feature: "Разговорная практика",
    group: "Диалоги в парах и тройках, роли",
    individual: "1-на-1 с преподавателем, больше времени на речь",
  },
  {
    feature: "Социализация и мотивация",
    group: "Высокая — поддержка соучеников",
    individual: "Зависит от внутренней дисциплины",
  },
  {
    feature: "Контроль ошибок",
    group: "Преподаватель распределяет внимание",
    individual: "Каждая ошибка разбирается персонально",
  },
  {
    feature: "Скорость прогресса",
    group: "Стабильная, по программе",
    individual: "Можно ускорить за счёт интенсивности",
  },
];

export default function CompareFormatsPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Сравнения", path: "/compare/mini-group-vs-individual" },
          { name: "Группа или индивидуально", path: "/compare/mini-group-vs-individual" },
        ]}
      />
      <PageHero
        eyebrow="Сравнение"
        title="Мини-группа или индивидуально — что выбрать"
        description="Оба формата работают, но дают разный результат. Разбираем семь параметров — темп, цена, гибкость, мотивация, контроль, прогресс — чтобы вы выбрали под свою цель и характер."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream-soft">
          <table className="w-full text-left text-sm md:text-base">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.12)]">
                <th className="py-4 pr-4 font-semibold text-[#1b1b1b]">Параметр</th>
                <th className="py-4 pr-4 font-semibold text-[#1b1b1b]">Мини-группа</th>
                <th className="py-4 font-semibold text-[#1b1b1b]">Индивидуально</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-[rgba(0,0,0,0.06)]">
                  <td className="py-4 pr-4 font-medium text-[#1b1b1b]">{row.feature}</td>
                  <td className="py-4 pr-4 text-[#4b4b4b]">{row.group}</td>
                  <td className="py-4 text-[#4b4b4b]">{row.individual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-block card-block-lg card-violet-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Кому подходит мини-группа
            </h2>
            <p className="mt-4 text-base leading-[1.55] text-[#4b4b4b]">
              Подросткам 12+, студентам и взрослым, которые хотят учиться размеренно,
              экономно и в живой атмосфере. Группа задаёт ритм, поддерживает мотивацию,
              даёт реальные диалоги и снижает страх ошибки.
            </p>
            <Link
              href="/courses/online-chinese"
              className={`${buttonStyles({ size: "large" })} mt-6 w-fit`}
            >
              Курс с нуля в группе
            </Link>
          </div>
          <div className="card-block card-block-lg card-lime-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              Кому подходит индивидуально
            </h2>
            <p className="mt-4 text-base leading-[1.55] text-[#4b4b4b]">
              Тем, кому нужен максимальный темп, гибкое расписание или специализированная
              цель — например, поступление в Китай, корпоративные переговоры, конкретный
              экзамен HSK с дедлайном.
            </p>
            <Link
              href="/courses/chinese-for-kids"
              className={`${buttonStyles({ size: "large" })} mt-6 w-fit`}
            >
              Школьникам индивидуально
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Не уверены — попробуйте бесплатно
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            На пробном уроке преподаватель посмотрит ваш темп и предложит формат под цель.
            Никаких обязательств — решение остаётся за вами.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source="compare-formats-cta"
            >
              Записаться на пробное
            </LeadModal>
            <Link
              href="/price"
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              Цены и тарифы
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
