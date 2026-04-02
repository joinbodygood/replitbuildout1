"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartConflictGuard } from "@/hooks/useCartConflictGuard";
import { CartConflictModal } from "@/components/cart/CartConflictModal";
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Stethoscope,
  Pill,
  MapPin,
  Info,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { BGSProduct } from "@/lib/bgs-products";

interface Props {
  product: BGSProduct;
  locale: string;
  outcome: string;
  concern?: string;
  severity?: string;
  duration?: string;
  flagged?: boolean;
}

const CONCERN_TEXT: Record<string, string> = {
  anxiety: "anxiety and persistent worry",
  depression: "low mood and symptoms of depression",
  sleep: "sleep disruption and difficulty getting restful sleep",
  adhd: "difficulty with focus, attention, and motivation",
  stress: "chronic stress and emotional exhaustion",
  other: "the mental health symptoms you described",
};

const SEVERITY_TEXT: Record<string, string> = {
  mild: "that's been noticeable but manageable",
  moderate: "that's been getting in the way of your daily life",
  significant: "that's been significantly impacting your day-to-day",
  severe: "that's been affecting multiple areas of your life",
};

const DURATION_TEXT: Record<string, string> = {
  recent: "over the past few weeks",
  "months-1-6": "for a few months now",
  "months-6-12": "for about 6 months to a year",
  "year-plus": "for over a year",
};

function buildSummary(
  concern?: string,
  severity?: string,
  duration?: string
): string {
  const c = CONCERN_TEXT[concern ?? ""] || "the symptoms you shared";
  const s = SEVERITY_TEXT[severity ?? ""] || "that has been affecting your wellbeing";
  const d = DURATION_TEXT[duration ?? ""] || "";
  return `Based on your answers, you're experiencing ${c} ${s}${d ? `, ${d}` : ""}. This is a common and very treatable condition — our board-certified physicians help patients like you every day.`;
}

const STEPS = [
  {
    icon: FileText,
    title: "Complete a short intake form",
    body: "Tell us a bit more about your health history. Takes about 3 minutes.",
  },
  {
    icon: Stethoscope,
    title: "Physician reviews your info",
    body: "A board-certified doctor reviews your intake and writes a personalized prescription. This is the $25 one-time fee.",
  },
  {
    icon: MapPin,
    title: "Prescription sent to your pharmacy",
    body: "Your e-prescription is sent electronically to the pharmacy of your choice — same-day in most cases.",
  },
  {
    icon: Pill,
    title: "Pick up your medication",
    body: "Use your health insurance at the pharmacy for the lowest out-of-pocket cost. Most plans cover mental health medications.",
  },
];

