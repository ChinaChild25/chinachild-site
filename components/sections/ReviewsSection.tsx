import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createAggregateRatingSchema, createReviewSchemas } from "@/lib/schema";
import { reviews, siteFacts } from "@/lib/site-data";

export default function ReviewsSection() {
  return (
    <SectionShell
      id="otzyvy"
      label="Отзывы"
      title="Отзывы учеников и родителей, которые уже прошли путь"
      description="Видимая на странице оценка и отзывный контент помогают и конверсии, и расширенным сниппетам через schema AggregateRating и Review."
    >
      {/* Visible rating block mirrors the structured data to keep schema trustworthy. */}
      <JsonLd data={[createAggregateRatingSchema(), ...createReviewSchemas()]} />
      <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <Reveal>
          <div className="surface-card rounded-[32px] bg-[#1A1A2E] p-8 text-white">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-white/64">
              Средняя оценка
            </div>
            <div className="mt-5 text-6xl font-extrabold tracking-[-0.06em]">
              {siteFacts.aggregateRating}
              <span className="text-3xl text-white/76">/5</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/74">
              На основе {siteFacts.reviewCount} отзывов и откликов после обучения.
              Мы показываем не только оценки, но и конкретные результаты учеников.
            </p>
          </div>
        </Reveal>

        <div className="mobile-scroll lg:grid lg:grid-cols-2">
          {reviews.map((review) => (
            <Reveal key={review.author}>
              <article className="surface-card h-full rounded-[28px] p-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={review.image}
                    alt={review.author}
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="text-base font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
                      {review.author}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#24B47E]">
                      {review.result}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#4B5563]">{review.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
