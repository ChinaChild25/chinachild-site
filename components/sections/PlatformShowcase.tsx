"use client";

import { useState } from "react";

import Image from "next/image";

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
    media: "/platform/video-calls.webp",
    mediaAlt: "Видеозвонок с преподавателем китайского языка в браузере",
  },
  {
    id: "schedule",
    title: "Расписание и напоминания",
    description:
      "Календарь занятий синхронизирован с Google Calendar и iCal. SMS- и email-напоминания приходят за час до урока — никто не пропустит.",
    media: "/platform/schedule.webp",
    mediaAlt: "Расписание занятий китайским языком в личном кабинете",
  },
  {
    id: "ai-trainer",
    title: "AI-тренажёр иероглифов",
    description:
      "Встроенный ассистент на базе ChatGPT помогает разобрать тон, проверить написание иероглифа и подобрать подходящий перевод — 24/7.",
    media: "/platform/ai-trainer.webp",
    mediaAlt: "AI-тренажёр иероглифов и словарь китайского языка",
  },
  {
    id: "recordings",
    title: "Записи уроков",
    description:
      "Каждый урок автоматически сохраняется в личный кабинет — можно пересмотреть тему, повторить произношение и догнать пропущенное.",
    media: "/platform/recordings.webp",
    mediaAlt: "Запись урока китайского языка в личном кабинете ChinaChild",
  },
  {
    id: "progress",
    title: "Трек прогресса по HSK",
    description:
      "Личный план обучения с разбивкой по уровням HSK 1–6. Видно, какие темы уже сданы и сколько осталось до сертификата.",
    media: "/platform/progress.webp",
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

      <div className="mt-10 grid gap-3 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Левая тёмная карточка с аккордеоном. Намеренно используем
            card-block (а не card-block-lg) и поджатые отступы, чтобы
            её натуральная высота совпала с высотой правой рамки,
            у которой аспект жёстко 756/491. */}
        <div className="card-block card-ink flex flex-col">
          <h3 className="text-[1.5rem] font-medium tracking-[-0.01em] text-white leading-[1.2] lg:max-w-[26ch]">
            Всё под рукой — в одной вкладке браузера
          </h3>
          <div className="mt-6 grid">
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
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
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
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? "bg-[#726BFF] text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {isActive ? (
                        <svg width="12" height="2" viewBox="0 0 14 2" fill="none">
                          <path
                            d="M0 1H14"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
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
                      className="pb-5"
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

        {/* Правая «рамка» — только на десктопе. Высоту берём из
            grid-stretch (= высота левой карточки), скриншот внутри
            заполняет рамку через object-cover, чтобы не оставалось
            пустых полей даже при небольшом расхождении аспектов. */}
        <div className="hidden lg:flex bg-[#262626] rounded-[24px] p-5 overflow-hidden">
          <FeatureMedia
            media={active.media}
            alt={active.mediaAlt ?? active.title}
            fillContainer
          />
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
    return (
      <Image
        src={media}
        alt={alt}
        width={756}
        height={491}
        className={
          fillContainer
            ? "h-full w-full rounded-[12px] object-cover"
            : "aspect-[756/491] w-full rounded-[12px] object-cover"
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
          ? "h-full flex-1 border-white/10 bg-white/5"
          : "aspect-[756/491] border-white/10 bg-white/5"
      }`}
    >
      <span className="px-6 text-xs uppercase tracking-[0.16em] text-white/40">
        Скриншот / GIF
      </span>
    </div>
  );
}
