"use client";
import { useState } from "react";
import type { ContactInfo } from "@/lib/insurance/routing";

interface Props {
  onSubmit: (contact: ContactInfo) => void;
  loading: boolean;
}

export default function ContactCaptureGate({ onSubmit, loading }: Props) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  function handle() {
    if (!firstName.trim()) { setErr("First name required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Valid email required"); return; }
    if (phone && !/^[\d\s().+\-]{7,}$/.test(phone)) { setErr("Phone format invalid"); return; }
    setErr(null);
    onSubmit({ firstName: firstName.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || null, smsConsent, emailConsent });
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-2xl font-normal text-neutral-900 mb-1">Almost done.</h2>
      <p className="text-sm text-neutral-600 mb-5">Enter your name and email to see your results.</p>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">First name</span>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:border-[#ED1B1B]" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:border-[#ED1B1B]" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Phone <span className="text-neutral-400 font-normal">(optional)</span></span>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:border-[#ED1B1B]" />
        </label>
        <label className="flex gap-2 items-start text-xs text-neutral-700">
          <input type="checkbox" checked={emailConsent} onChange={e => setEmailConsent(e.target.checked)} className="mt-0.5" />
          <span>Email me my results and follow-up content from Body Good. Unsubscribe anytime.</span>
        </label>
        <label className="flex gap-2 items-start text-xs text-neutral-700">
          <input type="checkbox" checked={smsConsent} onChange={e => setSmsConsent(e.target.checked)} className="mt-0.5" />
          <span>Text me appointment reminders and updates. Msg & data rates apply. STOP to opt out.</span>
        </label>
      </div>
      {err && <p className="text-xs text-[#ED1B1B] mt-3">{err}</p>}
      <button type="button" onClick={handle} disabled={loading}
        className="mt-5 w-full bg-[#ED1B1B] hover:bg-[#D01818] disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-full transition">
        {loading ? "Checking…" : "Show my results →"}
      </button>
    </div>
  );
}
