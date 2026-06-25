import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Canonical-host guard: проиндексированный production-алиас
  // chinachild-site.vercel.app отдаёт дубли контента. 308 на канонический
  // домен убирает дубль из индекса. Точное совпадение хоста — НЕ трогаем
  // preview-деплои (chinachild-site-<hash>.vercel.app), их нужно открывать.
  if (request.headers.get("host") === "chinachild-site.vercel.app") {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.host = "chinachild.ru";
    url.port = "";
    return NextResponse.redirect(url.toString(), 308);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(redirectUrl.toString(), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
