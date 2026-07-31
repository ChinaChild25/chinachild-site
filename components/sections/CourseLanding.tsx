import type { ReactNode } from "react";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import EducationOfferTracker from "@/components/analytics/EducationOfferTracker";
import LeadModal from "@/components/forms/LeadModal";
import FAQSection from "@/components/sections/FAQSection";
import IndividualModuleSection from "@/components/sections/IndividualModuleSection";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Avatar from "@/components/ui/Avatar";
import ReviewYandexArrow from "@/components/ui/ReviewYandexArrow";
import { buttonStyles } from "@/components/ui/button";
import {
  createCourseSchema,
  createIndividualModuleSchema,
  createReviewNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import { courseMediaBySlug } from "@/lib/course-media";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  YANDEX_BUSINESS_REVIEWS_URL,
} from "@/lib/site-config";
import {
  getReviewsForCourse,
  getReviewYandexUrl,
  type Course,
  type FaqItem,
} from "@/lib/site-data";
import {
  INDIVIDUAL_MODULE_TERMS,
  type IndividualCourseModule,
} from "@/lib/course-modules";

type Bullet = { title: string; body: string; tone: "violet-soft" | "cream" | "lime-soft" | "sky" | "peach-soft" | "cream-soft" };

type CourseLandingProps = {
  breadcrumb: { name: string; path: string };
  pageHero: {
    variant?: "violet" | "cream" | "lime" | "sky";
    eyebrow: string;
    title: string;
    description: string;
  };
  bullets?: Bullet[];
  longCopy?: { heading: string; paragraphs: string[] };
  /** Rich bespoke sections (repetitor-level depth) rendered after the hero,
   *  before the reviews block. When provided, the page fully controls its
   *  middle while CourseLanding keeps owning hero, schema, reviews, FAQ, CTA. */
  sections?: ReactNode;
  faqs: FaqItem[];
  schemaCourse: Course;
  related?: { title: string; href: string }[];
  /** Override the final dark-CTA heading/lead copy per page. */
  ctaHeading?: string;
  ctaText?: string;
  individualModule?: IndividualCourseModule;
};

const toneClass: Record<Bullet["tone"], string> = {
  "violet-soft": "card-violet-soft",
  cream: "card-cream",
  "lime-soft": "card-lime-soft",
  sky: "card-sky",
  "peach-soft": "card-peach-soft",
  "cream-soft": "card-cream-soft",
};

// Тон hero-блока = цвет карточки этого курса на главной (раздел «Кому
// подойдёт»). В тёмной теме классы card-course-* дают нейтральный серый.
const heroToneClassBySlug: Record<string, string> = {
  "chinese-for-kids": "card-course-kids",
  "chinese-for-adults": "card-course-rose",
  "online-chinese": "card-course-violet",
  "hsk-preparation": "card-course-blue",
  "business-chinese": "card-course-lime",
};

