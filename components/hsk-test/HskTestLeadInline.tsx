"use client";

import Link from "next/link";
import { useState } from "react";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";
import type { HskTestLevel } from "@/lib/hsk-test/types";

type Props = {
  level: HskTestLevel;
  recommendedLevel: HskTestLevel;
  score: number;
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Inline lead capture shown on the result page — a gentle, non-modal ask
 * that "куратор" calls back and helps pick a course. Posts to the same
 * /api/contact endpoint as the rest of the site; source is tagged with
 * the recommended level so leads from this funnel are identifiable.
 */
export default function HskTestLeadInline({
  level,
  recommendedLevel,
  score,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const consent = fd.get("consent_pd") === "on";
    if (!consent) {
      setStatus("error");
      setError("Подтвердите согласие на обработку персональных данных");
      return;
    }

    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: "",
      course: "hsk-preparation",
      call_time: "",
      message: `HSK-тест: выбран HSK ${level}, балл ${score}%, рекомендован HSK ${recommendedLevel}`,
      consent_pd: true,
      consent_marketing: false,
      company: "",
      website: "",
      form_started_at: String(Date.now()),
      source_page: `hsk-test-result-level-${recommendedLevel}`,
      referrer: typeof document === "undefined" ? "" : document.referrer,
      utm: {},
    };

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Что-то пошло не так. Попробуйте ещё раз.");
        return;
      }
      setStatus("success");
      HskTestGoals.lead(level, recommendedLevel);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? `Сетевая ошибка: ${err.message}`
          : "Сетевая ошибка. Проверьте соединение.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="card-block card-lime-soft hsk-test-lead-inline">
        <div className="hsk-test-lead-inline-success">
          <h2 className="text-[1.5rem] font-medium leading-[1.2] text-[#1b1b1b] sm:text-[1.875rem]">
            Спасибо! Заявка принята.
          </h2>
          <p className="mt-3 max-w-[520px] text-base leading-[1.55] text-[#4b4b4b]">
            Куратор свяжется в течение рабочего дня и подскажет, с какой группы
            на HSK {recommendedLevel} удобнее всего начать.
          </p>
          <p className="mt-4 text-sm leading-[1.5] text-[#4b4b4b]">
            Хотите быстрее?{" "}
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="underline underline-offset-4"
            >
              Позвонить {CONTACT_PHONE}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-block card-cream hsk-test-lead-inline">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="text-[1.5rem] font-medium leading-[1.2] text-[#1b1b1b] sm:text-[1.875rem]">
            Хотите консультацию по курсу HSK {recommendedLevel}?
          </h2>
          <p className="mt-3 max-w-[480px] text-base leading-[1.55] text-[#4b4b4b]">
            Оставьте телефон — куратор перезвонит в удобное время, расскажет про
            группы, расписание и стоимость с налоговым вычетом 13%.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="hsk-test-lead-form"
          aria-busy={status === "submitting"}
        >
          <label className="hsk-test-name-input">
            <span>Ваше имя</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Например, Анна"
            />
          </label>
          <label className="hsk-test-name-input">
            <span>Телефон</span>
            <input
              type="tel"
              name="phone"
              required
              autoComplete="tel"
              placeholder="+7"
              inputMode="tel"
            />
          </label>
          <label className="hsk-test-lead-consent">
            <input type="checkbox" name="consent_pd" defaultChecked />
            <span>
              Соглашаюсь с обработкой персональных данных согласно{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
                target="_blank"
              >
                политике конфиденциальности
              </Link>
            </span>
          </label>
          {error ? (
            <p role="alert" className="hsk-test-lead-error">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="hsk-test-next hsk-test-lead-submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Отправляем…" : "Жду звонок"}
          </button>
        </form>
      </div>
    </div>
  );
}
