"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import aiTrainerImage from "@/public/platform/ai-trainer.webp";
import progressImage from "@/public/platform/progress.webp";
import recordingsImage from "@/public/platform/recordings.webp";
import scheduleImage from "@/public/platform/schedule.webp";
import videoCallsImage from "@/public/platform/video-calls.webp";

type PlatformFeature = {
  id: string;
  title: string;
  description: string;
  media: StaticImageData;
  mediaAlt?: string;
};

const features: PlatformFeature[] = [
  {
    id: "video-calls",
    title: "Видеозвонки в браузере",
    description:
      "Уроки идут в реальном времени прямо в браузере — без установки Zoom или Skype. Качество связи мониторится автоматически.",
    media: videoCallsImage,
    mediaAlt: "Видеозвонок с преподавателем китайского языка в браузере",
  },
  {
    id: "schedule",
    title: "Расписание и напоминания",
    description:
      "Календарь занятий синхронизирован с Google Calendar и iCal. SMS- и email-напоминания приходят за час до урока — никто не пропустит.",
    media: scheduleImage,
    mediaAlt: "Расписание занятий китайским языком в личном кабинете",
  },
  {
    id: "ai-trainer",
    title: "AI-тренажёр иероглифов",
    description:
      "Встроенный ассистент на базе ChatGPT помогает разобрать тон, проверить написание иероглифа и подобрать подходящий перевод — 24/7.",
    media: aiTrainerImage,
    mediaAlt: "AI-тренажёр иероглифов и словарь китайского языка",
  },
  {
    id: "recordings",
    title: "Записи уроков",
    description:
      "Каждый урок автоматически сохраняется в личный кабинет — можно пересмотреть тему, повторить произношение и догнать пропущенное.",
    media: recordingsImage,
    mediaAlt: "Запись урока китайского языка в личном кабинете ChinaChild",
  },
  {
    id: "progress",
    title: "Трек прогресса по HSK",
    description:
      "Личный план обучения с разбивкой по уровням HSK 1–6. Видно, какие темы уже сданы и сколько осталось до сертификата.",
    media: progressImage,
    mediaAlt: "Трек прогресса ученика по уровням HSK 1-6",
  },
];

export default function PlatformShowcase() {
  const [activeId, setActiveId] = useState(features[0].id);
  const [preloadMedia, setPreloadMedia] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const active = features.find((f) => f.id === activeId) ?? features[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setPreloadMedia(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPreloadMedia(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="page-shell-wide section-space">
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
                        <FeatureMediaStack
                          activeId={activeId}
                          preloadMedia={preloadMedia}
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
          <FeatureMediaStack
            activeId={active.id}
            preloadMedia={preloadMedia}
            fillContainer
          />
        </div>
      </div>
    </section>
  );
}

function FeatureMediaStack({
  activeId,
  preloadMedia,
  fillContainer,
}: {
  activeId: string;
  preloadMedia: boolean;
  fillContainer?: boolean;
}) {
  const active = features.find((feature) => feature.id === activeId) ?? features[0];
  const renderedFeatures = preloadMedia ? features : [active];

  return (
    <div className={`relative w-full ${
        fillContainer
          ? "h-full min-w-0"
          : "aspect-[756/491]"
      }`}
    >
      {renderedFeatures.map((feature) => {
        const isActive = feature.id === activeId;
        return (
          <Image
            key={feature.id}
            src={feature.media}
            alt={isActive ? (feature.mediaAlt ?? feature.title) : ""}
            aria-hidden={!isActive}
            fill
            sizes="(min-width: 1536px) 820px, (min-width: 1024px) 56vw, 92vw"
            loading={preloadMedia ? "eager" : "lazy"}
            fetchPriority={isActive ? "auto" : "low"}
            className={`rounded-[12px] object-cover ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        );
      })}
    </div>
  );
}
