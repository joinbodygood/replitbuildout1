"use client";
import type { ResultLabel } from "@/lib/insurance/label-mapper";

const BUCKET_CONFIG: Record<ResultLabel, { headline: string; sub: string; bg: string; border: string; text: string }> = {
  high_probability: {
    headline: "Strong coverage outlook on your plan.",
    sub: "Multiple signals suggest your plan covers GLP-1 medications. Fast-track confirmation available.",
    bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900",
  },
  coverage_with_pa: {
    headline: "Coverage is possible — we'll handle the prior authorization.",
    sub: "Your plan may cover these with a PA. We'll confirm within 1–3 business days for $25.",
    bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900",
  },
  unlikely: {
    headline: "Coverage looks unlikely with your plan.",
    sub: "Self-pay options are simpler and often more affordable. Compounded GLP-1s start at $169/mo.",
    bg: "bg-[#FDE7E7]", border: "border-[#ED1B1B]", text: "text-neutral-900",
  },
  not_on_formulary: {
    headline: "Your plan doesn't cover GLP-1 medications for weight loss.",
    sub: "Self-pay is your fastest path. Compounded GLP-1s from $169/mo, Foundayo from $25/mo with Lilly's savings card.",
    bg: "bg-[#FDE7E7]", border: "border-[#ED1B1B]", text: "text-neutral-900",
  },
};

interface Props { bucket: ResultLabel; carrier: string; state: string; planName: string | null; }

export default function BucketBanner({ bucket, carrier, state, planName }: Props) {
  const c = BUCKET_CONFIG[bucket];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 mb-6`}>
      <h2 className={`text-xl font-semibold ${c.text} mb-1`}>{c.headline}</h2>
      <p className={`text-sm ${c.text} opacity-80`}>{c.sub}</p>
      <div className="mt-3 text-xs text-neutral-600">
        Based on <span className="font-semibold">{carrier}</span>{planName ? ` — ${planName}` : ""} in {state}
      </div>
    </div>
  );
}
