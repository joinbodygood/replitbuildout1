import { ExternalLink, Headphones, CheckCircle2, Circle, ArrowRight } from "lucide-react";

const CHATWOOT_URL  = process.env.NEXT_PUBLIC_CHATWOOT_URL  ?? "";
const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_TOKEN ?? "";
const isConfigured  = Boolean(CHATWOOT_URL && CHATWOOT_TOKEN);

export default function HelpdeskPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FDE7E7] rounded-lg flex items-center justify-center">
            <Headphones size={18} className="text-[#ED1B1B]" />
          </div>
          <div>
            <h1 className="font-bold text-[#0C0D0F] text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
              Helpdesk
            </h1>
            <p className="text-sm text-[#55575A]">
              {isConfigured ? "Chatwoot — live chat & inbox" : "Chatwoot setup required"}
            </p>
          </div>
        </div>

        {isConfigured && (
          <a
            href={CHATWOOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ED1B1B] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ExternalLink size={15} />
            Open Chatwoot
          </a>
        )}
      </div>

      {isConfigured ? (
        /* ── Embedded Chatwoot dashboard ── */
        <div className="flex-1 rounded-xl border border-[#E5E5E5] overflow-hidden bg-white shadow-sm">
          <iframe
            src={CHATWOOT_URL}
            className="w-full h-full"
            style={{ minHeight: "calc(100vh - 160px)" }}
            allow="microphone; camera"
            title="Chatwoot Helpdesk"
          />
        </div>
      ) : (
        /* ── Setup guide ── */
        <div className="flex-1 flex items-start justify-center pt-8">
          <div className="max-w-xl w-full">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8">
              <h2 className="font-bold text-[#0C0D0F] text-lg mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                Connect Chatwoot in 3 steps
              </h2>
              <p className="text-sm text-[#55575A] mb-8">
                Chatwoot is free, open-source, and takes about 5 minutes to set up.
              </p>

              {/* Steps */}
              <ol className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Create your free Chatwoot account",
                    detail: "Go to app.chatwoot.com and sign up. No credit card required.",
                    link: { href: "https://app.chatwoot.com", label: "Go to app.chatwoot.com →" },
                    done: false,
                  },
                  {
                    step: "2",
                    title: "Create a Website inbox",
                    detail: "Inside Chatwoot: Settings → Inboxes → Add Inbox → choose \"Website\". Enter your domain (bodygoodstudio.com) and click Create.",
                    done: false,
                  },
                  {
                    step: "3",
                    title: "Copy your credentials and add them here",
                    detail: "From the script snippet Chatwoot shows you, grab the websiteToken value. Then add both env vars below and redeploy.",
                    code: [
                      "NEXT_PUBLIC_CHATWOOT_URL=https://app.chatwoot.com",
                      "NEXT_PUBLIC_CHATWOOT_TOKEN=your_token_here",
                    ],
                    done: false,
                  },
                ].map(({ step, title, detail, link, code }) => (
                  <li key={step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#55575A]">{step}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0C0D0F] text-sm mb-1">{title}</p>
                      <p className="text-sm text-[#55575A] leading-relaxed">{detail}</p>
                      {link && (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-[#ED1B1B] hover:underline"
                        >
                          {link.label}
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {code && (
                        <div className="mt-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-3 font-mono text-xs text-[#0C0D0F] space-y-1">
                          {code.map((line) => (
                            <div key={line}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {/* Divider */}
              <div className="border-t border-[#E5E5E5] my-7" />

              {/* What you get */}
              <p className="text-xs font-bold text-[#55575A] uppercase tracking-wider mb-4">
                What you get once connected
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  "Live chat widget on your site",
                  "Inbox for all patient messages",
                  "Email & chat in one place",
                  "Auto-reply & bot support",
                  "Conversation history",
                  "Team collaboration",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#55575A]">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Already have credentials banner */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <ArrowRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Already have your token?</span> Add{" "}
                <code className="bg-blue-100 px-1 rounded text-xs">NEXT_PUBLIC_CHATWOOT_URL</code> and{" "}
                <code className="bg-blue-100 px-1 rounded text-xs">NEXT_PUBLIC_CHATWOOT_TOKEN</code>{" "}
                to your environment secrets, then restart the app — this page will automatically show the live dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
