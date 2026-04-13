import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";
import { upsertContact, openConversation } from "@/lib/chatwoot";
import { dittofeed } from "@/lib/dittofeed";

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

    // ── Chatwoot: create/update contact and open a welcome conversation ──────
    // Fire-and-forget — don't block the API response
    void (async () => {
      const firstName = body.firstName as string | null;
      const locale    = (body.locale as string) || "en";

      const contactId = await upsertContact({
        email:  body.email,
        name:   firstName || undefined,
        phone:  body.phone || undefined,
        attributes: {
          quiz_outcome:       body.quizOutcome || "",
          preferred_language: locale,
          source:             "quiz",
        },
      });

      if (contactId) {
        const name = firstName || "there";
        const isEs = locale === "es";
        const msg = isEs
          ? `¡Hola ${name}! Gracias por completar el cuestionario en Body Good Studio. Tus resultados están listos. ¿Tienes alguna pregunta sobre tu programa recomendado? Estamos aquí para ayudarte.`
          : `Hi ${name}! Thanks for completing the quiz at Body Good Studio. Your results are ready — let us know if you have any questions about your recommended program. We're here to help!`;

        await openConversation({
          contactId,
          message: msg,
          label: "quiz-lead",
        });
      }
    })();

    // Dittofeed: identify the lead and track quiz completion
    const userId = body.email || "";
    if (userId) {
      dittofeed.identify({
        userId,
        traits: {
          email: body.email,
          firstName: body.firstName || undefined,
          phone: body.phone || undefined,
          leadSource: "quiz",
          programInterest: body.quizOutcome || undefined,
        },
      });
      dittofeed.track({
        userId,
        event: "quiz_completed",
        properties: {
          email: body.email,
          quiz_result: body.quizOutcome,
          locale: body.locale,
          utm_source: body.utmSource,
          utm_medium: body.utmMedium,
          utm_campaign: body.utmCampaign,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz lead error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
