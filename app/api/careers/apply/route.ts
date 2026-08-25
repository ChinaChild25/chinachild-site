import { createHash, randomUUID } from "node:crypto";
import { buildCareerEmail } from "@/lib/email/career-template";
import { sendEmail } from "@/lib/email/smtp";
import { getCareerBySlug } from "@/lib/careers";
import {
  isValidHttpUrl,
  normalizeCandidateName,
  normalizeEmail,
  normalizePhone,
} from "@/lib/careers/application-validation";
import type {
  CareerApplication,
  CareerAttachment,
} from "@/lib/careers/application.server";
import { CAREER_CONSENT_VERSION } from "@/lib/legal/career-consent";
import { isSpamPayload } from "@/lib/leads/anti-abuse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAREER_EMAIL_TO =
  process.env.CAREER_EMAIL_TO || "chinachild@yandex.ru";
const MAX_REQUEST_BYTES = 4_200_000;
const MAX_FILES = 4;
const MAX_FILES_BYTES = 3_000_000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = process.env.NODE_ENV === "production" ? 5 : 50;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

const FILE_TYPES: Record<
  string,
  { contentType: string; signature: (bytes: Uint8Array) => boolean }
> = {
  pdf: {
    contentType: "application/pdf",
    signature: (bytes) => Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "%PDF",
  },
  doc: {
    contentType: "application/msword",
    signature: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0,
  },
  docx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signature: (bytes) =>
      bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b,
  },
  png: {
    contentType: "image/png",
    signature: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47,
  },
  jpg: {
    contentType: "image/jpeg",
    signature: (bytes) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  jpeg: {
    contentType: "image/jpeg",
    signature: (bytes) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
};

function textValue(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "chinachild-careers";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function checkRateLimit(key: string, now = Date.now()): boolean {
  for (const [bucketKey, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
  }

  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

function readUtm(form: FormData): Record<string, string> {
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ];
  return Object.fromEntries(
    keys
      .map((key) => [key, textValue(form, key, 200)] as const)
      .filter(([, value]) => value),
  );
}

async function validateSmartCaptcha(
  token: string,
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, error: "Подтвердите, что вы не робот" };

  try {
    const response = await fetch("https://smartcaptcha.cloud.yandex.ru/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, token, ip }),
    });
    if (!response.ok) {
      console.error("[career] smartcaptcha non-200", response.status);
      return { ok: true };
    }
    const result = (await response.json()) as { status?: string };
    return result.status === "ok"
      ? { ok: true }
      : { ok: false, error: "Проверка SmartCaptcha не пройдена" };
  } catch (error) {
    console.error("[career] smartcaptcha failed", error);
    return { ok: true };
  }
}

function safeFilename(value: string): string {
  return value
    .normalize("NFKC")
    .replaceAll(/[^\p{L}\p{N}._ -]/gu, "_")
    .slice(0, 120);
}

async function readAttachments(files: File[]): Promise<{
  ok: true;
  attachments: CareerAttachment[];
} | {
  ok: false;
  error: string;
}> {
  if (files.length > MAX_FILES) {
    return { ok: false, error: `Можно прикрепить не больше ${MAX_FILES} файлов` };
  }
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_FILES_BYTES) {
    return { ok: false, error: "Общий размер файлов не должен превышать 3 МБ" };
  }

  const attachments: CareerAttachment[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = FILE_TYPES[extension];
    if (!allowed) {
      return { ok: false, error: "Поддерживаются PDF, DOC, DOCX, PNG и JPG" };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!allowed.signature(bytes)) {
      return { ok: false, error: `Файл «${safeFilename(file.name)}» повреждён или имеет неверный формат` };
    }
    attachments.push({
      filename: safeFilename(file.name) || `document.${extension}`,
      contentType: allowed.contentType,
      content: Buffer.from(bytes),
    });
  }
  return { ok: true, attachments };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { ok: false, error: "Файлы слишком большие. Максимум — 3 МБ суммарно." },
      { status: 413 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
  }

  if (
    isSpamPayload({
      company: form.get("company"),
      website: form.get("website"),
      form_started_at: form.get("form_started_at"),
    })
  ) {
    return Response.json({ ok: true, accepted: false, sent: false });
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  if (!checkRateLimit(ipHash)) {
    return Response.json(
      { ok: false, error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 },
    );
  }

  const careerSlug = textValue(form, "career", 100);
  const career = getCareerBySlug(careerSlug);
  if (!career) {
    return Response.json({ ok: false, field: "career", error: "Вакансия не найдена" }, { status: 400 });
  }

  const firstName = normalizeCandidateName(textValue(form, "first_name", 60));
  const lastName = normalizeCandidateName(textValue(form, "last_name", 60));
  const phone = normalizePhone(textValue(form, "phone", 32));
  const email = normalizeEmail(textValue(form, "email", 200));
  const experience = textValue(form, "experience", 2500);
  const salaryExpectations = textValue(form, "salary_expectations", 200);
  const portfolioUrl = textValue(form, "portfolio_url", 500);
  const comment = textValue(form, "comment", 1000);
  const sourcePage = textValue(form, "source_page", 400);
  const referrer = textValue(form, "referrer", 500);
  const smartToken = textValue(form, "smart_token", 4000);

  if (!firstName) {
    return Response.json({ ok: false, field: "first_name", error: "Укажите корректное имя" }, { status: 400 });
  }
  if (!lastName) {
    return Response.json({ ok: false, field: "last_name", error: "Укажите корректную фамилию" }, { status: 400 });
  }
  if (!phone) {
    return Response.json({ ok: false, field: "phone", error: "Укажите корректный номер телефона с кодом страны" }, { status: 400 });
  }
  if (!email) {
    return Response.json({ ok: false, field: "email", error: "Укажите корректный email" }, { status: 400 });
  }
  if (portfolioUrl && !isValidHttpUrl(portfolioUrl)) {
    return Response.json({ ok: false, field: "portfolio_url", error: "Ссылка указана некорректно" }, { status: 400 });
  }

  const name = `${firstName} ${lastName}`;
  if (form.get("consent_pd") !== "on") {
    return Response.json(
      { ok: false, field: "consent_pd", error: "Нужно согласие на обработку данных кандидата" },
      { status: 400 },
    );
  }

  const resume = form.get("resume");
  const certificateFiles = form.getAll("certificates");
  const files = [resume, ...certificateFiles].filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
  if (!files.length && !portfolioUrl) {
    return Response.json(
      { ok: false, field: "resume", error: "Прикрепите резюме или добавьте ссылку" },
      { status: 400 },
    );
  }

  const parsedFiles = await readAttachments(files);
  if (!parsedFiles.ok) {
    return Response.json({ ok: false, field: "resume", error: parsedFiles.error }, { status: 400 });
  }

  const captcha = await validateSmartCaptcha(smartToken, ip);
  if (!captcha.ok) {
    return Response.json({ ok: false, field: "smart_token", error: captcha.error }, { status: 400 });
  }

  const application: CareerApplication = {
    id: randomUUID(),
    careerSlug,
    name,
    phone,
    email,
    experience: experience || undefined,
    salaryExpectations: salaryExpectations || undefined,
    portfolioUrl: portfolioUrl || undefined,
    comment: comment || undefined,
    sourcePage: sourcePage || undefined,
    referrer: referrer || undefined,
    utm: readUtm(form),
    acceptedAt: new Date().toISOString(),
    consentVersion: CAREER_CONSENT_VERSION,
    ipHash,
    userAgent: request.headers.get("user-agent")?.slice(0, 500) || undefined,
    attachments: parsedFiles.attachments,
  };

  const message = buildCareerEmail({
    id: application.id,
    career,
    name: application.name,
    phone: application.phone,
    email: application.email,
    experience: application.experience,
    salaryExpectations: application.salaryExpectations,
    comment: application.comment,
    portfolioUrl: application.portfolioUrl,
    sourcePage: application.sourcePage,
    filenames: application.attachments.map((file) => file.filename),
  });
  const sent = await sendEmail({
    to: CAREER_EMAIL_TO,
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: application.email,
    attachments: application.attachments,
    headers: {
      "X-ChinaChild-Flow": "careers",
      "X-ChinaChild-Career": application.careerSlug,
    },
  });
  if (!sent.ok) {
    console.error("[career] email failed", sent.error);
    return Response.json(
      { ok: false, error: "Не удалось отправить отклик. Попробуйте ещё раз." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, accepted: true, sent: true, id: application.id });
}
