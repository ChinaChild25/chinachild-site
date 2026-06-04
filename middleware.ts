import { NextRequest, NextResponse } from "next/server";

const memberMobileAlternates = new Map([
  ["/members", "https://my.chinachild.ru"],
  ["/members/", "https://my.chinachild.ru"],
  ["/members/login", "https://my.chinachild.ru"],
  ["/members/login/", "https://my.chinachild.ru"],
  ["/members/signup", "https://my.chinachild.ru"],
  ["/members/signup/", "https://my.chinachild.ru"],
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const mobileUrl = memberMobileAlternates.get(pathname);

  if (mobileUrl) {
    const redirectUrl = new URL(mobileUrl);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, {
      status: 308,
      headers: {
        Link: `<${mobileUrl}>; rel="alternate"; media="only screen and (max-width: 640px)"`,
      },
    });
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
