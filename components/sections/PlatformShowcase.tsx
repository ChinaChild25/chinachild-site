"use client";

import { useState } from "react";

type PlatformFeature = {
  id: string;
  title: string;
  description: string;
  /** Скриншот/гифка в /public/platform/. Если пусто — placeholder. */
  media?: string;
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
      {/* Главный заголовок секции — на странице, ВНЕ карточек */}
      <div className="section-head-center mx-auto max-w-3xl">
        <h2 className="section-title">
          Обучение проходит на собственной платформе ChinaChild
        </h2>
        <p className="section-description">
          Видеоуроки, AI-тренажёр, записи занятий и трек прогресса — всё в одной
          вкладке браузера. Один логин — весь курс HSK.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-stretch">
        {/* Левая тёмная карточка с аккордеоном */}
        <div className="card-block card-block-lg card-ink flex flex-col">
          <h3 className="text-[1.5rem] font-medium tracking-[-0.01em] text-white leading-[1.2] max-w-[14ch]">
            Всё под рукой — в одной вкладке браузера
          </h3>
          <div className="mt-8 grid">
            {features.map((feature, idx) => {
              const isActive = feature.id === activeId;
              return (
                <div
                  key={feature.id}
                  className={idx > 0 ? "border-t border-white/10" : ""}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveId((prev) => (prev === feature.id ? prev : feature.id))
                    }
                    aria-expanded={isActive}
                    aria-controls={`platform-feature-${feature.id}`}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span
                      className={`text-[1.0625rem] font-medium tracking-[-0.005em] leading-[1.3] ${
                        isActive ? "text-white" : "text-white/85"
                      }`}
                    >
                      {feature.title}
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? "bg-[#726BFF] text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {isActive ? (
                        <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
                          <path
                            d="M0 1H14"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
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
                  </button>

                  {isActive ? (
                    <div
                      id={`platform-feature-${feature.id}`}
                      className="pb-6"
                    >
                      <p className="text-[15px] leading-[1.55] text-white/70">
                        {feature.description}
                      </p>
                      {/* На мобиле + планшете (<1024px) media показывается
                          здесь же, прямо под описанием активного пункта.
                          На десктопе — улетает в правую белую карточку. */}
                      <div className="mt-5 lg:hidden">
                        <FeatureMedia
                          media={feature.media}
                          alt={feature.mediaAlt ?? feature.title}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая «рамка» — только на десктопе. Внешняя тёмная фигура
            #262626 со скруглением 24px + внутренняя белая со скруглением
            12px, между ними 20px тёмного «бордера». Высота тянется
            к высоте левой карточки через grid stretch. */}
        <div className="hidden lg:flex bg-[#262626] rounded-[24px] p-5 overflow-hidden">
          <div className="flex flex-1 items-center justify-center rounded-[12px] bg-white p-6">
            <FeatureMedia
              media={active.media}
              alt={active.mediaAlt ?? active.title}
              fillContainer
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureMedia({
  media,
  alt,
  fillContainer,
}: {
  media?: string;
  alt: string;
  fillContainer?: boolean;
}) {
  if (media) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media}
        alt={alt}
        loading="lazy"
        className={
          fillContainer
            ? "h-auto max-h-full w-full rounded-[12px] object-contain"
            : "w-full rounded-[12px]"
        }
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex w-full items-center justify-center rounded-[12px] border border-dashed text-center ${
        fillContainer
          ? "min-h-[280px] flex-1 border-[rgba(0,0,0,0.12)] bg-[#f5f5f3]"
          : "aspect-[16/10] border-white/10 bg-white/5"
      }`}
    >
      <span
        className={`px-6 text-xs uppercase tracking-[0.16em] ${
          fillContainer ? "text-[#9a9a9a]" : "text-white/40"
        }`}
      >
        Скриншот / GIF
      </span>
    </div>
  );
}
