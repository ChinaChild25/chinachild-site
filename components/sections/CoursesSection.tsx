import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createCourseSchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { courses } from "@/lib/site-data";

const palette = [
  "card-cream",
  "card-sky",
  "card-lime-soft",
  "card-violet-soft",
] as const;

export default function CoursesSection() {
  return (
    <SectionShell
      id="kursy"
      title="Выберите курс под свою цель"
      description="Программа подбирается под возраст, уровень и темп. Можно начать индивидуально или в мини-группе — переключиться никогда не поздно."
    >
      <JsonLd data={courses.map((course) => createCourseSchema(course))} />
      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((course, index) => (
          <Reveal key={course.slug}>
            {/* Microdata duplication for Yandex — JSON-LD is already in <head>,
                but Yandex still rewards inline itemscope/itemprop. */}
            <article
              className={`card-block flex h-full flex-col ${palette[index % palette.length]}`}
              itemScope
              itemType="https://schema.org/Course"
            >
              <meta itemProp="url" content={absoluteUrl(course.href)} />
              <meta itemProp="inLanguage" content="ru-RU" />
              <meta itemProp="educationalLevel" content={course.level} />
              <div
                itemProp="provider"
                itemScope
                itemType="https://schema.org/EducationalOrganization"
              >
                <meta itemProp="name" content={SITE_NAME} />
                <meta itemProp="url" content={SITE_URL} />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <span className="tag-pill">{course.level}</span>
                <div className="text-right">
                  <div className="text-xs font-medium text-[#1b1b1b]/55">от</div>
                  <div
                    className="text-lg font-bold tracking-[-0.02em] text-[#1b1b1b]"
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                  >
                    {course.priceValue ? (
                      <meta itemProp="price" content={course.priceValue} />
                    ) : null}
                    <meta itemProp="priceCurrency" content="RUB" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                    <span itemProp="category">{course.price}</span>
                  </div>
                </div>
              </div>

              <h3
                className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]"
                itemProp="name"
              >
                {course.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]" itemProp="description">
                {course.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="tag-pill">{course.format}</span>
                <span className="tag-pill">{course.duration}</span>
              </div>

              <p className="mt-5 text-sm font-semibold text-[#1b1b1b]">
                {course.outcome}
              </p>

              {course.timeRequiredIso ? (
                <meta itemProp="timeRequired" content={course.timeRequiredIso} />
              ) : null}
              {course.credentialAwarded ? (
                <meta itemProp="educationalCredentialAwarded" content={course.credentialAwarded} />
              ) : null}

              <div className="mt-auto pt-6 flex flex-wrap gap-3">
                <Link href={course.href} className={buttonStyles({})}>
                  Подробнее
                </Link>
                <Link
                  href="/#tseny"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Цены
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
