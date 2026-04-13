import { NextRequest, NextResponse } from "next/server";

/**
 * Postmark webhook for bounces, spam complaints, and delivery events.
 *
 * Configure in Postmark UI: Server → Webhooks → Add webhook
 * URL: https://my.joinbodygood.com/api/webhooks/postmark
 * Events: Bounce, SpamComplaint, Delivery
 *
 * On bounce/complaint: log it, suppress address from future sends.
 * This protects sender reputation and Postmark deliverability score.
 */

type PostmarkBounce = {
  RecordType: "Bounce";
  Type: string; // HardBounce, SoftBounce, SpamNotification, etc.
  TypeCode: number;
  Email: string;
  BouncedAt: string;
  Description: string;
  MessageID: string;
  MessageStream: string;
};

type PostmarkSpamComplaint = {
  RecordType: "SpamComplaint";
  Email: string;
  MessageID: string;
  BouncedAt: string;
};

type PostmarkDelivery = {
  RecordType: "Delivery";
  Email: string;
  MessageID: string;
  DeliveredAt: string;
};

type PostmarkEvent = PostmarkBounce | PostmarkSpamComplaint | PostmarkDelivery;

export async function POST(req: NextRequest) {
  try {
    const body: PostmarkEvent = await req.json();

    switch (body.RecordType) {
      case "Bounce": {
        const bounce = body as PostmarkBounce;
        console.warn(
          `[postmark] Bounce: ${bounce.Type} for ${bounce.Email} — ${bounce.Description}`
        );
        // Hard bounces: suppress permanently
        if (bounce.TypeCode === 1) {
          // TODO: Mark email as permanently bounced in DB or Dittofeed
          // For now, log for manual review
          console.error(
            `[postmark] HARD BOUNCE — suppress ${bounce.Email} from all future sends`
          );
        }
        break;
      }

      case "SpamComplaint": {
        const spam = body as PostmarkSpamComplaint;
        console.error(
          `[postmark] SPAM COMPLAINT from ${spam.Email} — suppress immediately`
        );
        // TODO: Mark email as spam-complained in DB, suppress from ALL sends
        break;
      }

      case "Delivery": {
        // Successful delivery — no action needed, Dittofeed tracks this
        break;
      }

      default:
        console.log(`[postmark] Unknown event type: ${(body as any).RecordType}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Postmark webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
