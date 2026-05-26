"use client";

import { SmartCaptcha } from "@yandex/smart-captcha";
import { useEffect, useId, useState } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const COURSE_OPTIONS = [
  { value: "", label: "—" },
  { value: "online-chinese", label: "Онлайн-курс с нуля (HSK 1–2)" },
  { value: "hsk-preparation", label: "Подготовка к HSK" },
  { value: "chinese-for-adults", label: "Китайский для взрослых" },
  { value: "chinese-for-kids", label: "Китайский для школьников 12+" },
  { value: "business-chinese", label: "Бизнес-китайский" },
  { value: "consultation", label: "Просто проконсультироваться" },
] as const;

type Status = "idle" | "submitting" | "success" | "error";
type FieldError = { field?: string; message: string };

export type LeadFormProps = {
  defaultCourse?: string;
  source?: string;
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

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
};

function trackLeadSubmitted(meta: { course?: string; source?: string }) {
  if (typeof window === "undefined") return;
  const win = window as AnalyticsWindow;
  const counterIdRaw = process.env.NEXT_PUBLIC_YM_ID;
  const counterId = counterIdRaw ? Number(counterIdRaw) : NaN;

  try {
    if (typeof win.ym === "function" && Number.isFinite(counterId)) {
      win.ym(counterId, "reachGoal", "lead_submitted", {
        course: meta.course,
        source: meta.source,
      });
    }
  } catch {
    /* */
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

function scheduleLeadSubmitted(meta: { course?: string; source?: string }) {
  if (typeof window === "undefined") return;
  const win = window as IdleWindow;
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(() => trackLeadSubmitted(meta), { timeout: 1500 });
    return;
  }
  window.setTimeout(() => trackLeadSubmitted(meta), 0);
}

export default function LeadForm({ defaultCourse, source, compact }: LeadFormProps) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const courseId = useId();
  const timeId = useId();
  const messageId = useId();
  const consentId = useId();
  const marketingId = useId();
  const honeypotId = useId();
  const websiteHoneypotId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FieldError | null>(null);
  const [pageHref, setPageHref] = useState<string>("");
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaResetKey, setCaptchaResetKey] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageHref(window.location.pathname + window.location.search);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    // Capture the form node before awaiting fetch — React releases the
    // synthetic event after the handler returns, so event.currentTarget is
    // null by the time we'd otherwise call .reset() on it, which surfaced as
    // "Cannot read properties of null (reading 'reset')" after successful
    // submits.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const consentPd = formData.get("consent_pd") === "on";
    if (!consentPd) {
      setStatus("error");
      setError({
        field: "consent_pd",
        message: "Подтвердите согласие на обработку персональных данных",
      });
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      course: String(formData.get("course") ?? ""),
      call_time: String(formData.get("callTime") ?? ""),
      message: String(formData.get("message") ?? ""),
      smart_token: captchaToken,
      consent_pd: consentPd,
      consent_marketing: formData.get("consent_marketing") === "on",
      company: String(formData.get("company") ?? ""), // honeypot
      website: String(formData.get("website") ?? ""), // honeypot
      form_started_at: String(formStartedAt),
      source_page: source ?? pageHref,
      referrer: typeof document === "undefined" ? "" : document.referrer,
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
      const data = (await res.json()) as { ok: boolean; error?: string; field?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError({
          field: data.field,
          message: data.error ?? "Что-то пошло не так. Попробуйте ещё раз.",
        });
        return;
      }
      setStatus("success");
      scheduleLeadSubmitted({ course: payload.course, source: payload.source_page });
      form.reset();
      setFormStartedAt(Date.now());
      setCaptchaToken("");
      setCaptchaResetKey((k) => k + 1);
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
      <div role="status" aria-live="polite" className="lead-success">
        <div className="lead-success-title">Спасибо! Заявка принята.</div>
        <p className="lead-success-text">
          Менеджер свяжется с вами в течение рабочего дня по указанному телефону.
        </p>
        <div className="lead-success-actions">
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

  const gap = compact ? "lead-form-compact" : "";
  const smartCaptchaSiteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`lead-form ${gap}`}
      aria-busy={status === "submitting"}
    >
      <div className="lead-field">
        <label htmlFor={nameId} className="lead-label">
          <span className="lead-required">*</span> Ваше имя
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          className="lead-input"
          aria-invalid={error?.field === "name" || undefined}
        />
      </div>

      <div className="lead-field">
        <label htmlFor={phoneId} className="lead-label">
          <span className="lead-required">*</span> Телефон
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 999 000 00 00"
          className="lead-input"
          aria-invalid={error?.field === "phone" || undefined}
        />
      </div>

      <div className="lead-field">
        <label htmlFor={emailId} className="lead-label">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          maxLength={200}
          autoComplete="email"
          className="lead-input"
          aria-invalid={error?.field === "email" || undefined}
        />
      </div>

      <div className="lead-field">
        <label htmlFor={courseId} className="lead-label">
          Что вас интересует
        </label>
        <select
          id={courseId}
          name="course"
          defaultValue={defaultCourse ?? ""}
          className="lead-input lead-select"
        >
          {COURSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="lead-field">
        <label htmlFor={timeId} className="lead-label">
          Удобное время для звонка (по будням с 09:00 до 19:00 МСК)
        </label>
        <input
          id={timeId}
          name="callTime"
          type="text"
          maxLength={120}
          className="lead-input"
        />
      </div>

      <div className="lead-field">
        <label htmlFor={messageId} className="lead-label">
          Комментарий
        </label>
        <textarea
          id={messageId}
          name="message"
          maxLength={2000}
          rows={3}
          className="lead-input"
        />
      </div>

      {/* Honeypot */}
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
        <input id={honeypotId} name="company" type="text" tabIndex={-1} autoComplete="off" />
        <label htmlFor={websiteHoneypotId}>Сайт (не заполнять)</label>
        <input id={websiteHoneypotId} name="website" type="url" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor={marketingId} className="lead-checkbox">
        <input
          id={marketingId}
          name="consent_marketing"
          type="checkbox"
          className="lead-checkbox-input"
        />
        <span>Согласен получать новости и предложения школы на email</span>
      </label>

      <label htmlFor={consentId} className="lead-checkbox">
        <span className="lead-required" aria-hidden>
          *
        </span>
        <input
          id={consentId}
          name="consent_pd"
          type="checkbox"
          required
          className="lead-checkbox-input"
          aria-invalid={error?.field === "consent_pd" || undefined}
        />
        <span>
          Я даю согласие на обработку персональных данных в соответствии с{" "}
          <a href="/privacy-policy" className="underline underline-offset-2">
            Политикой конфиденциальности
          </a>
        </span>
      </label>

      {smartCaptchaSiteKey ? (
        <div className="lead-smart-captcha">
          <SmartCaptcha
            key={captchaResetKey}
            sitekey={smartCaptchaSiteKey}
            onSuccess={setCaptchaToken}
            onTokenExpired={() => setCaptchaToken("")}
          />
        </div>
      ) : null}

      {error && status === "error" ? (
        <div role="alert" className="lead-error">
          {error.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="lead-submit"
      >
        {status === "submitting" ? "Отправляем…" : "Отправить"}
      </button>
    </form>
  );
}
