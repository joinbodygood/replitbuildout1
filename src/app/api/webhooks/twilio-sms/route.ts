import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio SMS webhook for inbound messages and delivery status.
 *
 * Configure in Twilio Console:
 *   Phone Numbers → +1 912-416-9203 → Messaging → Webhook URL:
 *   https://my.joinbodygood.com/api/webhooks/twilio-sms
 *
 * Handles:
 *   - STOP/START/HELP (TCPA auto-handled by Twilio, but we log it)
 *   - Inbound patient replies (forward to support)
 *   - Delivery status callbacks (?type=status)
 *
 * Twilio sends form-encoded by default. We parse both form and JSON.
 */

async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return req.json();
  }
  // Twilio sends application/x-www-form-urlencoded
  const text = await req.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    // Delivery status callback
    if (type === "status") {
      const status = body.MessageStatus || body.SmsStatus;
      if (status === "failed" || status === "undelivered") {
        console.error(
          `[twilio] SMS delivery failed: ${body.To} — ${body.ErrorCode}: ${body.ErrorMessage}`
        );
      }
      // Return empty TwiML
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Inbound SMS
    const from = body.From;
    const smsBody = (body.Body || "").trim().toUpperCase();

    // TCPA keywords — Twilio handles STOP/START/HELP automatically
    // at the messaging service level, but we log for our records
    if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(smsBody)) {
      console.log(`[twilio] Opt-out received from ${from}: ${smsBody}`);
      // Twilio auto-handles. No response needed.
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    if (["START", "YES", "UNSTOP"].includes(smsBody)) {
      console.log(`[twilio] Opt-in received from ${from}: ${smsBody}`);
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    if (smsBody === "HELP") {
      console.log(`[twilio] HELP request from ${from}`);
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Body Good: For support, email hello@joinbodygood.com or call (305) 422-9921. Reply STOP to opt out.</Message></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // All other inbound messages — log and forward to support
    console.log(`[twilio] Inbound SMS from ${from}: ${body.Body}`);
    // TODO: Forward to Chatwoot/Claudia via n8n webhook or direct API

    // Return empty TwiML (no auto-reply for unknown messages)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("Twilio SMS webhook error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" }, status: 500 }
    );
  }
}
