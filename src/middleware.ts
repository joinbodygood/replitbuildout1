import createMiddleware from "next-intl/middleware";
import { defineRouting } from "next-intl/routing";
import { NextRequest, NextResponse } from "next/server";

const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
});

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip i18n middleware for admin routes
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/", "/(en|es)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
