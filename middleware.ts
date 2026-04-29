import { NextRequest, NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // Insurance Check v2 A/B placeholder.
  // The legacy /insurance-check-v1 snapshot was not preserved (Task 33 purged legacy code).
  // To enable an A/B test in the future, restore a v1 snapshot then uncomment the variant logic below.
  //
  // const url = req.nextUrl.clone();
  // if (!url.pathname.match(/\/[a-z]{2}\/insurance-check\b/)) return NextResponse.next();
  // const variant = req.cookies.get("ic_variant")?.value;
  // if (variant === "a" || variant === "b") return NextResponse.next();
  // const choice = Math.random() < 0.5 ? "a" : "b";
  // const res = NextResponse.next();
  // if (choice === "b") {
  //   url.pathname = url.pathname.replace("/insurance-check", "/insurance-check-v1");
  //   return NextResponse.redirect(url);
  // }
  // res.cookies.set("ic_variant", choice, { maxAge: 60 * 60 * 24 * 14, path: "/" });
  // return res;

  return NextResponse.next();
}

export const config = { matcher: "/:locale/insurance-check/:path*" };
