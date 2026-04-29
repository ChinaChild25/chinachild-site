"use client";

import { useEffect, useId, useState } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const COURSE_OPTIONS = [
  { value: "online-chinese", label: "Онлайн-курс с нуля (HSK 1–2)" },
  { value: "hsk-preparation", label: "Подготовка к HSK" },
  { value: "chinese-for-adults", label: "Китайский для взрослых" },
  { value: "chinese-for-kids", label: "Китайский для школьников 12+" },
  { value: "business-chinese", label: "Бизнес-китайский" },
  { value: "consultation", label: "Просто хочу проконсультироваться" },
] as const;

type Status = "idle" | "submitting" | "success" | "error";

type FieldError = { field?: string; message: string };

export type LeadFormProps = {
  /** Default course selection — pre-fills the dropdown when the form opens from a course page */
  defaultCourse?: (typeof COURSE_OPTIONS)[number]["value"];
  /** Source label written into lead metadata so we can attribute leads to surfaces */
  source?: string;
  /** Compact mode for modals — slightly tighter spacing */
  compact?: boolean;
};

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ]) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

type AnalyticsWindow = Window & {
  ym?: (id: number, action: string, target?: string, params?: Record<string, unknown>) => void;
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
};

/**
 * Fire-and-forget conversion goal to every analytics surface that's loaded.
 * Yandex.Metrika reachGoal "lead_submitted" + GA4 event + GTM dataLayer push.
 * Counter ID read from the same env var as the Metrika component so it stays
 * consistent.
 */
function trackLeadSubmitted(meta: { course?: string; source?: string }) {
  if (typeof window === "undefined") return;
  const win = window as AnalyticsWindow;
  const counterIdRaw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const counterId = counterIdRaw ? Number(counterIdRaw) : NaN;

  try {
    if (typeof win.ym === "function" && Number.isFinite(counterId)) {
      win.ym(counterId, "reachGoal", "lead_submitted", {
        course: meta.course,
        source: meta.source,
      });
    }
  } catch {
    /* swallow analytics errors — never block UX */
  }

  try {
    if (typeof win.gtag === "function") {
      win.gtag("event", "generate_lead", {
        event_category: "lead",
        event_label: meta.source ?? "form",
        course: meta.course,
      });
    }
  } catch {
    /* */
  }

  try {
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: "lead_submitted",
        course: meta.course,
        source: meta.source,
      });
    }
  } catch {
    /* */
  }
}

export default function LeadForm({ defaultCourse, source, compact }: LeadFormProps) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const courseId = useId();
  const commentId = useId();
  const consentId = useId();
  const honeypotId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FieldError | null>(null);
  const [pageHref, setPageHref] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageHref(window.location.pathname + window.location.search);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      course: String(formData.get("course") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      consent: formData.get("consent") === "on",
      company: String(formData.get("company") ?? ""), // honeypot
      source: source ?? pageHref,
      utm: readUtm(),
    };

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        field?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError({
          field: data.field,
          message: data.error ?? "Что-то пошло не так. Попробуйте ещё раз.",
        });
        return;
      }
      setStatus("success");
      trackLeadSubmitted({ course: payload.course, source: payload.source });
      event.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError({
        message:
          err instanceof Error
            ? `Сетевая ошибка: ${err.message}`
            : "Сетевая ошибка. Проверьте соединение.",
      });
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="grid gap-4 rounded-3xl bg-[var(--lime-soft)] p-6 text-[#1b1b1b] sm:p-8"
      >
        <div className="text-2xl font-bold tracking-[-0.02em]">
          Спасибо! Заявка принята.
        </div>
        <p className="text-sm leading-7 text-[#4b4b4b]">
          Менеджер свяжется с вами в течение рабочего дня по указанному телефону.
          Если вопрос срочный — напишите или позвоните нам напрямую.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="btn-pill btn-ink">
            Позвонить {CONTACT_PHONE}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn-pill btn-white">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    );
  }

  const gap = compact ? "gap-3" : "gap-4";
  const labelClass =
    "block text-sm font-medium text-[#4e4e4e]";
  const inputClass =
    "mt-1.5 w-full rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-base text-[#1b1b1b] placeholder:text-[#9a9a9a] outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/10";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`grid ${gap}`}
      aria-busy={status === "submitting"}
    >
      <div>
        <label htmlFor={nameId} className={labelClass}>
          Имя <span className="text-[#d83a3a]">*</span>
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className={inputClass}
          aria-invalid={error?.field === "name" || undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={phoneId} className={labelClass}>
            Телефон <span className="text-[#d83a3a]">*</span>
          </label>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 999 000 00 00"
            className={inputClass}
            aria-invalid={error?.field === "phone" || undefined}
          />
        </div>
        <div>
          <label htmlFor={emailId} className={labelClass}>
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="вы@почта.ru"
            className={inputClass}
            aria-invalid={error?.field === "email" || undefined}
          />
        </div>
      </div>

      <div>
        <label htmlFor={courseId} className={labelClass}>
          Что интересует
        </label>
        <select
          id={courseId}
          name="course"
          defaultValue={defaultCourse ?? "online-chinese"}
          className={inputClass}
        >
          {COURSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={commentId} className={labelClass}>
          Комментарий
        </label>
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          maxLength={2000}
          placeholder="Например, удобное время для звонка"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Honeypot — visually hidden, off-screen, not focusable */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor={honeypotId}>Компания (не заполнять)</label>
        <input
          id={honeypotId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label
        htmlFor={consentId}
        className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#6b6b6b]"
      >
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          defaultChecked
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]"
        />
        <span>
          Я согласен(а) с{" "}
          <a
            href="/privacy-policy"
            className="font-semibold text-[#1b1b1b] underline-offset-2 hover:underline"
          >
            политикой конфиденциальности
          </a>{" "}
          и обработкой персональных данных.
        </span>
      </label>

      {error && status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#f6c1c1] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b1c1c]"
        >
          {error.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-pill btn-ink btn-pill-large btn-block mt-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Отправляем…" : "Оставить заявку"}
      </button>

      <p className="text-xs leading-5 text-[#9a9a9a]">
        Менеджер свяжется в течение рабочего дня. Можно сразу позвонить:{" "}
        <a
          href={`tel:${CONTACT_PHONE_TEL}`}
          className="font-semibold text-[#1b1b1b]"
        >
          {CONTACT_PHONE}
        </a>
      </p>
    </form>
  );
}
