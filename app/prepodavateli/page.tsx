import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TeachersSection from "@/components/sections/TeachersSection";
import { buildMetadata } from "@/lib/metadata";

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
      <section className="page-shell section-space pt-8">
        <span className="section-label">Команда</span>
        <h1 className="section-title">Преподаватели ChinaChild</h1>
        <p className="section-description">
          Показываем специализацию, опыт и сильные стороны команды, чтобы у
          пользователя был доверительный контур до заявки на пробный урок.
        </p>
      </section>
      <TeachersSection />
    </main>
  );
}
