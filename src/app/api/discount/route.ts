import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" });
  }

  const discount = await db.discountCode.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
    },
  });

  if (!discount) {
    return NextResponse.json({ valid: false, error: "Invalid code" });
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Code expired" });
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return NextResponse.json({ valid: false, error: "Code fully redeemed" });
  }

  return NextResponse.json({
    valid: true,
    type: discount.type,
    value: discount.value,
    minOrderValue: discount.minOrderValue,
    code: discount.code,
  });
}
