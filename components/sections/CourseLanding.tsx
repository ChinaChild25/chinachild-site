import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import LeadModal from "@/components/forms/LeadModal";
import FAQSection from "@/components/sections/FAQSection";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { createCourseSchema, type JsonLd as JsonLdType } from "@/lib/schema";
import type { Course, FaqItem } from "@/lib/site-data";

type Bullet = { title: string; body: string; tone: "violet-soft" | "cream" | "lime-soft" | "sky" | "peach-soft" | "cream-soft" };

type CourseLandingProps = {
  breadcrumb: { name: string; path: string };
  pageHero: {
    variant?: "violet" | "cream" | "lime" | "sky";
    eyebrow: string;
    title: string;
    description: string;
  };
  bullets: Bullet[];
  longCopy: { heading: string; paragraphs: string[] };
  faqs: FaqItem[];
  schemaCourse: Course;
  related?: { title: string; href: string }[];
};

const toneClass: Record<Bullet["tone"], string> = {
  "violet-soft": "card-violet-soft",
  cream: "card-cream",
  "lime-soft": "card-lime-soft",
  sky: "card-sky",
  "peach-soft": "card-peach-soft",
  "cream-soft": "card-cream-soft",
};

export default function CourseLanding({
  breadcrumb,
  pageHero,
  bullets,
  longCopy,
  faqs,
  schemaCourse,
  related,
}: CourseLandingProps) {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Курсы", path: "/courses" },
          breadcrumb,
        ]}
      />
      <JsonLd data={createCourseSchema(schemaCourse) as JsonLdType} id={`course-${schemaCourse.slug}-schema`} />

      <PageHero
        variant={pageHero.variant ?? "violet"}
        eyebrow={pageHero.eyebrow}
        title={pageHero.title}
        description={pageHero.description}
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {bullets.map((b) => (
            <article key={b.title} className={`card-block h-full ${toneClass[b.tone]}`}>
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1e1e1e] leading-[1.2]">{b.title}</h2>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-[#1e1e1e] leading-[1.15] sm:text-[2rem]">
            {longCopy.heading}
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            {longCopy.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Вопросы и ответы"
        items={faqs}
        schemaId={`course-${schemaCourse.slug}-faq`}
      />

      {related && related.length > 0 ? (
        <section className="page-shell-wide section-space">
          <div className="card-block card-block-lg card-violet-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1e1e1e] leading-[1.2]">
              Связанные страницы
            </h2>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
              {related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="text-sm font-medium text-[#1e1e1e] underline underline-offset-4"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-white leading-[1.15] sm:text-[2rem]">
            Готовы начать?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.55] text-white/85">
            Запишитесь на бесплатное пробное занятие. Преподаватель оценит ваш уровень,
            поставит цель и подберёт подходящий курс.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source={`course-landing-${schemaCourse.slug}`}
              defaultCourse={schemaCourse.slug}
            >
              Записаться на пробное
            </LeadModal>
            <Link href="/courses" className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}>
              Все курсы
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
