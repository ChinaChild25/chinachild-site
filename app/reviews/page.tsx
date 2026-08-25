import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHero from "@/components/layout/PageHero";
import Avatar from "@/components/ui/Avatar";
import LeadModal from "@/components/forms/LeadModal";
import ReviewYandexArrow from "@/components/ui/ReviewYandexArrow";
import YandexLocalSection from "@/components/sections/YandexLocalSection";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { createReviewSchemas } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-config";
import {
  getReviewYandexUrl,
  REVIEW_SOURCE_LABELS,
  reviews,
  siteFacts,
} from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Отзывы учеников школы китайского ChinaChild",
    description:
      "Отзывы учеников ChinaChild: 4.8/5 на Яндекс.Картах и 4.9/5 на сайте. Реальные истории — от первых слов до сертификата HSK 2 и разговорного уровня.",
    path: "/reviews",
    keywords: [
      "отзывы chinachild",
      "отзывы школа китайского",
      "отзывы курсы китайского",
      "обучение китайскому отзывы",
    ],
  });
}

export default function ReviewsPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Отзывы", path: "/reviews" },
        ]}
      />
      <JsonLd data={createReviewSchemas()} id="reviews-page-schema" />
      <PageHero
        eyebrow={`Средняя оценка ${siteFacts.aggregateRating} из 5`}
        title="Отзывы учеников ChinaChild"
        description="Что пишут наши ученики после прохождения курса. Все отзывы — из формы обратной связи на сайте."
        primaryCta={{ label: "Оставить отзыв", href: absoluteUrl("/reviews"), external: true }}
        secondaryCta={{ label: "Записаться на пробное", modal: true }}
        heroToneClass="card-hero-reviews"
        illustration="/heroes/otzivi.webp"
        illustrationAlt="Отзывы учеников ChinaChild о курсах китайского языка и результатах обучения"
        illustrationWidth={494}
        illustrationHeight={420}
        illustrationFill
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => {
            const rating = review.rating ?? 5;
            const stars = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
            const yandexUrl = getReviewYandexUrl(review);
            const inner = (
              <>
                <div className="flex items-center gap-4">
                  <Avatar
                    name={review.author}
                    size={64}
                    src={review.image || undefined}
                    alt={`Фото ученика ChinaChild ${review.author}`}
                  />
                  <div>
                    <h2 className="text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626] leading-[1.2]">
                      {review.author}
                    </h2>
                    <p className="mt-1 text-sm text-[#6b6b6b]">{review.result}</p>
                  </div>
                </div>
                <div className="mt-4 text-base text-[#FFB400]" aria-hidden>
                  {stars}
                </div>
                <p className="mt-4 text-base leading-[1.55] text-[#4b4b4b]">«{review.body}»</p>
                {(review.date || review.source) && (
                  <p className="mt-3 text-xs text-[#262626]/55">
                    {review.date && (
                      <time dateTime={review.date}>
                        {new Date(review.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                        })}
                      </time>
                    )}
                    {review.date && review.source && " · "}
                    {review.source && (
                      <span>источник: {REVIEW_SOURCE_LABELS[review.source]}</span>
                    )}
                  </p>
                )}
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
                className="card-block card-cream-soft relative flex h-full flex-col"
              >
                {inner}
              </article>
            );
          })}
        </div>
      </section>

      <YandexLocalSection />

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Хотите свой результат?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Запишитесь на бесплатное пробное занятие. Преподаватель оценит уровень,
            поставит цель и подберёт подходящий курс ChinaChild.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source="reviews-cta"
              suppressFloatingCta
            >
              Записаться
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
