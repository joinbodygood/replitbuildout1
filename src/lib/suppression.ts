/**
 * Suppression and frequency-cap rules.
 *
 * Implements Section 10 of COMMS-INFRASTRUCTURE-BUILD-SPEC.md.
 *
 * Rules:
 *   - Tier 1 (transactional)  always sends, never suppressed
 *   - Tier 2 (operational)    sends unless Tier 1 already sent today
 *   - Tier 3 (commercial)     sends unless Tier 1 or 2 already sent today
 *   - Tier 4 (marketing)      sends only if no other email sent today
 *   - New patients (first 14 days): block ALL Tier 4
 *   - Hard caps: 1 marketing email/day, 2 emails/day total, 1 SMS/day
 *
 * The Replit codebase calls `shouldSend(userId, event)` BEFORE calling
 * `dittofeed.track(...)`. If it returns `{ allow: false }`, the event is
 * dropped and the journey never fires.
 */

import { getUserMessages } from "./dittofeed";

export type Tier = 1 | 2 | 3 | 4;

/**
 * Map every Section-4 event to a tier. Anything not listed defaults to
 * tier 4 (most restrictive) so a new event can't accidentally bypass caps.
 */
const EVENT_TIERS: Record<string, Tier> = {
  // Tier 1 — transactional, always sends
  checkout_completed: 1,
  payment_processed: 1,
  payment_failed: 1,
  order_shipped: 1,
  order_delivered: 1,
  rx_pharmacy_pickup_ready: 1,
  rx_pended: 1,
  rx_submitted: 1,
  rx_fill_confirmed: 1,
  pa_status_changed: 1,
  account_created: 1,
  subscription_paused: 1,
  subscription_cancelled: 1,

  // Tier 2 — operational
  intake_submitted: 2,
  refill_reminder: 2,
  refill_checkin_completed: 2,
  consultation_complete: 2,
  consultation_escalated: 2,
  dose_change_approved: 2,
  subscription_cancel_initiated: 2,
  eligibility_check_started: 2,
  eligibility_result_ready: 2,
  pa_submitted: 2,
  pa_renewal_filed: 2,
  commitment_expiring: 2,
  carly_clinical_alert: 2,

  // Tier 3 — commercial / engagement
  checkout_started: 3,
  checkout_abandoned: 3,
  quiz_abandoned: 3,
  support_ticket_resolved: 3,
  carly_checkin_completed: 3,
  carly_flag_hair_concern: 3,
  carly_flag_energy: 3,
  carly_flag_mood: 3,
  kelly_lead_converted: 3,
  kelly_sequence_exhausted: 3,

  // Tier 4 — marketing
  quiz_started: 4,
  quiz_completed: 4,
  product_page_viewed: 4,
  product_back_in_stock: 4,
  patient_birthday: 4,
  milestone_month_1: 4,
  milestone_month_2: 4,
  milestone_month_3: 4,
  milestone_month_6: 4,
  milestone_month_12: 4,
  manychat_lead_captured: 4,
  opensend_visitor_identified: 4,
};

export function tierFor(event: string): Tier {
  return EVENT_TIERS[event] ?? 4;
}

export type SendDecision =
  | { allow: true }
  | { allow: false; reason: string };

export type SendContext = {
  /** Days since this user's first order. Undefined for leads/anonymous. */
  patientAgeInDays?: number;
  /** True if user has unsubscribed from marketing. */
  marketingOptOut?: boolean;
  /** True if user has an active support ticket. */
  hasActiveTicket?: boolean;
};

/**
 * Decide whether a comms event should be allowed to fire.
 *
 * Looks at:
 *   1. Hard rules (opt-out, new-patient suppression, support hold)
 *   2. The user's send history in Dittofeed for the last 24 hours
 *
 * Returns `{ allow: false, reason }` if the event should be dropped.
 */
export async function shouldSend(
  userId: string,
  event: string,
  ctx: SendContext = {}
): Promise<SendDecision> {
  const tier = tierFor(event);

  // Tier 1 always sends — no checks
  if (tier === 1) return { allow: true };

  // Hard rules
  if (ctx.marketingOptOut && tier >= 3) {
    return { allow: false, reason: "user opted out of marketing" };
  }

  if (
    ctx.patientAgeInDays !== undefined &&
    ctx.patientAgeInDays < 14 &&
    tier === 4
  ) {
    return {
      allow: false,
      reason: "new patient (first 14 days) — Tier 4 blocked",
    };
  }

  if (ctx.hasActiveTicket && tier >= 3) {
    return { allow: false, reason: "user has open support ticket" };
  }

  // Frequency caps — query last 24h of sends
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const recent = await getUserMessages(userId, since);

  const sentTiers = recent
    .filter((m) => m.channel === "Email")
    .map((m) => tierFor(m.event));
  const sentSmsToday = recent.filter((m) => m.channel === "Sms").length;

  // Hard cap: 1 SMS / day (excluding Carly + Claudia, which bypass this layer)
  if (event.startsWith("sms_") && sentSmsToday >= 1) {
    return { allow: false, reason: "SMS daily cap reached" };
  }

  // Hard cap: 2 emails total / day
  if (sentTiers.length >= 2) {
    return { allow: false, reason: "daily email cap (2) reached" };
  }

  const sentTier1Or2Today = sentTiers.some((t) => t <= 2);
  const sentAnyToday = sentTiers.length > 0;

  // Tier 2: blocked if Tier 1 already sent today
  if (tier === 2 && sentTiers.includes(1)) {
    return { allow: false, reason: "Tier 1 already sent today" };
  }

  // Tier 3: blocked if Tier 1 or 2 already sent today
  if (tier === 3 && sentTier1Or2Today) {
    return { allow: false, reason: "Tier 1 or 2 already sent today" };
  }

  // Tier 4: blocked if anything sent today, or if marketing already sent today
  if (tier === 4 && sentAnyToday) {
    return { allow: false, reason: "another email already sent today" };
  }

  return { allow: true };
}
