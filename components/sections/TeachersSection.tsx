import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Avatar from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createTeachersSchemas } from "@/lib/schema";
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
      <JsonLd data={createTeachersSchemas()} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher, index) => (
          <Reveal key={teacher.slug}>
            <article className={`card-block h-full ${palette[index % palette.length]}`}>
              <div className="flex items-center gap-4">
                <Avatar name={teacher.name} size={64} />
                <div>
                  <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                    {teacher.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#1b1b1b]">
                    {teacher.specialization}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm text-[#6b6b6b]">{teacher.experience}</p>
              <p className="mt-2 text-sm leading-6 text-[#4b4b4b]">{teacher.credentials}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link href="/about" className={buttonStyles({ variant: "secondary" })}>
          О школе
        </Link>
      </div>
    </SectionShell>
  );
}
