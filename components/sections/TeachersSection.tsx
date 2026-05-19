import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { teachers } from "@/lib/site-data";

const palette = [
  "card-cream-soft",
  "card-sky-soft",
  "card-lime-soft",
  "card-peach-soft",
] as const;

export default function TeachersSection() {
  return (
    <SectionShell
      id="prepodavateli"
      title="Преподаватели китайского языка ChinaChild"
      description="Команда прошла подготовку в ведущих вузах региона — ЮФУ и ДГТУ. Опыт индивидуального и группового обучения — более 10 лет."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher, index) => (
          <Reveal key={teacher.slug} className="h-full">
            <Link
              href={`/team/${teacher.slug}`}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[index % palette.length]}`}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  name={teacher.name}
                  size={64}
                  src={teacher.image}
                  alt={teacher.imageAlt}
                  title={teacher.imageTitle}
                />
                <div>
                  <h3 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
                    {teacher.displayName ?? teacher.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#262626]">
                    {teacher.specialization}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm text-[#6b6b6b]">{teacher.experience}</p>
              <p className="mt-2 flex-1 text-sm leading-[1.55] text-[#4b4b4b]">
                {teacher.credentials}
              </p>
              <span className="mt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                Профиль преподавателя →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/team" className={buttonStyles({ variant: "secondary" })}>
          Вся команда
        </Link>
        <Link href="/about" className={buttonStyles({ variant: "secondary" })}>
          О школе
        </Link>
      </div>
    </SectionShell>
  );
}
