import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import { Sparkle } from "@/components/decor/Decor";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createAggregateRatingSchema, createReviewSchemas } from "@/lib/schema";
import { reviews, siteFacts } from "@/lib/site-data";

export default function ReviewsSection() {
  return (
    <SectionShell
      id="otzyvy"
      title="Отзывы наших учеников"
      description={`Средняя оценка ${siteFacts.aggregateRating} из 5 — на основе отзывов на странице школы и Тильда-форме обратной связи.`}
    >
      <JsonLd data={[createAggregateRatingSchema(), ...createReviewSchemas()]} />
      <div className="grid gap-5 lg:grid-cols-[0.4fr_1.6fr]">
        <Reveal>
          <article className="card-block card-violet relative h-full overflow-hidden">
            <Sparkle className="pointer-events-none absolute right-6 top-8 h-6 w-6 opacity-50" />
            <Sparkle className="pointer-events-none absolute right-12 bottom-12 h-8 w-8 opacity-40" />
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-white/70">
              Средняя оценка
            </div>
            <div className="mt-6 text-7xl font-bold tracking-[-0.05em] text-white">
              {siteFacts.aggregateRating}
              <span className="text-3xl text-white/70"> / 5</span>
            </div>
            <div className="mt-6 flex gap-1 text-xl text-[#FFE066]">★★★★★</div>
            <p className="mt-6 text-sm leading-7 text-white/85">
              Лицензированная программа, опытные преподаватели и удобный личный
              кабинет — три причины, по которым ученики продолжают обучение.
            </p>
          </article>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <Reveal key={review.author}>
              <article className="card-block card-cream-soft h-full">
                <div className="flex items-center gap-4">
                  <Image
                    src={review.image}
                    alt={review.author}
                    width={72}
                    height={72}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.02em] text-[#1b1b1b]">
                      {review.author}
                    </h3>
                    <p className="mt-1 text-xs text-[#6b6b6b]">{review.result}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#4b4b4b]">«{review.body}»</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
