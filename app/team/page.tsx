import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import TeacherCard from "@/components/ui/TeacherCard";
import { buildMetadata } from "@/lib/metadata";
import { teachers } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Преподаватели китайского языка ChinaChild — методисты и носители",
  description:
    "Преподаватели школы ChinaChild: методисты-авторы курсов из ЮФУ и ДГТУ и носители путунхуа. Биография и специализация — на странице каждого.",
  path: "/team",
  keywords: [
    "преподаватели китайского",
    "методист китайского",
    "носитель китайского онлайн",
    "репетитор китайского",
  ],
});

export default function TeamPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
        ]}
      />
      <PageHero
        eyebrow="Команда"
        title="Преподаватели ChinaChild"
        description="Авторы курсов, методисты и носители путунхуа. У каждого открытая страница с биографией и специализацией — это часть нашей политики прозрачности."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
        illustration="/heroes/team.webp"
        illustrationAlt="Команда преподавателей онлайн-школы ChinaChild"
        illustrationWidth={744}
        illustrationHeight={962}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teachers.map((teacher) => (
            <Reveal key={teacher.slug}>
              <TeacherCard teacher={teacher} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
