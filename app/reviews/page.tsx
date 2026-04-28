import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHero from "@/components/layout/PageHero";
import Avatar from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";
import { createAggregateRatingSchema, createReviewSchemas } from "@/lib/schema";
import { reviews, siteFacts } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Отзывы учеников школы китайского ChinaChild",
    description:
      "Отзывы учеников онлайн-школы китайского ChinaChild. Средняя оценка 4.9 из 5. Реальные истории про то, как наши ученики прошли путь от первых слов до разговорного уровня HSK 2.",
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
      <JsonLd data={[createAggregateRatingSchema(), ...createReviewSchemas()]} id="reviews-page-schema" />
      <PageHero
        eyebrow={`Средняя оценка ${siteFacts.aggregateRating} из 5`}
        title="Отзывы учеников ChinaChild"
        description="Что пишут наши ученики после прохождения курса. Все отзывы — из формы обратной связи на chinachild.ru."
        primaryCta={{ label: "Оставить отзыв", href: "https://chinachild.ru/reviews", external: true }}
        secondaryCta={{ label: "Записаться на пробное", href: REGISTER_URL }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.author} className="card-block card-cream-soft h-full">
              <div className="flex items-center gap-4">
                <Avatar name={review.author} size={64} />
                <div>
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-[#1b1b1b]">
                    {review.author}
                  </h2>
                  <p className="mt-1 text-sm text-[#6b6b6b]">{review.result}</p>
                </div>
              </div>
              <div className="mt-4 text-base text-[#FFB400]" aria-hidden>
                ★★★★★
              </div>
              <p className="mt-4 text-base leading-7 text-[#4b4b4b]">«{review.body}»</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
            Хотите свой результат?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Запишитесь на бесплатное пробное занятие. Преподаватель оценит уровень,
            поставит цель и подберёт подходящий курс ChinaChild.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "secondary", size: "large" })}
            >
              Записаться
            </Link>
            <Link href="/courses" className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}>
              Все курсы
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
