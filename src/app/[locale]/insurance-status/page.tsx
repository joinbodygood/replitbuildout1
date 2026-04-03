"use client";

import { useState } from "react";

export default function InsuranceStatusPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{
    stage: string;
    stageFriendly: string;
    medications: { drug: string; status: string }[];
    nextStep: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError("");
    setStatus(null);

    try {
      const res = await fetch(`/api/pa/case-status/${token.trim()}`);
      if (!res.ok) {
        setError("Case not found. Please check your status token and try again.");
        return;
      }
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusColor: Record<string, string> = {
    drafted: "#6B7280",
    submitted: "#2563EB",
    pending_response: "#D97706",
    approved: "#16A34A",
    denied: "#DC2626",
  };

  return (
    <div className="min-h-screen bg-[#FDF6F6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-[#0C0D0F] mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Check Your Insurance Status
          </h1>
          <p className="text-sm text-[#55575A]">
            Enter the status token from your confirmation email to check your
            prior authorization progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your status token"
              className="flex-1 px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#ED1B1B]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#ED1B1B] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {loading ? "..." : "Check"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {status && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5]">
              <p className="text-sm font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Your Status
              </p>
              <p className="text-sm text-[#55575A] mt-1">{status.stageFriendly}</p>
            </div>

            {status.medications.length > 0 && (
              <div className="px-5 py-4 border-b border-[#E5E5E5]">
                <p className="text-xs font-bold text-[#55575A] uppercase tracking-wide mb-3">
                  Medications
                </p>
                <div className="space-y-2">
                  {status.medications.map((med, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-[#0C0D0F]">{med.drug}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: statusColor[med.status] ?? "#6B7280" }}
                      >
                        {med.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 py-4 bg-[#F9F9F9]">
              <p className="text-xs font-bold text-[#55575A] uppercase tracking-wide mb-1">
                Next Step
              </p>
              <p className="text-sm text-[#0C0D0F]">{status.nextStep}</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#55575A] mt-6">
          Questions? Contact us at{" "}
          <a href="mailto:support@joinbodygood.com" className="text-[#ED1B1B] underline">
            support@joinbodygood.com
          </a>
        </p>
      </div>
    </div>
  );
}
