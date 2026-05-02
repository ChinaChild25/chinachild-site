import JsonLd from "@/components/seo/JsonLd";
import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createAggregateRatingSchema, createReviewSchemas } from "@/lib/schema";
import { reviews, siteFacts } from "@/lib/site-data";

export default function ReviewsSection() {
  return (
    <SectionShell
      id="otzyvy"
      title="Отзывы наших учеников"
      description={`Средняя оценка ${siteFacts.aggregateRating} из 5 — на основе отзывов на сайте chinachild.ru.`}
    >
      <JsonLd data={[createAggregateRatingSchema(), ...createReviewSchemas()]} />
      <div className="grid gap-5 lg:grid-cols-[0.4fr_1.6fr]">
        <Reveal>
          <article className="card-block card-violet h-full">
            <div className="text-sm font-medium uppercase tracking-[0.08em] text-[#1a1a1a]/65">
              Средняя оценка
            </div>
            <div className="mt-6 text-[4rem] font-medium tracking-[-0.02em] text-[#1a1a1a] leading-[1.05]">
              {siteFacts.aggregateRating}
              <span className="text-[1.75rem] text-[#1a1a1a]/55"> / 5</span>
            </div>
            <div className="mt-6 flex gap-1 text-xl text-[#E8A300]" aria-hidden>
              ★★★★★
            </div>
            <p className="mt-6 text-sm leading-[1.55] text-[#1a1a1a]/72">
              Лицензированная программа, преподаватели ЮФУ и ДГТУ и удобный
              личный кабинет — три причины, по которым ученики продолжают обучение.
            </p>
          </article>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <Reveal key={review.author}>
              <article className="card-block card-cream-soft h-full">
                <div className="flex items-center gap-4">
                  <Avatar name={review.author} size={56} />
                  <div>
                    <h3 className="text-[1.25rem] font-normal tracking-[-0.01em] text-[#1a1a1a] leading-[1.2]">
                      {review.author}
                    </h3>
                    <p className="mt-1.5 text-base text-[#1a1a1a]/60">{review.result}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-[1.55] text-[#4b4b4b]">«{review.body}»</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
