import createMiddleware from "next-intl/middleware";
import { defineRouting } from "next-intl/routing";

const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
});

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|es)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
