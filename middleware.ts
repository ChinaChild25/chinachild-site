import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
