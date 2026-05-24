import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";

/**
 * Yandex Local block: map + reviews from Yandex Business profile.
 * Visual: одна карточка card-block-lg, две колонки на десктопе.
 * Iframe Yandex'а не стилизуется напрямую — оборачиваем во frame, чтобы
 * скруглить углы и убрать визуальную инородность. dark-режим — через
 * CSS-обёртку (см. .yandex-widget-frame в globals.css).
 */

const YANDEX_ORG_URL =
  "https://yandex.ru/maps/org/kursy_kitayskogo_yazyka_onlayn/129397906214/?utm_medium=mapframe&utm_source=maps";
const YANDEX_SHORT_URL = "https://yandex.ru/maps/-/CPDQBLKT";

const MAP_IFRAME_SRC =
  "https://yandex.ru/map-widget/v1/org/kursy_kitayskogo_yazyka_onlayn/129397906214/?ll=98.280134%2C24.189966&utm_source=share&z=2";

const REVIEWS_IFRAME_SRC =
  "https://yandex.ru/maps-reviews-widget/129397906214?comments";

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
            className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2.25rem]"
          >
            ChinaChild на Яндекс.Картах
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-[#4b4b4b]">
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
              href={`${YANDEX_ORG_URL.replace("utm_medium=mapframe", "utm_medium=reviewslink")}#reviews`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={buttonStyles({ variant: "secondary" })}
            >
              Оставить отзыв
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* === MAP =================================================== */}
          <Reveal>
            <figure className="m-0">
              <figcaption className="mb-3 flex items-center gap-2 text-sm font-medium text-[#262626]/65">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#726BFF]" />
                Карта и контакты
              </figcaption>
              <div className="yandex-widget-frame yandex-widget-frame--map">
                <iframe
                  src={MAP_IFRAME_SRC}
                  title="Карта: ChinaChild — курсы китайского языка онлайн, Москва"
                  loading="lazy"
                  allowFullScreen
                />
                <a
                  className="yandex-widget-attribution"
                  href={YANDEX_ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Курсы китайского языка онлайн — Яндекс.Карты
                </a>
              </div>
            </figure>
          </Reveal>

          {/* === REVIEWS =============================================== */}
          <Reveal>
            <figure className="m-0">
              <figcaption className="mb-3 flex items-center gap-2 text-sm font-medium text-[#262626]/65">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#726BFF]" />
                Отзывы на Яндекс.Картах
              </figcaption>
              <div className="yandex-widget-frame yandex-widget-frame--reviews">
                <iframe
                  src={REVIEWS_IFRAME_SRC}
                  title="Отзывы об онлайн-школе китайского языка ChinaChild на Яндекс.Картах"
                  loading="lazy"
                />
                <a
                  className="yandex-widget-attribution"
                  href="https://yandex.ru/maps/org/kursy_kitayskogo_yazyka_onlayn/129397906214/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Отзывы об онлайн-школе на Яндекс.Картах
                </a>
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