export function MentalWellnessResultPage({
  product,
  locale,
  outcome,
  concern,
  severity,
  duration,
  flagged,
}: Props) {
  const router = useRouter();
  const { conflict, dismissConflict, guardedReplaceFlow } = useCartConflictGuard();
  const [loading, setLoading] = useState(false);

  const fee = product.pharmacyFee ?? 25;
  const summary = buildSummary(concern, severity, duration);

  function handleGetStarted() {
    setLoading(true);
    const ok = guardedReplaceFlow(
      "mental-health",
      [{
        productId: product.sku,
        variantId: `${product.sku}-pharmacy`,
        name: `${product.name} — Doctor Consultation`,
        variantLabel: "Doctor Review + E-Prescription",
        price: fee * 100,
        slug: product.slug ?? product.sku.toLowerCase(),
      }],
      () => router.push(`/${locale}/checkout`),
    );
    if (!ok) setLoading(false);
  }

  return (
    <>
    <section className="bg-white min-h-[80vh] py-12">
      <Container narrow>
        <div className="max-w-xl mx-auto">

          {/* ── HEADER BADGE ── */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1B8A4A] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <CheckCircle2 size={12} />
              Based on Your Quiz Results
            </div>
          </div>

          {/* ── PRODUCT NAME & DESCRIPTION ── */}
          <div className="text-center mb-8">
            <h1
              className="text-[#0C0D0F] text-3xl md:text-4xl font-bold mb-2 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {product.name}
            </h1>
            {product.bestFor && (
              <p className="text-[#55575A] text-sm flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-red" />
                Best for:{" "}
                <span className="text-brand-red font-medium">
                  {product.bestFor}
                </span>
              </p>
            )}
          </div>

          {/* ── PERSONALIZED SUMMARY ── */}
          <div className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl p-5 mb-6">
            <p className="text-[#0C0D0F] text-[14px] leading-relaxed">
              {summary}
            </p>
          </div>

          {/* ── FLAGGED NOTE ── */}
          {flagged && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-[13px] leading-relaxed">
                <strong>Note from our care team:</strong> Based on your answers, the physician will review your specific situation and may adjust or refine this recommendation as needed to ensure it&apos;s the safest and most effective option for you.
              </p>
            </div>
          )}

          {/* ── PRICING CALLOUT ── */}
          <div className="border-2 border-brand-red/20 rounded-2xl overflow-hidden mb-6">
            {/* Price header */}
            <div className="bg-brand-red/5 px-6 pt-6 pb-4 text-center border-b border-brand-red/10">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-[#55575A] text-lg font-medium">$</span>
                <span
                  className="text-[#0C0D0F] text-6xl font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {fee}
                </span>
              </div>
              <p
                className="text-[#0C0D0F] font-semibold text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Doctor Review + E-Prescription
              </p>
              <p className="text-[#55575A] text-[13px] mt-1">One-time fee</p>
            </div>

            {/* What's included */}
            <div className="px-6 pt-5 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-[#55575A] font-semibold mb-3">
                What&apos;s included
              </p>
              <ul className="space-y-2.5">
                {[
                  "Physician review of your intake form",
                  "Personalized treatment recommendation",
                  "Electronic prescription sent to your pharmacy",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-[#1B8A4A] flex-shrink-0 mt-0.5"
                    />
                    <span className="text-[#0C0D0F] text-[13px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's NOT included */}
            <div className="px-6 pb-5">
              <div className="bg-[#FFFBEA] border border-[#FDE68A] rounded-xl p-4">
                <div className="flex items-start gap-2.5 mb-2">
                  <Info
                    size={15}
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-amber-900 font-semibold text-[13px]">
                    Medication cost is NOT included
                  </p>
                </div>
                <p className="text-amber-800 text-[12px] leading-relaxed pl-[23px]">
                  You fill your prescription at your local pharmacy and pay for
                  the medication there. Most insurance plans cover mental health
                  medications, so your out-of-pocket cost is often low or $0.
                </p>
              </div>
            </div>
          </div>

          {/* ── WHAT TO EXPECT ── */}
          <div className="mb-8">
            <h2
              className="text-[#0C0D0F] font-bold text-base mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              What to expect
            </h2>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-5 py-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center">
                    <step.icon size={15} className="text-brand-red" />
                  </div>
                  <div>
                    <p
                      className="text-[#0C0D0F] font-semibold text-[13px] mb-0.5"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Step {i + 1}: {step.title}
                    </p>
                    <p className="text-[#55575A] text-[12px] leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="mb-5">
            <Button
              onClick={handleGetStarted}
              disabled={loading}
              size="lg"
              variant="primary"
              className="w-full rounded-full text-base font-semibold"
            >
              {loading ? "Setting up your order…" : `Get Started — $${fee}`}
            </Button>
          </div>

          {/* ── TRUST BADGES ── */}
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {[
              { icon: ShieldCheck, label: "HIPAA Compliant" },
              { icon: Stethoscope, label: "Board-Certified MDs" },
              { icon: Lock, label: "Your answers are confidential" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-[#55575A] text-[11px]"
              >
                <Icon size={13} className="text-[#1B8A4A]" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ── ONGOING MANAGEMENT NOTE ── */}
          {product.ongoingFee && (
            <p className="text-center text-[#55575A] text-[12px] mt-5 leading-relaxed">
              After your initial prescription, optional ongoing management is
              available for ${product.ongoingFee}/mo — includes follow-up
              physician review and prescription renewals.
            </p>
          )}
        </div>
      </Container>
    </section>

    {conflict && (
      <CartConflictModal
        existingProgram={conflict.existingProgram}
        onKeep={dismissConflict}
        onReplace={conflict.onReplace}
      />
    )}
  </>
  );
}
