"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Info } from "lucide-react";

const DEFAULT_SUBJECT = "Your Body Good Referral Link Has Been Updated";
const DEFAULT_BODY = `Hi [First Name],

We've upgraded our referral program! Your new referral link is:

[new-link]

Share it with friends and earn rewards when they sign up. Your previous referral link is no longer active — please use this new one going forward.

Thank you for being part of the Body Good Studio community.

— The Body Good Studio Team`;

type SendResult = { sent: number; total: number };

export default function EmailsPage() {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  async function handleSend() {
    if (!confirmed) {
      setError("Please confirm before sending.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/referral-members/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      setConfirmed(false);
    } catch {
      setError("Failed to send notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-heading text-2xl font-bold flex items-center gap-2">
          <Mail size={22} />
          Email Templates
        </h1>
        <p className="text-body-muted text-sm mt-1">
          Manage email notifications for the referral program.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Mail size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-heading text-base">Referral Link Update Notification</h2>
            <p className="text-xs text-body-muted">Sent manually to all enabled referral members</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-card p-3 mb-5">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Use <code className="bg-blue-100 px-1 rounded">[First Name]</code> and <code className="bg-blue-100 px-1 rounded">[new-link]</code> as placeholders. They will be replaced with each member's actual name and new referral link.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Subject line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-card text-sm focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Email body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 border border-border rounded-card text-sm font-mono focus:outline-none focus:border-brand-red transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-card p-4 mb-5 flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <p className="text-emerald-800 text-sm">
            Notification triggered for <strong>{result.sent}</strong> of <strong>{result.total}</strong> enabled referral members.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-card p-4 mb-5 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-card p-4 mb-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-red"
          />
          <span className="text-sm text-amber-800">
            I confirm I want to send this email notification to all enabled referral members. This will fire a notification event for each member and mark their notified date.
          </span>
        </label>
      </div>

      <button
        onClick={handleSend}
        disabled={loading || !confirmed}
        className="flex items-center gap-2 bg-brand-red text-white font-heading font-bold px-8 py-3.5 rounded-pill hover:bg-brand-red-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
        {loading ? "Sending notifications…" : "Send New Link Notification"}
      </button>
    </div>
  );
}
