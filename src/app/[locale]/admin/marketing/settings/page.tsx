import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { dittofeed, listJourneys } from "@/lib/dittofeed";

type Props = { params: Promise<{ locale: string }> };

async function checkPostmark(): Promise<{ ok: boolean; detail: string }> {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) return { ok: false, detail: "POSTMARK_SERVER_TOKEN not set" };
  try {
    const res = await fetch("https://api.postmarkapp.com/server", {
      headers: {
        Accept: "application/json",
        "X-Postmark-Server-Token": token,
      },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, detail: `Server: ${data.Name} (ID: ${data.ID})` };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

async function checkDittofeed(): Promise<{ ok: boolean; detail: string }> {
  if (!dittofeed.enabled) return { ok: false, detail: "Env vars not set" };
  try {
    const journeys = await listJourneys();
    return { ok: true, detail: `${journeys.length} journeys loaded` };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

export default async function MarketingSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [postmarkStatus, dittofeedStatus] = await Promise.all([
    checkPostmark(),
    checkDittofeed(),
  ]);

  const twilioConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );

  const providers = [
    {
      label: "Dittofeed",
      ok: dittofeedStatus.ok,
      detail: dittofeedStatus.detail,
      url: "https://dittofeed.bgs.dev/dashboard",
    },
    {
      label: "Postmark",
      ok: postmarkStatus.ok,
      detail: postmarkStatus.detail,
      url: "https://account.postmarkapp.com/servers",
    },
    {
      label: "Twilio",
      ok: twilioConfigured,
      detail: twilioConfigured
        ? `SID: ${process.env.TWILIO_ACCOUNT_SID?.slice(0, 8)}...`
        : "TWILIO_ACCOUNT_SID not set",
      url: "https://console.twilio.com",
    },
  ];

  const envVars = [
    { key: "DITTOFEED_API_BASE", set: Boolean(process.env.DITTOFEED_API_BASE) },
    { key: "DITTOFEED_WRITE_KEY", set: Boolean(process.env.DITTOFEED_WRITE_KEY) },
    { key: "DITTOFEED_WORKSPACE_ID", set: Boolean(process.env.DITTOFEED_WORKSPACE_ID) },
    { key: "POSTMARK_SERVER_TOKEN", set: Boolean(process.env.POSTMARK_SERVER_TOKEN) },
    { key: "TWILIO_ACCOUNT_SID", set: Boolean(process.env.TWILIO_ACCOUNT_SID) },
    { key: "TWILIO_AUTH_TOKEN", set: Boolean(process.env.TWILIO_AUTH_TOKEN) },
    { key: "TWILIO_MESSAGING_SERVICE_SID", set: Boolean(process.env.TWILIO_MESSAGING_SERVICE_SID) },
  ];

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Marketing settings
        </h1>
        <p className="text-body-muted mb-8">
          Provider connections, environment variables, and suppression rules.
        </p>

        {/* Provider health */}
        <h2 className="font-heading text-heading text-xl font-bold mb-4">
          Provider connections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {providers.map((p) => (
            <Card key={p.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-heading font-bold">{p.label}</p>
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    p.ok ? "bg-green-500" : "bg-red-400"
                  }`}
                />
              </div>
              <p
                className={`text-sm mb-3 ${
                  p.ok ? "text-green-700" : "text-body-muted"
                }`}
              >
                {p.ok ? "Connected" : "Not connected"}
              </p>
              <p className="text-xs text-body-muted mb-3">{p.detail}</p>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-red hover:underline"
              >
                Open dashboard →
              </a>
            </Card>
          ))}
        </div>

        {/* Environment variables */}
        <h2 className="font-heading text-heading text-xl font-bold mb-4">
          Environment variables
        </h2>
        <Card className="mb-10">
          <div className="space-y-2">
            {envVars.map((v) => (
              <div
                key={v.key}
                className="flex items-center justify-between py-1.5 border-b border-border-light last:border-0"
              >
                <code className="text-xs font-mono">{v.key}</code>
                <span
                  className={`text-xs font-medium ${
                    v.set ? "text-green-700" : "text-red-500"
                  }`}
                >
                  {v.set ? "Set" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Suppression rules */}
        <h2 className="font-heading text-heading text-xl font-bold mb-4">
          Suppression rules
        </h2>
        <Card className="mb-10">
          <ul className="text-sm text-body space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>Max <strong>1 marketing email/day</strong> per patient</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>Max <strong>2 total emails/day</strong> per patient (including transactional)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>Max <strong>1 SMS/day</strong> (excluding Carly coaching + Claudia support)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>New patients (first 14 days): <strong>Tier 4 marketing blocked</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>SMS quiet hours: <strong>8am – 9pm</strong> patient local time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>Active support ticket: <strong>Tier 3 + 4 suppressed</strong> until resolved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-body-muted mt-0.5">•</span>
              <span>Cross-sell cooldown: <strong>60 days</strong> between same-program offers</span>
            </li>
          </ul>
        </Card>

        {/* Webhook endpoints reference */}
        <h2 className="font-heading text-heading text-xl font-bold mb-4">
          Webhook endpoints
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-2 px-3 font-heading text-heading text-xs">Endpoint</th>
                  <th className="py-2 px-3 font-heading text-heading text-xs">Agent</th>
                  <th className="py-2 px-3 font-heading text-heading text-xs">Events</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {[
                  { path: "/api/webhooks/consultation", agent: "Dr. Linda Bot", events: "consultation_complete, escalated" },
                  { path: "/api/webhooks/pharmacy", agent: "Roxy", events: "rx_submitted, shipped, delivered, pickup" },
                  { path: "/api/webhooks/pa", agent: "PA Engine", events: "eligibility, pa_submitted, status, renewal" },
                  { path: "/api/webhooks/subscription", agent: "PayPal/n8n", events: "payment_processed, failed, paused, cancelled" },
                  { path: "/api/webhooks/refill", agent: "Daily cron", events: "refill_reminder, checkin_completed" },
                  { path: "/api/webhooks/carly", agent: "Carly", events: "checkin, flags, clinical_alert" },
                  { path: "/api/webhooks/support", agent: "Claudia/Kelly", events: "ticket_resolved, lead_converted, exhausted" },
                  { path: "/api/webhooks/manychat", agent: "ManyChat", events: "lead_captured" },
                  { path: "/api/webhooks/milestones", agent: "Daily cron", events: "month_1-12, birthday, back_in_stock" },
                  { path: "/api/webhooks/intake", agent: "Intake system", events: "intake_submitted" },
                  { path: "/api/webhooks/postmark", agent: "Postmark", events: "bounce, spam_complaint" },
                  { path: "/api/webhooks/twilio-sms", agent: "Twilio", events: "inbound SMS, delivery status" },
                ].map((row) => (
                  <tr key={row.path} className="border-b border-border-light hover:bg-surface-dim">
                    <td className="py-2 px-3 font-mono">{row.path}</td>
                    <td className="py-2 px-3">{row.agent}</td>
                    <td className="py-2 px-3 text-body-muted">{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </section>
  );
}
