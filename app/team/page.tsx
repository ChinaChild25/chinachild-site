import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/metadata";
import { teachers } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Преподаватели китайского языка ChinaChild — методисты и носители",
  description:
    "Команда преподавателей онлайн-школы ChinaChild: методисты, авторы курсов, выпускники ЮФУ и ДГТУ, носители путунхуа. У каждого преподавателя — открытая страница с биографией и специализацией.",
  path: "/team",
  keywords: [
    "преподаватели китайского",
    "методист китайского",
    "носитель китайского онлайн",
    "репетитор китайского",
  ],
});

const palette = ["card-violet-soft", "card-cream", "card-lime-soft"];

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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, idx) => (
            <Reveal key={teacher.slug}>
              <Link
                href={`/team/${teacher.slug}`}
                className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    name={teacher.name}
                    size={56}
                    src={teacher.image}
                    alt={teacher.imageAlt}
                    title={teacher.imageTitle}
                  />
                  <div>
                    <div className="text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626] leading-[1.2]">
                      {teacher.name}
                    </div>
                    <div className="text-xs text-[#6b6b6b]">
                      {teacher.jobTitle ?? teacher.specialization}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#4b4b4b]">
                  {teacher.credentials}
                </p>
                <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                  Профиль преподавателя →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
