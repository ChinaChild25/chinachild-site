import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import TeacherCard from "@/components/ui/TeacherCard";
import { teachers } from "@/lib/site-data";

export default function TeachersSection() {
  return (
    <SectionShell
      id="prepodavateli"
      title="Преподаватели китайского языка ChinaChild"
      description="Команда прошла подготовку в ведущих вузах региона — ЮФУ и ДГТУ. Опыт индивидуального и группового обучения — более 10 лет."
    >
      <div className="teacher-carousel">
        {teachers.map((teacher) => (
          <Reveal key={teacher.slug}>
            <TeacherCard teacher={teacher} />
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
