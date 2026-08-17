import { dispatchLead, type LeadInput } from "@/lib/lead-dispatch";
import {
  getConsentMarketingContentHash,
  getConsentPdContentHash,
} from "@/lib/legal/consent-hash.server";
import { CONSENT_MARKETING_VERSION } from "@/lib/legal/consent-marketing";
import { CONSENT_PD_VERSION } from "@/lib/legal/consent-pd";
import { PD_CONSENT_REQUIRED_MESSAGE } from "@/lib/legal/consent-copy";
import { isSpamPayload } from "@/lib/leads/anti-abuse";
import { checkRateLimit, hashIp } from "@/lib/leads/rate-limit";
import { markLeadDelivered, storeLead, type LeadInsert } from "@/lib/leads/store";
import { trackServerLead } from "@/lib/analytics/yandex-metrika-server";
import { after } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  page_path?: unknown;
  referrer?: unknown;
  utm?: unknown;
  company?: unknown;
  website?: unknown;
  url?: unknown;
  fax?: unknown;
  form_started_at?: unknown;
  smart_token?: unknown;
  consent?: unknown;
  consent_pd?: unknown;
  consent_marketing?: unknown;
  yandex_client_id?: unknown;
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

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

async function validateSmartCaptcha(
  token: string,
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, error: "Подтвердите, что вы не робот" };

  const body = new URLSearchParams({ secret, token, ip });

  try {
    const response = await fetch("https://smartcaptcha.cloud.yandex.ru/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      console.error("[lead] smartcaptcha non-200", response.status, await response.text());
      return { ok: true };
    }
    const data = (await response.json()) as { status?: string; message?: string };
    if (data.status === "ok") return { ok: true };
    return { ok: false, error: "Проверка SmartCaptcha не пройдена" };
  } catch (error) {
    console.error("[lead] smartcaptcha failed", error);
    return { ok: true };
  }
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
    return Response.json(
      { ok: true, accepted: false, persisted: false },
      { status: 200 },
    );
  }

  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);
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
      { ok: false, field: "consent_pd", error: PD_CONSENT_REQUIRED_MESSAGE },
      { status: 400 },
    );
  }
  const consentMarketing = body.consent_marketing === true;

  const name = sanitize(body.name, 120);
  const phone = sanitize(body.phone, 32);
  const email = sanitize(body.email, 200);
  const course = sanitize(body.course, 120);
  const callTime = sanitize(body.call_time || body.callTime, 120);
  const message = sanitize(body.message || body.comment, 2000);
  const sourcePage = sanitize(body.source_page || body.source, 300);
  const pagePath = sanitize(body.page_path, 300);
  const referrer = sanitize(body.referrer || request.headers.get("referer"), 500);
  const userAgent = sanitize(request.headers.get("user-agent"), 500);
  const smartToken = sanitize(body.smart_token, 4000);
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

  const captcha = await validateSmartCaptcha(smartToken, clientIp);
  if (!captcha.ok) {
    return Response.json(
      { ok: false, field: "smart-token", error: captcha.error },
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
    consent_marketing: consentMarketing,
    // Version + hash are always computed server-side from the canonical documents —
    // never trust a client-supplied version or hash for legal evidence.
    consent_pd_version: CONSENT_PD_VERSION,
    consent_pd_content_hash: getConsentPdContentHash(),
    consent_marketing_version: CONSENT_MARKETING_VERSION,
    consent_marketing_content_hash: getConsentMarketingContentHash(),
    consent_accepted_at: new Date().toISOString(),
    source_page: sourcePage || undefined,
    consent_page_path: pagePath || undefined,
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

  const serverTrackingInput = {
    explicitClientId: body.yandex_client_id,
    sourceUrl: request.headers.get("referer") || sourcePage || undefined,
    cookieHeader: request.headers.get("cookie"),
    userAgent: userAgent || null,
    clientIp,
  };
  try {
    after(async () => {
      const tracking = await trackServerLead(serverTrackingInput);
      if (!tracking.ok) {
        console.error("[ym-server] stored lead event not sent", {
          kind: tracking.kind,
          status: tracking.status,
          error: tracking.error,
        });
      }
    });
  } catch (error) {
    console.error(
      "[ym-server] could not schedule stored lead event",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  return Response.json(
    {
      ok: true,
      accepted: true,
      persisted: true,
      id: stored.id,
      delivered: result.delivered.filter((item) => item.ok).length,
      attempted: result.attempted,
    },
    { status: 200 },
  );
}
