import { dispatchLead, type LeadInput } from "@/lib/lead-dispatch";
import { checkRateLimit, hashIp } from "@/lib/leads/rate-limit";
import { markLeadDelivered, storeLead, type LeadInsert } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_TEXT_VERSION = "v1-2026-05-19";
const PHONE_REGEX = /^\+?[\d\s()-]{10,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  course?: unknown;
  call_time?: unknown;
  callTime?: unknown;
  message?: unknown;
  comment?: unknown;
  source_page?: unknown;
  source?: unknown;
  referrer?: unknown;
  utm?: unknown;
  company?: unknown;
  website?: unknown;
  url?: unknown;
  fax?: unknown;
  form_started_at?: unknown;
  consent?: unknown;
  consent_pd?: unknown;
  consent_marketing?: unknown;
};

function sanitize(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function sanitizeUtm(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const allowed = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ]);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key, v]) => allowed.has(key) && typeof v === "string")
      .map(([key, v]) => [key, sanitize(v, 200)] as [string, string])
      .filter(([, v]) => v),
  );
}

function isSpamPayload(body: LeadPayload): boolean {
  const honeypotValues = [body.company, body.website, body.url, body.fax];
  if (honeypotValues.some((value) => typeof value === "string" && value.trim() !== "")) {
    return true;
  }

  if (typeof body.form_started_at === "string") {
    const startedAt = Number(body.form_started_at);
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 800) return true;
  }

  return false;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON object");
    }
    body = parsed as LeadPayload;
  } catch {
    return Response.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }

  if (isSpamPayload(body)) {
    return Response.json({ ok: true, accepted: true }, { status: 200 });
  }

  const ipHash = hashIp(getClientIp(request));
  const rateLimit = await checkRateLimit(ipHash);
  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 },
    );
  }

  const consentPd = body.consent_pd === true || body.consent === true;
  if (!consentPd) {
    return Response.json(
      { ok: false, field: "consent_pd", error: "Подтвердите согласие на обработку данных" },
      { status: 400 },
    );
  }

  const name = sanitize(body.name, 120);
  const phone = sanitize(body.phone, 32);
  const email = sanitize(body.email, 200);
  const course = sanitize(body.course, 120);
  const callTime = sanitize(body.call_time || body.callTime, 120);
  const message = sanitize(body.message || body.comment, 2000);
  const sourcePage = sanitize(body.source_page || body.source, 300);
  const referrer = sanitize(body.referrer || request.headers.get("referer"), 500);
  const userAgent = sanitize(request.headers.get("user-agent"), 500);
  const utm = sanitizeUtm(body.utm);

  if (name.length < 2) {
    return Response.json(
      { ok: false, field: "name", error: "Укажите имя" },
      { status: 400 },
    );
  }
  if (!PHONE_REGEX.test(phone)) {
    return Response.json(
      { ok: false, field: "phone", error: "Укажите корректный телефон" },
      { status: 400 },
    );
  }
  if (email && !EMAIL_REGEX.test(email)) {
    return Response.json(
      { ok: false, field: "email", error: "Email указан некорректно" },
      { status: 400 },
    );
  }

  const leadInsert: LeadInsert = {
    name,
    phone,
    email: email || undefined,
    course: course || undefined,
    call_time: callTime || undefined,
    message: message || undefined,
    consent_pd: true,
    consent_marketing: body.consent_marketing === true,
    consent_text_version: CONSENT_TEXT_VERSION,
    consent_accepted_at: new Date().toISOString(),
    source_page: sourcePage || undefined,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    yclid: utm.yclid,
    gclid: utm.gclid,
    referrer: referrer || undefined,
    ip_hash: ipHash,
    user_agent: userAgent || undefined,
  };

  const stored = await storeLead(leadInsert);
  if (!stored.ok) {
    console.error("[lead] store failed", stored.error);
    return Response.json(
      { ok: false, error: "Не удалось сохранить заявку. Попробуйте ещё раз." },
      { status: 500 },
    );
  }

  const lead: LeadInput = {
    id: stored.id,
    ...leadInsert,
  };

  const result = await dispatchLead(lead);
  const emailResult = result.delivered.find((item) => item.channel === "email");
  await markLeadDelivered(stored.id, emailResult?.ok === true, emailResult?.ok ? undefined : emailResult?.detail);

  return Response.json(
    {
      ok: true,
      id: stored.id,
      delivered: result.delivered.filter((item) => item.ok).length,
      attempted: result.attempted,
    },
    { status: 200 },
  );
}
