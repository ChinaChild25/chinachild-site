import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import ReviewYandexArrow from "@/components/ui/ReviewYandexArrow";
import SectionShell from "@/components/ui/SectionShell";
import { getReviewYandexUrl, reviews, siteFacts } from "@/lib/site-data";

export default function ReviewsSection() {
  return (
    <SectionShell
      id="otzyvy"
      title="Отзывы наших учеников"
      description={`Средняя оценка ${siteFacts.aggregateRating} из 5 — на основе отзывов на сайте.`}
    >
      <div className="grid gap-5 lg:grid-cols-[0.4fr_1.6fr]">
        <Reveal>
          <article className="card-block card-violet h-full">
            <div className="text-sm font-medium tracking-[0.01em] text-[#262626]/65">
              Средняя оценка
            </div>
            <div className="mt-6 text-[4rem] font-medium tracking-[-0.02em] text-[#262626] leading-[1.05]">
              {siteFacts.aggregateRating}
              <span className="text-[1.75rem] text-[#262626]/55"> / 5</span>
            </div>
            <div className="mt-6 flex gap-1 text-xl text-[#E8A300]" aria-hidden>
              ★★★★★
            </div>
            <p className="mt-6 text-sm leading-[1.55] text-[#262626]/72">
              Лицензированная программа, преподаватели ЮФУ и ДГТУ и удобный
              личный кабинет — три причины, по которым ученики продолжают обучение.
            </p>
          </article>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => {
            const yandexUrl = getReviewYandexUrl(review);
            const inner = (
              <>
                {/* pr-12 резервирует место под угловой кружок-стрелку
                    (.review-card-icon, ~64px от правого края), чтобы длинный
                    подзаголовок переносился, а не заезжал под стрелку. */}
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
                    <p className="mt-1.5 text-base text-[#262626]/60">{review.result}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-[1.55] text-[#4b4b4b]">«{review.body}»</p>
                {yandexUrl ? <ReviewYandexArrow /> : null}
              </>
            );

            return (
              <Reveal key={review.author}>
                {yandexUrl ? (
                  <a
                    href={yandexUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={`Отзыв «${review.author}» на Яндекс.Картах`}
                    className="card-block card-cream-soft group relative flex h-full flex-col"
                  >
                    {inner}
                  </a>
                ) : (
                  <article className="card-block card-cream-soft flex h-full flex-col">
                    {inner}
                  </article>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
