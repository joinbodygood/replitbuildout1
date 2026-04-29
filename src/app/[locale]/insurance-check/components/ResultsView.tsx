"use client";
import BucketBanner from "./BucketBanner";
import MedicationCard from "./MedicationCard";
import type { CoverageResult } from "@/lib/insurance/confidence-engine";

interface Props { result: CoverageResult; firstName: string; }

export default function ResultsView({ result, firstName }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-normal text-neutral-900">Your insurance probability check, {firstName}.</h1>
      </header>

      <BucketBanner
        bucket={result.bucket}
        carrier={result.insurance.carrier}
        state={result.insurance.state}
        planName={result.insurance.planName}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {result.medications.map((med, i) => {
          const isLastOdd = i === result.medications.length - 1 && result.medications.length % 2 === 1;
          return (
            <div key={med.medication} className={isLastOdd ? "md:col-span-2" : ""}>
              <MedicationCard med={med} isFoundayo={med.medication === "foundayo"} />
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-900 rounded-2xl p-6 text-center mb-6">
        <p className="text-[#ED1B1B] text-xs font-semibold tracking-wider uppercase mb-1">Not sure which option fits?</p>
        <h3 className="text-white text-lg font-semibold mb-2">Talk to Dr. Linda's team — free 5-min review</h3>
        <p className="text-neutral-400 text-sm mb-4">We'll personally walk you through your best path forward.</p>
        <a href="https://calendly.com/bodygood/intro" target="_blank" rel="noopener"
          className="inline-flex items-center bg-[#ED1B1B] hover:bg-[#D01818] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">
          Get a free 5-min review →
        </a>
      </div>

      <p className="text-[10px] text-neutral-500 leading-relaxed">
        This is a probability estimate, not a coverage guarantee. Actual coverage depends on your plan year,
        employer customizations, your clinical record, and prior authorization outcome. The $25 eligibility check
        verifies your specific plan with your insurance company in 1–3 business days. The $25 fee is non-refundable
        regardless of result. Body Good never guarantees insurance coverage.
      </p>
    </div>
  );
}
