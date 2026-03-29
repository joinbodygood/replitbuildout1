import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await db.quizLead.create({
      data: {
        email: body.email || "",
        firstName: body.firstName || null,
        phone: body.phone || null,
        state: body.state || null,
        weightGoal: body.weightGoal || null,
        story: body.story || null,
        needleComfort: body.needleComfort || null,
        insuranceInterest: body.insuranceInterest || null,
        insuranceType: body.insuranceType || null,
        priority: body.priority || null,
        timeline: body.timeline || null,
        quizOutcome: body.quizOutcome || null,
        utmSource: body.utmSource || null,
        utmMedium: body.utmMedium || null,
        utmCampaign: body.utmCampaign || null,
        locale: body.locale || "en",
        completedAt: new Date(),
      },
    });

    await fireWebhook("lead.captured", {
      email: body.email,
      firstName: body.firstName,
      phone: body.phone,
      quizOutcome: body.quizOutcome,
      timeline: body.timeline,
      locale: body.locale,
      utmSource: body.utmSource,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz lead error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
