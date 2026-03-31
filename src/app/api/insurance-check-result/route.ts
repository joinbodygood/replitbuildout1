import { NextRequest, NextResponse } from "next/server";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      firstName,
      phone,
      score,
      carrier,
      state,
      bestMed,
      bestIndication,
      diagnoses,
      bmiRange,
      locale,
    } = body;

    const isFavorable = (score ?? 0) >= 65;
    const event = isFavorable ? "insurance.favorable" : "insurance.unfavorable";

    await fireWebhook(event, {
      email,
      firstName,
      phone: phone || null,
      score,
      carrier,
      state,
      bestMed,
      bestIndication,
      diagnoses,
      bmiRange,
      locale: locale || "en",
      nextStep: isFavorable ? "eligibility_check_upgrade" : "self_pay_redirect",
      // ── Email sequence metadata for n8n ──
      emailSequence: isFavorable ? "insurance_favorable_v1" : "insurance_unfavorable_v1",
      emailContext: isFavorable
        ? {
            subject: "Your coverage odds look promising — here's your next step",
            highlights: [
              "Your probability score is above our 65% threshold",
              "The $25 eligibility check verifies your actual benefits in real-time",
              "We identify the strongest covered pathway for your situation",
              "You'll know exactly what's covered, what needs prior auth, and your next steps",
            ],
            ctaUrl: `/${locale ?? "en"}/products/insurance-eligibility-check`,
            ctaLabel: "Confirm My Coverage — $25",
          }
        : {
            subject: "Insurance may not cover yours — but you still have great options",
            highlights: [
              "Compounded semaglutide and tirzepatide are clinically equivalent to brand-name GLP-1s",
              "Self-pay programs start from $169/mo — no insurance battles, no delays",
              "Board-certified physician review included with every program",
              "Thousands of patients have had real results without insurance coverage",
            ],
            ctaUrl: `/${locale ?? "en"}/quiz`,
            ctaLabel: "See Your Self-Pay Options →",
          },
    });

    return NextResponse.json({ success: true, isFavorable });
  } catch (error) {
    console.error("Insurance check result error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
