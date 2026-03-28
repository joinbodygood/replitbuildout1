import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Generate a referral code for a given email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Check if code already exists for this email
    const existing = await db.referral.findFirst({
      where: { referrerEmail: email, status: "pending", referredEmail: null },
    });

    if (existing) {
      return NextResponse.json({ code: existing.referrerCode });
    }

    // Generate unique code
    const code = email.split("@")[0].slice(0, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

    await db.referral.create({
      data: {
        referrerEmail: email,
        referrerCode: code,
      },
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Referral error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Check referral stats for an email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const referrals = await db.referral.findMany({
    where: { referrerEmail: email },
  });

  const code = referrals[0]?.referrerCode || null;
  const totalReferred = referrals.filter((r) => r.referredEmail).length;
  const totalEarned = referrals.filter((r) => r.referrerCredited).reduce((sum, r) => sum + r.creditAmount, 0);

  return NextResponse.json({ code, totalReferred, totalEarned });
}
