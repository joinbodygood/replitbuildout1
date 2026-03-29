import { ExternalLink, Headphones, CheckCircle2, MessageSquare, Users, Inbox, ArrowUpRight } from "lucide-react";

const CHATWOOT_URL   = process.env.NEXT_PUBLIC_CHATWOOT_URL  ?? "";
const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_TOKEN ?? "";
const isConfigured   = Boolean(CHATWOOT_URL && CHATWOOT_TOKEN);

export default function HelpdeskPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FDE7E7] rounded-lg flex items-center justify-center">
            <Headphones size={18} className="text-[#ED1B1B]" />
          </div>
          <div>
            <h1 className="font-bold text-[#0C0D0F] text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
              Helpdesk
            </h1>
            <p className="text-sm text-[#55575A]">
              {isConfigured ? "Powered by Chatwoot — chat, email & messaging in one inbox" : "Setup required"}
            </p>
          </div>
        </div>

        {isConfigured && (
          <a
            href={CHATWOOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ED1B1B] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            Open Chatwoot Dashboard
            <ArrowUpRight size={15} />
          </a>
        )}
      </div>

      {isConfigured ? (
        /* ── Connected state ── */
        <div className="space-y-6 max-w-3xl">

          {/* Status card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
              <span className="font-semibold text-[#0C0D0F] text-sm">Chatwoot is connected</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, label: "Live Chat",    desc: "Chat widget active on your website" },
                { icon: Inbox,        label: "Unified Inbox", desc: "All conversations in one place"     },
                { icon: Users,        label: "Team Inbox",   desc: "Assign & collaborate on tickets"    },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E5E5E5]">
                  <Icon size={18} className="text-[#ED1B1B] mb-2" />
                  <p className="font-semibold text-[#0C0D0F] text-sm">{label}</p>
                  <p className="text-xs text-[#55575A] mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open dashboard prompt */}
          <div className="bg-gradient-to-br from-[#fde7e7] to-pink-50 border border-red-100 rounded-2xl p-6">
            <p className="font-bold text-[#0C0D0F] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
              Manage conversations in Chatwoot
            </p>
            <p className="text-sm text-[#55575A] mb-4">
              View open chats, respond to patients, assign conversations to your team, and set up auto-replies — all inside Chatwoot. It opens in a new tab.
            </p>
            <a
              href={CHATWOOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ED1B1B] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Open Chatwoot Dashboard
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
            <p className="font-bold text-[#0C0D0F] text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Quick links
            </p>
            <div className="space-y-2">
              {[
                { label: "All conversations",  path: "/app/accounts/1/conversations"         },
                { label: "Inbox settings",     path: "/app/accounts/1/settings/inboxes/list" },
                { label: "Team members",       path: "/app/accounts/1/settings/agents/new"   },
                { label: "Auto-assign & bots", path: "/app/accounts/1/settings/automation/list" },
                { label: "Reports",            path: "/app/accounts/1/reports/overview"       },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href={`${CHATWOOT_URL}${path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-[#F9F9F9] transition-colors group border border-transparent hover:border-[#E5E5E5]"
                >
                  <span className="text-sm text-[#0C0D0F] font-medium">{label}</span>
                  <ExternalLink size={13} className="text-[#55575A] group-hover:text-[#ED1B1B] transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Setup guide ── */
        <div className="max-w-xl">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8">
            <h2 className="font-bold text-[#0C0D0F] text-lg mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
              Connect Chatwoot in 3 steps
            </h2>
            <p className="text-sm text-[#55575A] mb-8">
              Chatwoot is free, open-source, and takes about 5 minutes to set up.
            </p>

            <ol className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Create your free Chatwoot account",
                  detail: "Go to app.chatwoot.com and sign up. No credit card required.",
                  link: { href: "https://app.chatwoot.com", label: "Go to app.chatwoot.com →" },
                },
                {
                  step: "2",
                  title: "Create a Website inbox",
                  detail: 'Inside Chatwoot: Settings → Inboxes → Add Inbox → choose "Website". Enter your domain and click Create.',
                },
                {
                  step: "3",
                  title: "Copy your credentials and add them here",
                  detail: "From the script snippet Chatwoot shows, grab the websiteToken. Then add both env vars and redeploy.",
                  code: [
                    "NEXT_PUBLIC_CHATWOOT_URL=https://app.chatwoot.com",
                    "NEXT_PUBLIC_CHATWOOT_TOKEN=your_token_here",
                  ],
                },
              ].map(({ step, title, detail, link, code }: { step: string; title: string; detail: string; link?: { href: string; label: string }; code?: string[] }) => (
                <li key={step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#55575A]">{step}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0C0D0F] text-sm mb-1">{title}</p>
                    <p className="text-sm text-[#55575A] leading-relaxed">{detail}</p>
                    {link && (
                      <a href={link.href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-[#ED1B1B] hover:underline"
                      >
                        {link.label}
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {code && (
                      <div className="mt-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-3 font-mono text-xs text-[#0C0D0F] space-y-1">
                        {code.map((line) => <div key={line}>{line}</div>)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="border-t border-[#E5E5E5] mt-7 pt-6">
              <p className="text-xs font-bold text-[#55575A] uppercase tracking-wider mb-4">What you get once connected</p>
              <ul className="grid grid-cols-2 gap-2">
                {["Live chat widget on site","Unified patient inbox","Email & chat together","Auto-reply & bots","Conversation history","Team collaboration"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#55575A]">
                    <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
