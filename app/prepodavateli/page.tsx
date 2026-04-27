import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import TeachersSection from "@/components/sections/TeachersSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Преподаватели китайского языка онлайн | ChinaChild",
    description:
      "Преподаватели ChinaChild: специализация по детям, подросткам, взрослым и бизнес-аудитории, опыт 5+ лет и маршруты под HSK и разговорную практику.",
    path: "/prepodavateli",
    keywords: [
      "преподаватели китайского языка",
      "репетиторы китайского онлайн",
      "носители китайского онлайн",
    ],
  });
}

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
        eyebrow="Команда"
        title="Преподаватели и носители ChinaChild"
        description="Каждый преподаватель проходит три этапа отбора: уровень владения языком, методику и релевантный опыт. Подбираем преподавателя под возраст, темп и цель."
        primaryCta={{ label: "Подобрать преподавателя", href: REGISTER_URL, external: true }}
      />
      <TeachersSection />
    </main>
  );
}
