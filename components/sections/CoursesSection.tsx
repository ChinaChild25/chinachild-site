import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Badge from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createCourseSchema } from "@/lib/schema";
import { courses } from "@/lib/site-data";

export default function CoursesSection() {
  return (
    <SectionShell
      id="kursy"
      label="Каталог"
      title="Курсы китайского языка под возраст, уровень и цель"
      description="Каждая карточка курса получает schema Course, чтобы поисковые системы лучше понимали структуру продукта и тематику лендинга."
    >
      {/* Course schema is tied to visible cards to strengthen topical relevance. */}
      <JsonLd data={courses.map((course) => createCourseSchema(course))} />
      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((course) => (
          <Reveal key={course.slug}>
            <article className="surface-card h-full rounded-[30px] p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge>{course.level}</Badge>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[#1A1A2E]">
                    {course.title}
                  </h3>
                </div>
                <div className="rounded-[22px] bg-[#f7f7f8] px-4 py-3 text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                    Стоимость
                  </div>
                  <div className="mt-1 text-lg font-extrabold tracking-[-0.03em]">
                    {course.price}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#4B5563]">
                {course.description}
              </p>

              <div className="pill-row mt-5 text-sm font-semibold text-[#1A1A2E]">
                <span className="rounded-full bg-[#eef0ff] px-4 py-2">{course.format}</span>
                <span className="rounded-full bg-[#fff0eb] px-4 py-2">{course.duration}</span>
              </div>

              <p className="mt-5 text-sm font-semibold text-[#1A1A2E]">
                {course.outcome}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={course.href}
                  className={buttonStyles({
                    className: "bg-[#FF3D00] text-white hover:bg-[#f03a00]",
                  })}
                >
                  Подробнее о курсе
                </Link>
                <Link
                  href="/#tseny"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Смотреть цены
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
