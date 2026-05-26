import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { reviews } from "@/lib/site-data";
import {
  YANDEX_BUSINESS_PROFILE_URL,
  YANDEX_BUSINESS_REVIEWS_URL,
} from "@/lib/site-config";

const YANDEX_RATING = "4,4";
const YANDEX_RATING_NUMERIC = 4.4;
const YANDEX_REVIEW_COUNT = 7;

/**
 * Yandex Local block: map + reviews from Yandex Business profile.
 * Visual: одна карточка card-block-lg, две колонки на десктопе.
 * Iframe Yandex'а не стилизуется напрямую — оборачиваем во frame, чтобы
 * скруглить углы и убрать визуальную инородность. dark-режим — через
 * CSS-обёртку (см. .yandex-widget-frame в globals.css).
 */

const YANDEX_SHORT_URL = "https://yandex.ru/maps/-/CPDQBLKT";

// Center on Moscow (Red Square — long, lat in Yandex order) at city zoom.
// Yandex Maps requires `ll=<lon>%2C<lat>` and integer-ish `z` for embeds.
// The previous URL pointed at Yunnan / Myanmar with `z=2` — that came from
// a share generated while panning, not from the org page.
const MAP_IFRAME_SRC =
  "https://yandex.ru/map-widget/v1/org/kursy_kitayskogo_yazyka_onlayn/129397906214/?ll=37.6173%2C55.7558&z=11&utm_source=share";

// The Yandex Maps reviews iframe widget collapses on many browsers (tracker
// protection + Yandex's own CSP blocks the inner fetch), leaving only a
// rating-header card and a huge empty area. We render a native card instead:
// the Yandex rating + a few curated review excerpts + a CTA back to the
// public Yandex Maps profile.
export default function YandexLocalSection() {
  return (
    <section
      id="yandex"
      className="page-shell-wide section-space"
      aria-labelledby="yandex-heading"
    >
      <div className="card-block card-block-lg card-cream-soft">
        <div className="max-w-3xl">
          <span className="tag-pill">Яндекс.Бизнес — Москва</span>
          <h2
            id="yandex-heading"
            className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--foreground)] sm:text-[2.25rem]"
          >
            ChinaChild на Яндекс.Картах
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
            Школа зарегистрирована в Яндекс.Бизнесе как «Курсы китайского
            языка онлайн» — Москва. Здесь можно посмотреть карточку компании,
            почитать отзывы учеников и оставить свой после курса.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={YANDEX_SHORT_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={buttonStyles({})}
            >
              Открыть в Яндекс.Картах
            </a>
            <a
              href={`${YANDEX_BUSINESS_REVIEWS_URL}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={buttonStyles({ variant: "secondary" })}
            >
              Оставить отзыв
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          {/* === MAP =================================================== */}
          <Reveal className="h-full">
            <figure className="m-0 flex h-full flex-col">
              <figcaption className="yandex-widget-caption mb-3 flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#726BFF]" />
                Карта и контакты
              </figcaption>
              <div className="yandex-widget-frame yandex-widget-frame--map flex-1">
                <iframe
                  src={MAP_IFRAME_SRC}
                  title="Карта: ChinaChild — курсы китайского языка онлайн, Москва"
                  loading="lazy"
                  allowFullScreen
                />
                <a
                  className="yandex-widget-attribution"
                  href={YANDEX_BUSINESS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Курсы китайского языка онлайн — Яндекс.Карты
                </a>
              </div>
            </figure>
          </Reveal>

          {/* === REVIEWS =============================================== */}
          <Reveal className="h-full">
            <figure className="m-0 flex h-full flex-col">
              <figcaption className="yandex-widget-caption mb-3 flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#726BFF]" />
                Отзывы на Яндекс.Картах
              </figcaption>
              <YandexReviewsCard />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function YandexReviewsCard() {
  const highlights = reviews.slice(0, 3);
  return (
    <div className="yandex-reviews-card flex h-full flex-col gap-5 rounded-[var(--radius-card-md)] p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-[var(--muted-strong)]">
            Яндекс.Карты
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-[2.4rem] font-medium leading-none tracking-[-0.01em] text-[var(--foreground)]">
              {YANDEX_RATING}
            </span>
            <Stars rating={YANDEX_RATING_NUMERIC} />
          </div>
          <p className="mt-2 text-sm text-[var(--muted-strong)]">
            {YANDEX_REVIEW_COUNT} отзывов · {YANDEX_REVIEW_COUNT} оценок
          </p>
        </div>
      </header>

      <ul className="grid gap-3">
        {highlights.map((review) => (
          <li
            key={review.author}
            className="yandex-reviews-card__item rounded-[14px] px-4 py-3"
          >
            <p className="text-[15px] font-medium leading-snug text-[var(--foreground)]">
              {review.author}
            </p>
            {review.result ? (
              <p className="mt-0.5 text-xs text-[var(--muted-strong)]">
                {review.result}
              </p>
            ) : null}
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted-strong)]">
              «{review.body}»
            </p>
          </li>
        ))}
      </ul>

      <a
        href={YANDEX_BUSINESS_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={`${buttonStyles({ variant: "secondary", size: "compact" })} mt-auto self-start`}
      >
        Все отзывы на Яндекс.Картах →
      </a>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const max = 5;
  return (
    <span aria-label={`${rating} из ${max}`} className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden
            className={filled ? "text-[#f5a623]" : "text-[#d8d3ff]/40"}
          >
            <path
              d="M8 1.6l1.94 4.08 4.46.4-3.39 3 1.04 4.34L8 11.16l-4.05 2.26 1.04-4.34-3.39-3 4.46-.4L8 1.6z"
              fill="currentColor"
            />
          </svg>
        );
      })}
    </span>
  );
}
