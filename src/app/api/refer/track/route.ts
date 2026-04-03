import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ ok: false });

  try {
    await db.referralMember.update({
      where: { referralCode: code, status: "enabled" },
      data: { totalClicks: { increment: 1 } },
    });
  } catch {
    // code may be from old Referral model — that's fine
  }

  return NextResponse.json({ ok: true });
}
