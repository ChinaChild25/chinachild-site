"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Camera, ExternalLink, FileText, Link2, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "@/app/careers/careers.module.css";
import {
  isValidCandidateName,
  isValidEmail,
  isValidHttpUrl,
  isValidRussianPhone,
  normalizeCandidateName,
  normalizeEmail,
  normalizeRussianPhone,
} from "@/lib/careers/application-validation";

const InvisibleSmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((module) => module.InvisibleSmartCaptcha),
  { ssr: false },
);

type Status = "idle" | "submitting" | "success" | "error";
type FormError = { field?: string; message: string };
type ResumeMode = "file" | "link";
const SAVED_PROFILE_KEY = "chinachild-career-profile:v1";

function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const readTheme = () => setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function appendAttribution(formData: FormData) {
  const params = new URLSearchParams(window.location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid", "gclid"]) {
    const value = params.get(key);
    if (value) formData.set(key, value);
  }
  formData.set("source_page", window.location.pathname + window.location.search);
  formData.set("referrer", document.referrer);
}

export default function CareerApplicationForm({ careerSlug }: { careerSlug: string }) {
  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const portfolioId = useId();
  const resumeId = useId();
  const commentId = useId();
  const consentId = useId();
  const companyId = useId();
  const websiteId = useId();
  const startedAt = useRef(Date.now());
  const submitting = useRef(false);
  const avatarPreviewRef = useRef("");
  const [status, setStatus] = useState<Status>("idle");
  const captchaTokenRef = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeMode, setResumeMode] = useState<ResumeMode>("link");
  const [resumeFileName, setResumeFileName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [consentPd, setConsentPd] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const theme = useSiteTheme();
  const captchaSiteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY;
  const validFirstName = isValidCandidateName(firstName);
  const validLastName = isValidCandidateName(lastName);
  const validPhone = isValidRussianPhone(phone);
  const validEmail = isValidEmail(email);
  const hasValidResume = resumeMode === "file"
    ? Boolean(resumeFileName)
    : isValidHttpUrl(portfolioUrl);
  const canSubmit =
    status !== "submitting" &&
    validFirstName &&
    validLastName &&
    validPhone &&
    validEmail &&
    hasValidResume &&
    consentPd;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_PROFILE_KEY) || "null") as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        portfolioUrl?: string;
      } | null;
      if (!saved) return;
      setFirstName(saved.firstName || "");
      setLastName(saved.lastName || "");
      setPhone(saved.phone || "");
      setEmail(saved.email || "");
      setPortfolioUrl(saved.portfolioUrl || "");
    } catch {
      localStorage.removeItem(SAVED_PROFILE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
  }, []);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
    const nextPreview = file ? URL.createObjectURL(file) : "";
    avatarPreviewRef.current = nextPreview;
    setAvatarPreview(nextPreview);
  }

  function saveProfile() {
    try {
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        portfolioUrl,
      }));
      setSavedStatus("Данные сохранены на этом устройстве");
    } catch {
      setSavedStatus("Браузер не разрешил сохранить данные");
    }
  }

  function handleCaptchaSuccess(token: string) {
    captchaTokenRef.current = token;
    setCaptchaVisible(false);
    window.setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const normalizedFirstName = normalizeCandidateName(firstName);
    const normalizedLastName = normalizeCandidateName(lastName);
    const normalizedPhone = normalizeRussianPhone(phone);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedFirstName) {
      setStatus("error");
      setError({ field: "first_name", message: "Укажите корректное имя." });
      return;
    }
    if (!normalizedLastName) {
      setStatus("error");
      setError({ field: "last_name", message: "Укажите корректную фамилию." });
      return;
    }
    if (!normalizedPhone) {
      setStatus("error");
      setError({ field: "phone", message: "Укажите российский номер телефона." });
      return;
    }
    if (!normalizedEmail) {
      setStatus("error");
      setError({ field: "email", message: "Укажите корректный email." });
      return;
    }

    const formData = new FormData(form);
    formData.set("first_name", normalizedFirstName);
    formData.set("last_name", normalizedLastName);
    formData.set("name", `${normalizedFirstName} ${normalizedLastName}`);
    formData.set("phone", normalizedPhone);
    formData.set("email", normalizedEmail);
    formData.delete("avatar");
    const files = formData.getAll("resume").filter(
      (value): value is File => value instanceof File && value.size > 0,
    );
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (files.length > 4 || totalBytes > 3_000_000) {
      setStatus("error");
      setError({ field: "resume", message: "Можно прикрепить до 4 файлов общим размером не больше 3 МБ." });
      return;
    }
    if (!files.length && !String(formData.get("portfolio_url") || "").trim()) {
      setStatus("error");
      setError({ field: "resume", message: "Прикрепите резюме или добавьте ссылку." });
      return;
    }
    if (formData.get("consent_pd") !== "on") {
      setStatus("error");
      setError({ field: "consent_pd", message: "Нужно согласие на обработку данных кандидата." });
      return;
    }

    if (captchaSiteKey && !captchaTokenRef.current) {
      setCaptchaVisible(true);
      return;
    }

    formData.set("career", careerSlug);
    formData.set("form_started_at", String(startedAt.current));
    formData.set("smart_token", captchaTokenRef.current);
    appendAttribution(formData);
    submitting.current = true;
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/careers/apply", { method: "POST", body: formData });
      const result = (await response.json()) as {
        ok?: boolean;
        accepted?: boolean;
        sent?: boolean;
        error?: string;
        field?: string;
      };
      if (!response.ok || result.ok !== true || result.accepted !== true || result.sent !== true) {
        setStatus("error");
        setError({ field: result.field, message: result.error || "Не удалось отправить отклик. Попробуйте ещё раз." });
        return;
      }
      form.reset();
      startedAt.current = Date.now();
      captchaTokenRef.current = "";
      setCaptchaVisible(false);
      setCaptchaResetKey((value) => value + 1);
      setStatus("success");
    } catch {
      setStatus("error");
      setError({ message: "Сетевая ошибка. Проверьте соединение и попробуйте ещё раз." });
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className={styles.success}>
        <h3>Отклик отправлен</h3>
        <p>Мы получили письмо и свяжемся, если ваш опыт совпадёт с задачами вакансии.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={status === "submitting"}>
      <div className={styles.profileCard}>
        <label className={styles.avatarUpload}>
          <input
            name="avatar"
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            className={styles.visuallyHidden}
            onChange={handleAvatarChange}
          />
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Выбранная фотография" fill sizes="112px" unoptimized className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarPlaceholder} aria-hidden="true">
              <Camera size={30} strokeWidth={1.8} />
            </span>
          )}
          <span className={styles.avatarHover}><Upload size={16} />Загрузить фото</span>
        </label>

        <div className={styles.profileFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={firstNameId}>Имя</label>
            <input id={firstNameId} name="first_name" type="text" required minLength={2} maxLength={60} autoComplete="given-name" className={styles.input} value={firstName} onChange={(event) => setFirstName(event.target.value)} aria-invalid={(Boolean(firstName) && !validFirstName) || error?.field === "first_name" || undefined} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={lastNameId}>Фамилия</label>
            <input id={lastNameId} name="last_name" type="text" required minLength={2} maxLength={60} autoComplete="family-name" className={styles.input} value={lastName} onChange={(event) => setLastName(event.target.value)} aria-invalid={(Boolean(lastName) && !validLastName) || error?.field === "last_name" || undefined} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={phoneId}>Телефон для связи</label>
            <input id={phoneId} name="phone" type="tel" required maxLength={32} autoComplete="tel" placeholder="+7 999 000 00 00" className={styles.input} value={phone} onChange={(event) => setPhone(event.target.value)} aria-invalid={(Boolean(phone) && !validPhone) || error?.field === "phone" || undefined} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={emailId}>Почта для связи</label>
            <input id={emailId} name="email" type="email" required maxLength={200} autoComplete="email" className={styles.input} value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={(Boolean(email) && !validEmail) || error?.field === "email" || undefined} />
          </div>
        </div>

        <div className={styles.resumeField}>
          <div className={styles.label}>Резюме</div>
          <div className={styles.resumeRow}>
            <div className={styles.resumeTabs} role="tablist" aria-label="Способ добавления резюме">
              <button type="button" role="tab" aria-selected={resumeMode === "file"} className={resumeMode === "file" ? styles.resumeTabActive : styles.resumeTab} onClick={() => setResumeMode("file")}>Файл</button>
              <button type="button" role="tab" aria-selected={resumeMode === "link"} className={resumeMode === "link" ? styles.resumeTabActive : styles.resumeTab} onClick={() => setResumeMode("link")}>Ссылка</button>
            </div>

            {resumeMode === "file" ? (
              <label className={styles.resumeFile} htmlFor={resumeId}>
                <input id={resumeId} name="resume" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className={styles.visuallyHidden} onChange={(event) => setResumeFileName(event.target.files?.[0]?.name || "")} aria-invalid={error?.field === "resume" || undefined} />
                <FileText size={20} aria-hidden="true" />
                <span>{resumeFileName || "Выбрать файл"}</span>
                <span className={styles.resumeFileHint}>PDF, DOC, DOCX, PNG или JPG · до 3 МБ</span>
              </label>
            ) : (
              <div className={styles.resumeLink}>
                <Link2 size={21} aria-hidden="true" />
                <input id={portfolioId} name="portfolio_url" type="url" maxLength={500} value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} placeholder="Добавить ссылку" aria-label="Ссылка на резюме" aria-invalid={error?.field === "portfolio_url" || undefined} />
                {portfolioUrl ? (
                  <>
                    <button type="button" className={styles.iconButton} onClick={() => setPortfolioUrl("")} aria-label="Удалить ссылку"><X size={20} /></button>
                    <a className={styles.openLink} href={portfolioUrl} target="_blank" rel="noreferrer">Открыть<ExternalLink size={18} /></a>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <button type="button" className={styles.saveProfile} onClick={saveProfile}>Сохранить данные</button>
        {savedStatus ? <div className={styles.savedStatus} role="status">{savedStatus}</div> : null}
      </div>

      <div className={styles.coverLetter}>
        <label className={styles.coverLetterLabel} htmlFor={commentId}>Сопроводительное письмо</label>
        <span className={styles.coverLetterHint}>Расскажите, почему вам интересна эта вакансия</span>
        <textarea id={commentId} name="comment" maxLength={1000} rows={7} className={styles.coverLetterInput} />
      </div>

      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor={companyId}>Компания</label>
        <input id={companyId} name="company" type="text" tabIndex={-1} autoComplete="off" />
        <label htmlFor={websiteId}>Сайт</label>
        <input id={websiteId} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.consents}>
        <p className={styles.consentIntro}>
          Я даю <a href="/consent-career-personal-data" target="_blank" rel="noreferrer">согласие</a> ИП Толкачевой Ирине Владимировне на обработку моих персональных данных, указанных в настоящей форме, на условиях, определённых в <a href="/privacy-policy" target="_blank" rel="noreferrer">Политике</a>, в целях:
        </p>
        <label className={styles.checkbox} htmlFor={consentId}>
          <input id={consentId} name="consent_pd" type="checkbox" required checked={consentPd} onChange={(event) => setConsentPd(event.target.checked)} aria-invalid={error?.field === "consent_pd" || undefined} />
          <span>Рассмотрения моей кандидатуры на вакантную должность.</span>
        </label>
        <label className={styles.checkbox}>
          <input name="consent_jobs" type="checkbox" />
          <span>Направления мне информации о подходящих вакансиях, а также материалов о карьере и мероприятиях ChinaChild.</span>
        </label>
        <label className={styles.checkbox}>
          <input name="consent_events" type="checkbox" />
          <span>Направления мне приглашений на мероприятия, а также материалов о проектах и технологиях ChinaChild.</span>
        </label>
      </div>

      {captchaSiteKey ? (
        <InvisibleSmartCaptcha
          key={`${captchaResetKey}-${theme}`}
          sitekey={captchaSiteKey}
          visible={captchaVisible}
          hideShield
          onSuccess={handleCaptchaSuccess}
          onTokenExpired={() => { captchaTokenRef.current = ""; }}
          theme={theme}
          language="ru"
        />
      ) : null}

      {status === "error" && error ? <div role="alert" className={styles.formError}>{error.message}</div> : null}
      <button type="submit" disabled={!canSubmit} className={styles.submit}>
        {status === "submitting" ? "Отправляем…" : "Отправить отклик"}
      </button>
    </form>
  );
}
