import { dispatchLead, type LeadInput } from "@/lib/lead-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_REGEX = /^[+\d][\d\s().-]{7,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  course?: unknown;
  comment?: unknown;
  source?: unknown;
  utm?: unknown;
  // honeypot — bots fill, humans don't see it
  company?: unknown;
  consent?: unknown;
};

function sanitize(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return Response.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }

  // Honeypot — silently accept and drop bot submissions
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true, accepted: true }, { status: 202 });
  }

  if (body.consent !== true) {
    return Response.json(
      { ok: false, error: "Подтвердите согласие на обработку данных" },
      { status: 400 },
    );
  }

  const name = sanitize(body.name, 120);
  const phone = sanitize(body.phone, 32);
  const email = sanitize(body.email, 200);
  const course = sanitize(body.course, 120);
  const comment = sanitize(body.comment, 2000);
  const source = sanitize(body.source, 200);

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

  const utmRecord =
    body.utm && typeof body.utm === "object" && !Array.isArray(body.utm)
      ? Object.fromEntries(
          Object.entries(body.utm as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .map(([k, v]) => [sanitize(k, 60), sanitize(v, 200)] as [string, string])
            .filter(([k, v]) => k && v),
        )
      : undefined;

  const lead: LeadInput = {
    name,
    phone,
    email: email || undefined,
    course: course || undefined,
    comment: comment || undefined,
    source: source || undefined,
    utm: utmRecord,
  };

  const result = await dispatchLead(lead);

  return Response.json(
    {
      ok: true,
      delivered: result.delivered.length,
      attempted: result.attempted,
    },
    { status: 200 },
  );
}
