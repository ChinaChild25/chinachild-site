import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
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
      title="Преподаватели и носители из 6 стран"
      description="Каждый преподаватель проходит три этапа отбора: уровень владения языком, методику и релевантный опыт работы со студентами."
    >
      <JsonLd data={createTeachersSchemas()} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {teachers.map((teacher, index) => (
          <Reveal key={teacher.slug}>
            <article className={`card-block h-full overflow-hidden p-0 ${palette[index % palette.length]}`}>
              <Image
                src={teacher.image}
                alt={`Преподаватель ChinaChild ${teacher.name}`}
                width={480}
                height={520}
                className="h-[260px] w-full object-cover"
              />
              <div className="p-7">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {teacher.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#1b1b1b]">
                  {teacher.specialization}
                </p>
                <p className="mt-2 text-sm text-[#6b6b6b]">{teacher.experience}</p>
                <p className="mt-3 text-sm leading-6 text-[#4b4b4b]">
                  {teacher.credentials}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link href="/prepodavateli" className={buttonStyles({ variant: "secondary" })}>
          Смотреть всю команду
        </Link>
      </div>
    </SectionShell>
  );
}
