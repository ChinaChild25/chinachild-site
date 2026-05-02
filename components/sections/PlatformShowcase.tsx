"use client";

import { useState } from "react";

type PlatformFeature = {
  id: string;
  title: string;
  description: string;
  /** Путь к скриншоту/гифке в /public/platform/. Если пусто — рендерится
   *  плейсхолдер с подсказкой, куда положить ассет. */
  media?: string;
  /** alt-текст для изображения (SEO + a11y). */
  mediaAlt?: string;
};

const features: PlatformFeature[] = [
  {
    id: "video-calls",
    title: "Видеозвонки в браузере",
    description:
      "Уроки идут в реальном времени прямо в браузере — без установки Zoom или Skype. Качество связи мониторится автоматически.",
    media: "",
    mediaAlt: "Видеозвонок с преподавателем китайского языка в браузере",
  },
  {
    id: "schedule",
    title: "Расписание и напоминания",
    description:
      "Календарь занятий синхронизирован с Google Calendar и iCal. SMS- и email-напоминания приходят за час до урока — никто не пропустит.",
    media: "",
    mediaAlt: "Расписание занятий китайским языком в личном кабинете",
  },
  {
    id: "ai-trainer",
    title: "AI-тренажёр иероглифов",
    description:
      "Встроенный ассистент на базе ChatGPT помогает разобрать тон, проверить написание иероглифа и подобрать подходящий перевод — 24/7.",
    media: "",
    mediaAlt: "AI-тренажёр иероглифов и словарь китайского языка",
  },
  {
    id: "recordings",
    title: "Записи уроков",
    description:
      "Каждый урок автоматически сохраняется в личный кабинет — можно пересмотреть тему, повторить произношение и догнать пропущенное.",
    media: "",
    mediaAlt: "Запись урока китайского языка в личном кабинете ChinaChild",
  },
  {
    id: "progress",
    title: "Трек прогресса по HSK",
    description:
      "Личный план обучения с разбивкой по уровням HSK 1–6. Видно, какие темы уже сданы и сколько осталось до сертификата.",
    media: "",
    mediaAlt: "Трек прогресса ученика по уровням HSK 1-6",
  },
];

export default function PlatformShowcase() {
  const [activeId, setActiveId] = useState(features[0].id);
  const active = features.find((f) => f.id === activeId) ?? features[0];

  return (
    <section className="page-shell-wide section-space">
      <div className="card-block card-block-lg card-ink">
        <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-white leading-[1.15] sm:text-[2rem] lg:text-[2.25rem] max-w-[16ch]">
          Всё под рукой — в одной вкладке браузера
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.55] text-white/70">
          Платформа ChinaChild объединяет видеоуроки, тренажёры, записи и
          AI-помощника. Один логин — весь курс.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Accordion — слева на десктопе, единственная колонка на моб */}
          <div className="grid">
            {features.map((feature, idx) => {
              const isActive = feature.id === activeId;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() =>
                    setActiveId((prev) => (prev === feature.id ? prev : feature.id))
                  }
                  aria-expanded={isActive}
                  aria-controls={`platform-feature-${feature.id}`}
                  className={`text-left transition ${
                    idx > 0 ? "border-t border-white/10" : ""
                  }`}
                >
                  <span className="flex items-center justify-between gap-4 py-5">
                    <span
                      className={`text-[1.125rem] font-medium tracking-[-0.005em] leading-[1.3] sm:text-[1.25rem] ${
                        isActive ? "text-white" : "text-white/70"
                      }`}
                    >
                      {feature.title}
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${
                        isActive ? "bg-[#726BFF] text-white" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {isActive ? (
                        <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
                          <path d="M0 1H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M7 0V14M0 7H14"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                  </span>

                  {/* На мобилке (≤1023px) активный feature раскрывается inline:
                      описание + media stacked под кнопкой. */}
                  {isActive ? (
                    <div
                      id={`platform-feature-${feature.id}`}
                      className="grid gap-5 pb-6 lg:hidden"
                    >
                      <p className="text-[15px] leading-[1.55] text-white/75">
                        {feature.description}
                      </p>
                      <FeatureMedia
                        media={feature.media}
                        alt={feature.mediaAlt ?? feature.title}
                      />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Desktop-only: media активной фичи справа, sticky-зона. */}
          <div className="hidden lg:block">
            <div className="lg:sticky lg:top-24 grid gap-5">
              <p className="text-base leading-[1.55] text-white/75">
                {active.description}
              </p>
              <FeatureMedia
                media={active.media}
                alt={active.mediaAlt ?? active.title}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureMedia({ media, alt }: { media?: string; alt: string }) {
  if (media) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media}
        alt={alt}
        loading="lazy"
        className="w-full rounded-[14px] border border-white/10 bg-white"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className="aspect-[16/10] w-full rounded-[14px] border border-white/10 bg-white/5 flex items-center justify-center text-center"
    >
      <span className="px-6 text-xs uppercase tracking-[0.16em] text-white/40">
        Скриншот / GIF
      </span>
    </div>
  );
}
