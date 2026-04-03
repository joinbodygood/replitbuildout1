import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { subject, body } = await req.json();

  const members = await db.referralMember.findMany({
    where: { status: "enabled" },
    select: { id: true, email: true, firstName: true, referralCode: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bodygoodstudio.com";
  let sent = 0;

  for (const member of members) {
    const referralLink = `${baseUrl}/en/refer/${member.referralCode}`;
    const personalizedBody = (body as string)
      .replace(/\[First Name\]/gi, member.firstName)
      .replace(/\[new-link\]/gi, referralLink)
      .replace(/\[new link\]/gi, referralLink);

    try {
      await fireWebhook("referral.notification", {
        email: member.email,
        firstName: member.firstName,
        referralCode: member.referralCode,
        referralLink,
        subject,
        body: personalizedBody,
      });
      sent++;
    } catch {
      // continue on individual failure
    }
  }

  await db.referralMember.updateMany({
    where: { status: "enabled" },
    data: { notifiedAt: new Date() },
  });

  return NextResponse.json({ sent, total: members.length });
}
