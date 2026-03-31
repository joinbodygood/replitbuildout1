const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

type WebhookEvent =
  | "quiz.completed"
  | "quiz.abandoned"
  | "order.created"
  | "order.payment_failed"
  | "insurance.checked"
  | "insurance.favorable"
  | "insurance.unfavorable"
  | "referral.created"
  | "review.submitted"
  | "lead.captured"
  | "intake.submitted"
  | "coverage_check.completed";

type WebhookPayload = {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
};

export async function fireWebhook(event: WebhookEvent, data: Record<string, unknown>) {
  if (!N8N_WEBHOOK_URL) return; // silently skip if not configured

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire and forget — don't break the app if webhook fails
    console.error(`Webhook failed for event: ${event}`);
  }
}
