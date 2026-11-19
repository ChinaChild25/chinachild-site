import { NextResponse } from "next/server";
import {
  listWebsiteChatMessages,
  newWebsiteChatVisitorKey,
  validWebsiteChatVisitorKey,
  WEBSITE_CHAT_COOKIE,
} from "@/lib/website-chat/server";

export const runtime = "nodejs";

function visitorFromCookie(request: Request): string | null {
  const match = request.headers.get("cookie")?.match(/(?:^|;\s*)cc_website_chat_visitor=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return validWebsiteChatVisitorKey(value) ? value : null;
}

export async function POST(request: Request) {
  try {
    const visitorKey = visitorFromCookie(request) ?? newWebsiteChatVisitorKey();
    const history = await listWebsiteChatMessages(visitorKey);
    const response = NextResponse.json({ ok: true, ...history });
    response.cookies.set(WEBSITE_CHAT_COOKIE, visitorKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Чат временно недоступен" }, { status: 503 });
  }
}
