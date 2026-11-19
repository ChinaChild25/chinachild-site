import { attachLeadAttribution } from "@/lib/leads/attribution.server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, hashIp } from "@/lib/leads/rate-limit";
import {
  listWebsiteChatMessages,
  newWebsiteChatVisitorKey,
  postWebsiteChatMessage,
  validWebsiteChatVisitorKey,
  WEBSITE_CHAT_COOKIE,
} from "@/lib/website-chat/server";

export const runtime = "nodejs";

function visitorFromCookie(request: Request): string | null {
  const match = request.headers.get("cookie")?.match(/(?:^|;\s*)cc_website_chat_visitor=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return validWebsiteChatVisitorKey(value) ? value : null;
}

function withVisitorCookie(response: NextResponse, visitorKey: string): NextResponse {
  response.cookies.set(WEBSITE_CHAT_COOKIE, visitorKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return response;
}

export async function GET(request: Request) {
  const visitorKey = visitorFromCookie(request);
  if (!visitorKey) return NextResponse.json({ ok: true, conversationId: null, leadId: null, messages: [] });
  const after = new URL(request.url).searchParams.get("after");
  try {
    return NextResponse.json({ ok: true, ...(await listWebsiteChatMessages(visitorKey, after)) });
  } catch {
    return NextResponse.json({ ok: false, error: "Не удалось обновить сообщения" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) {
    return NextResponse.json({ ok: false, error: "Сообщение слишком большое" }, { status: 413 });
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = forwarded || request.headers.get("x-real-ip") || "unknown";
  const limit = await checkRateLimit(hashIp(clientIp));
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Слишком много сообщений. Попробуйте позже." }, { status: 429 });
  }
  const body = await request.json().catch(() => null) as {
    clientNonce?: unknown; text?: unknown; sourcePage?: unknown;
    analytics_consent?: unknown; attribution?: unknown; yandex_client_id?: unknown;
  } | null;
  if (!body || typeof body.text !== "string") {
    return NextResponse.json({ ok: false, error: "Сообщение пустое" }, { status: 400 });
  }
  const visitorKey = visitorFromCookie(request) ?? newWebsiteChatVisitorKey();
  const clientNonce = typeof body.clientNonce === "string" ? body.clientNonce : randomUUID();
  const sourcePage = typeof body.sourcePage === "string" ? body.sourcePage.split(/[?#]/, 1)[0] : "/";
  try {
    const posted = await postWebsiteChatMessage({ visitorKey, clientNonce, text: body.text, sourcePage });
    if (posted.inserted) await attachLeadAttribution(posted.lead_id, body);
    return withVisitorCookie(NextResponse.json({
      ok: true,
      conversationId: posted.conversation_id,
      leadId: posted.lead_id,
      inserted: posted.inserted,
      message: posted.message,
    }), visitorKey);
  } catch (error) {
    const invalid = error instanceof Error && /invalid|message/i.test(error.message);
    return withVisitorCookie(NextResponse.json({
      ok: false,
      error: invalid ? "Введите сообщение от 1 до 8000 символов" : "Не удалось отправить сообщение",
    }, { status: invalid ? 400 : 503 }), visitorKey);
  }
}
