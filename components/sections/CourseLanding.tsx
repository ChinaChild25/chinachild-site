import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import LeadModal from "@/components/forms/LeadModal";
import FAQSection from "@/components/sections/FAQSection";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import {
  createCourseSchema,
  createReviewNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import {
  getReviewsForCourse,
  REVIEW_SOURCE_LABELS,
  type Course,
  type FaqItem,
} from "@/lib/site-data";

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
  // Курс-специфичные отзывы — рендерим Review schema + UI-блок, чтобы получить
  // звёзды в SERP и социальное доказательство на странице покупки.
  const courseReviews = getReviewsForCourse(schemaCourse.slug);
  const reviewGraph: JsonLdType | null =
    courseReviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": courseReviews.map((r) => createReviewNode(r)),
        }
      : null;

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
      {reviewGraph ? (
        <JsonLd data={reviewGraph} id={`course-${schemaCourse.slug}-reviews-schema`} />
      ) : null}

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
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">{b.title}</h2>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-[#262626] leading-[1.15] sm:text-[2rem]">
            {longCopy.heading}
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            {longCopy.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {courseReviews.length > 0 ? (
        <section className="page-shell-wide section-space">
          <div className="max-w-2xl">
            <span className="tag-pill">Отзывы выпускников</span>
            <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
              Что говорят выпускники курса
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {courseReviews.map((review) => {
              const sourceLabel = review.source ? REVIEW_SOURCE_LABELS[review.source] : null;
              return (
                <article key={review.author} className="card-block card-cream-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[#262626]">{review.author}</div>
                    <div className="text-xs text-[#1b1b1b]/60">★ {review.rating ?? 5} / 5</div>
                  </div>
                  <p className="mt-4 text-sm leading-[1.6] text-[#4b4b4b]">{review.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b6b6b]">
                    {review.result ? <span>{review.result}</span> : null}
                    {sourceLabel ? (
                      review.verifyUrl ? (
                        <a
                          href={review.verifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4 hover:text-[#262626]"
                        >
                          {sourceLabel} →
                        </a>
                      ) : (
                        <span>{sourceLabel}</span>
                      )
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <FAQSection
        title="Вопросы и ответы"
        items={faqs}
        schemaId={`course-${schemaCourse.slug}-faq`}
      />

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-white leading-[1.15] sm:text-[2rem]">
            Готовы начать?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.55] text-white/80">
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

          {related && related.length > 0 ? (
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="text-xs uppercase tracking-[0.08em] text-white/55">
                Также может пригодиться
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {related.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="text-sm text-white/80 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
