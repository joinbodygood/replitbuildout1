import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false });

  const referral = await db.referral.findFirst({
    where: { referrerCode: code, status: "pending", referredEmail: null },
  });

  return NextResponse.json({
    valid: !!referral,
    code: referral?.referrerCode ?? null,
  });
}
