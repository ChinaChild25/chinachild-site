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
      title="Отзывы учеников и родителей"
      description={`Средняя оценка ${siteFacts.aggregateRating} из 5 — на основе ${siteFacts.reviewCount} отзывов после обучения.`}
    >
      <JsonLd data={[createAggregateRatingSchema(), ...createReviewSchemas()]} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  <p className="mt-1 text-xs text-[#6b6b6b]">
                    {review.result}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#4b4b4b]">{review.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
