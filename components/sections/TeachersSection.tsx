import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createTeachersSchemas } from "@/lib/schema";
import { teachers } from "@/lib/site-data";

export default function TeachersSection() {
  return (
    <SectionShell
      id="prepodavateli"
      label="Команда"
      title="Преподаватели, которые умеют объяснять и доводить до результата"
      description="На лендинге показываем лица, специализацию и опыт, чтобы у школы была не обезличенная витрина, а доверительный экспертный контур."
    >
      <JsonLd data={createTeachersSchemas()} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {teachers.map((teacher) => (
          <Reveal key={teacher.slug}>
            <article className="surface-card h-full rounded-[28px] overflow-hidden">
              <Image
                src={teacher.image}
                alt={`Преподаватель ChinaChild ${teacher.name}`}
                width={480}
                height={520}
                className="h-[260px] w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
                  {teacher.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#1A1A2E]">
                  {teacher.specialization}
                </p>
                <p className="mt-3 text-sm text-[#4B5563]">{teacher.experience}</p>
                <p className="mt-2 text-sm leading-7 text-[#4B5563]">
                  {teacher.credentials}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/prepodavateli" className={buttonStyles({ variant: "secondary" })}>
          Смотреть всю команду
        </Link>
      </div>
    </SectionShell>
  );
}
