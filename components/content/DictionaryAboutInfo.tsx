"use client";

import { Info } from "lucide-react";
import { useState } from "react";

export default function DictionaryAboutInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Подробнее о словаре"
        className="dictionary-info-toggle inline-flex size-7 items-center justify-center rounded-[10px] transition-colors"
        data-open={open}
      >
        <Info className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <div
        role="tooltip"
        className={`absolute left-1/2 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-[var(--radius-card-md)] bg-white px-4 py-3 text-left text-sm leading-relaxed text-[#4b4b4b] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-[opacity,visibility] ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0 group-hover:visible group-hover:opacity-100"
        }`}
      >
        <p>
          Словарь ChinaChild собирает слова по уровням HSK — единой международной шкале знания
          китайского. Для каждого слова показываем упрощённое и традиционное написание, пиньинь,
          значения и примеры предложений. Где доступно — превью написания иероглифов и связанные
          правила грамматики.
        </p>
        <p className="mt-2">
          На публичных страницах словарь работает в режиме справочника без авторизации.
          Интерактивные карточки SRS, аудио и тренажёр написания доступны на учебной платформе
          ChinaChild.
        </p>
      </div>
    </div>
  );
}

