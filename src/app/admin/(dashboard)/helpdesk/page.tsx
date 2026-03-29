import { ExternalLink, Headphones, CheckCircle2, MessageSquare, Users, Inbox, ArrowUpRight } from "lucide-react";

const CHATWOOT_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? "";
const isConfigured = Boolean(CHATWOOT_URL);

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
        <div className="space-y-6 max-w-3xl">

          {/* Status card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
              <span className="font-semibold text-[#0C0D0F] text-sm">Chatwoot is connected — support.joinbodygood.com</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, label: "Live Chat",     desc: "Chat widget active on your website" },
                { icon: Inbox,        label: "Unified Inbox",  desc: "All conversations in one place"     },
                { icon: Users,        label: "Team Inbox",     desc: "Assign & collaborate on tickets"    },
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
                { label: "All conversations",  path: "/app/accounts/1/conversations"            },
                { label: "Inbox settings",     path: "/app/accounts/1/settings/inboxes/list"    },
                { label: "Team members",       path: "/app/accounts/1/settings/agents/new"      },
                { label: "Auto-assign & bots", path: "/app/accounts/1/settings/automation/list" },
                { label: "Reports",            path: "/app/accounts/1/reports/overview"          },
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

          {/* Automations status */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
            <p className="font-bold text-[#0C0D0F] text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Active automations
            </p>
            <ul className="space-y-3">
              {[
                { label: "Quiz lead capture",   desc: "Creates a contact + sends welcome message when a patient completes any quiz" },
                { label: "Purchase welcome",    desc: "Creates a contact + sends personalised welcome when an order is placed"      },
              ].map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_5px_#22c55e]" />
                  <div>
                    <p className="text-sm font-semibold text-[#0C0D0F]">{label}</p>
                    <p className="text-xs text-[#55575A] mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-[#FDE7E7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Headphones size={24} className="text-[#ED1B1B]" />
          </div>
          <h2 className="font-bold text-[#0C0D0F] text-lg mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            Chatwoot not configured
          </h2>
          <p className="text-sm text-[#55575A]">Set NEXT_PUBLIC_CHATWOOT_BASE_URL to connect your instance.</p>
        </div>
      )}
    </div>
  );
}