export default function CourseLanding({
  breadcrumb,
  pageHero,
  bullets,
  longCopy,
  sections,
  faqs,
  schemaCourse,
  related,
  ctaHeading,
  ctaText,
  individualModule,
}: CourseLandingProps) {
  // Курс-специфичные отзывы — рендерим Review schema + UI-блок, чтобы получить
  // звёзды в SERP и социальное доказательство на странице покупки.
  const courseReviews = getReviewsForCourse(schemaCourse.slug);
  const heroMedia = courseMediaBySlug[schemaCourse.slug];
  const heroToneClass = heroToneClassBySlug[schemaCourse.slug];
  const reviewGraph: JsonLdType | null =
    courseReviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": courseReviews.map((r) => createReviewNode(r)),
        }
      : null;
  const offerContext = individualModule
    ? {
        offer_id: individualModule.id,
        offer_path: individualModule.path,
        offer_audience: individualModule.audience,
        module_price_rub: INDIVIDUAL_MODULE_TERMS.priceRub,
        module_lesson_count: INDIVIDUAL_MODULE_TERMS.lessonCount,
        module_lesson_minutes: INDIVIDUAL_MODULE_TERMS.lessonMinutes,
      }
    : undefined;

  return (
    <main className="course-landing">
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Курсы", path: "/courses" },
          breadcrumb,
        ]}
      />
      <JsonLd data={createCourseSchema(schemaCourse) as JsonLdType} id={`course-${schemaCourse.slug}-schema`} />
      {individualModule ? (
        <>
          <JsonLd
            data={createIndividualModuleSchema(individualModule)}
            id={`course-${schemaCourse.slug}-individual-module-schema`}
          />
          <EducationOfferTracker context={offerContext!} />
        </>
      ) : null}
      {reviewGraph ? (
        <JsonLd data={reviewGraph} id={`course-${schemaCourse.slug}-reviews-schema`} />
      ) : null}

      <PageHero
        variant={pageHero.variant ?? "violet"}
        heroToneClass={heroToneClass}
        eyebrow={pageHero.eyebrow}
        title={pageHero.title}
        description={pageHero.description}
        primaryCta={{
          label: "Записаться на пробное",
          modal: true,
          defaultCourse: schemaCourse.slug,
          offerContext,
        }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
        illustration={heroMedia?.src}
        illustrationAlt={heroMedia?.alt}
        illustrationWidth={heroMedia?.width}
        illustrationHeight={heroMedia?.height}
        illustrationFill={Boolean(heroMedia)}
      />

      {bullets && bullets.length > 0 ? (
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
      ) : null}

      {longCopy ? (
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
      ) : null}

      {sections}

      {individualModule ? (
        <IndividualModuleSection module={individualModule} />
      ) : null}

      {courseReviews.length > 0 ? (
        <section className="page-shell-wide section-space">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="max-w-2xl">
              <span className="tag-pill">Отзывы выпускников</span>
              <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
                Что говорят выпускники курса
              </h2>
            </div>
            <a
              href={YANDEX_BUSINESS_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm font-medium text-[#262626] underline-offset-4 hover:underline"
            >
              Все отзывы на Яндексе →
            </a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {courseReviews.map((review) => {
              const yandexUrl = getReviewYandexUrl(review);
              const inner = (
                <>
                  {/* pr-12 резервирует место под угловую стрелку на Яндекс. */}
                  <div className="flex items-center gap-4 pr-12">
                    <Avatar
                      name={review.author}
                      size={56}
                      src={review.image || undefined}
                      alt={`Фото ученика ChinaChild ${review.author}`}
                    />
                    <div>
                      <h3 className="text-[1.25rem] font-normal tracking-[-0.01em] text-[#262626] leading-[1.2]">
                        {review.author}
                      </h3>
                      {review.result ? (
                        <p className="mt-1.5 text-base text-[#262626]/60">{review.result}</p>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-[1.6] text-[#4b4b4b]">«{review.body}»</p>
                  {yandexUrl ? <ReviewYandexArrow /> : null}
                </>
              );

              return yandexUrl ? (
                <a
                  key={review.author}
                  href={yandexUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={`Отзыв «${review.author}» на Яндекс.Картах`}
                  className="card-block card-cream-soft group relative flex h-full flex-col"
                >
                  {inner}
                </a>
              ) : (
                <article
                  key={review.author}
                  className="card-block card-cream-soft flex h-full flex-col"
                >
                  {inner}
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
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="tag-pill tag-pill-ink">Остались вопросы?</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] text-white leading-[1.15] sm:text-[2rem]">
                {ctaHeading ?? "Запишитесь на бесплатный пробный урок"}
              </h2>
              <p className="mt-4 text-base leading-[1.55] text-white/80">
                {ctaText ??
                  "60 минут с преподавателем онлайн: проверим уровень, обсудим цели и покажем личный кабинет. Никаких автосписаний и подписок — продолжать или нет, решаете вы."}
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-base text-white/80">
                {CONTACT_EMAIL}
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                <LeadModal
                  triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
                  source={`course-landing-${schemaCourse.slug}`}
                  defaultCourse={schemaCourse.slug}
                  offerContext={offerContext}
                  suppressFloatingCta
                >
                  Записаться на пробное
                </LeadModal>
                <Link
                  href="/price"
                  className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}
                >
                  Цены и пакеты
                </Link>
              </div>
            </div>
          </div>

          {related && related.length > 0 ? (
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="text-xs tracking-[0.01em] text-white/55">
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
