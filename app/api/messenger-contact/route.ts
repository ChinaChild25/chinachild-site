import { attachLeadAttribution } from "@/lib/leads/attribution.server";
import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createWebsiteMessengerHandoff } from "@/lib/leads/messenger-handoff";
import { buildWebsiteMessengerUrl, type WebsiteMessengerChannel } from "@/lib/leads/messenger-links";
import { checkRateLimit, hashIp } from "@/lib/leads/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNELS = new Set<WebsiteMessengerChannel>(["telegram", "max", "whatsapp"]);

function cookieValue(header: string | null, key: string): string | null {
  const value = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${key}=`));
  return value ? decodeURIComponent(value.slice(key.length + 1)) : null;
}

export async function POST(request: Request) {
  let fallbackBody: { channel?: unknown; message?: unknown } | null = null;
  try {
    const body = await request.json() as { channel?: unknown; sourcePage?: unknown; message?: unknown; analytics_consent?: unknown; attribution?: unknown; yandex_client_id?: unknown };
    fallbackBody = body;
    if (typeof body.channel !== "string" || !CHANNELS.has(body.channel as WebsiteMessengerChannel)) {
      return NextResponse.json({ ok: false, error: "Неизвестный мессенджер" }, { status: 400 });
    }
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientIp = forwarded || request.headers.get("x-real-ip") || "unknown";
    const limit = await checkRateLimit(hashIp(clientIp));
    if (!limit.allowed) {
      return NextResponse.json({ ok: false, error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }

    const existingVisitor = cookieValue(request.headers.get("cookie"), "cc_messenger_visitor");
    const visitorKey = existingVisitor && /^[0-9a-f-]{36}$/i.test(existingVisitor) ? existingVisitor : randomUUID();
    const handoff = await createWebsiteMessengerHandoff({
      channel: body.channel as WebsiteMessengerChannel,
      visitorKey,
      sourcePage: typeof body.sourcePage === "string" ? body.sourcePage.split(/[?#]/, 1)[0] : "/",
      message: typeof body.message === "string" ? body.message.slice(0, 1000) : "",
    });
    await attachLeadAttribution(handoff.leadId, body);
    const response = NextResponse.json({ ok: true, url: handoff.url });
    response.cookies.set("cc_messenger_visitor", visitorKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("[messenger-contact] handoff failed", error);
    if (typeof fallbackBody?.channel === "string" && CHANNELS.has(fallbackBody.channel as WebsiteMessengerChannel)) {
      const fallbackUrl = buildWebsiteMessengerUrl(
        fallbackBody.channel as WebsiteMessengerChannel,
        randomBytes(24).toString("base64url"),
        typeof fallbackBody.message === "string" ? fallbackBody.message : "",
      );
      if (fallbackUrl) {
        return NextResponse.json({ ok: true, url: fallbackUrl, leadPending: true });
      }
    }
    return NextResponse.json({ ok: false, error: "Не удалось открыть мессенджер. Попробуйте ещё раз." }, { status: 503 });
  }
}
