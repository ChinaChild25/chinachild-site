import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import TeachersSection from "@/components/sections/TeachersSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Преподаватели китайского языка онлайн | ChinaChild",
    description:
      "Преподаватели школы ChinaChild прошли подготовку в ведущих вузах региона — ЮФУ и ДГТУ. Опыт индивидуального и группового обучения более 10 лет. Авторские курсы и носители языка.",
    path: "/prepodavateli",
    keywords: [
      "преподаватели китайского языка",
      "репетитор китайского онлайн",
      "учитель китайского языка",
      "носитель китайского онлайн",
    ],
  });
}

const internalLinks = [
  { label: "Курсы HSK 1–6", href: "/hsk" },
  { label: "Курсы школы", href: "/kursy" },
  { label: "Школьникам 12+", href: "/dlya-detej" },
  { label: "Взрослым с нуля", href: "/dlya-vzroslyh" },
  { label: "Тест уровня", href: "/test-hsk" },
];

export default function TeachersPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Преподаватели", path: "/prepodavateli" },
        ]}
      />
      <PageHero
        variant="cream"
        eyebrow="Команда школы"
        title="Преподаватели китайского языка ChinaChild"
        description="Преподаватели прошли подготовку в ведущих вузах региона — Южном федеральном университете (ЮФУ) и Донском государственном техническом университете (ДГТУ). Опыт индивидуального и группового обучения — более 10 лет."
        primaryCta={{ label: "Подобрать преподавателя", href: REGISTER_URL, external: true }}
      />
      <TeachersSection />

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-violet-soft">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            Как мы подбираем преподавателей
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              В команде ChinaChild работают преподаватели с опытом обучения китайскому языку
              более 10 лет. Все они прошли подготовку в ведущих вузах региона — ЮФУ и ДГТУ —
              и владеют современными методиками преподавания и актуальными исследованиями в
              области китаистики.
            </p>
            <p>
              Программу ведут авторы курсов школы — Анастасия Пономарёва (учебник и рабочая
              тетрадь), Анастасия Ерина (курс китайского языка) и носитель языка Чжао Ли.
              Преподаватель подстраивается под средний уровень группы и помогает каждому
              ученику снять языковой барьер.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
            {internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
