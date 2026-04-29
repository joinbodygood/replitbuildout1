"use client";
import { useState, useEffect } from "react";
import IntakeForm from "./components/IntakeForm";
import ResultsView from "./components/ResultsView";
import type { IntakeAnswers } from "@/lib/insurance/routing";
import type { CoverageResult } from "@/lib/insurance/confidence-engine";

declare global { interface Window { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void; } }

function fireEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", name, params);
  if (window.fbq) window.fbq("track", name, params);
}

export default function InsuranceCheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState("en");
  const [result, setResult] = useState<CoverageResult | null>(null);
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string }>({});
  const [hasFiredStart, setHasFiredStart] = useState(false);

  useEffect(() => { params.then(p => setLocale(p.locale)); }, [params]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setUtm({
      source: sp.get("utm_source") ?? undefined,
      medium: sp.get("utm_medium") ?? undefined,
      campaign: sp.get("utm_campaign") ?? undefined,
    });
  }, []);

  useEffect(() => {
    if (hasFiredStart) return;
    const handler = () => {
      if (!hasFiredStart) {
        fireEvent("ProbabilityQuizStarted");
        setHasFiredStart(true);
      }
    };
    window.addEventListener("click", handler, { once: true });
    return () => window.removeEventListener("click", handler);
  }, [hasFiredStart]);

  async function handleSubmit(intake: IntakeAnswers) {
    setError(null);
    setFirstName(intake.contact.firstName);
    try {
      const res = await fetch("/api/insurance-check/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, locale }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Submission failed");
      }
      const j = await res.json() as { leadId: string; result: CoverageResult };
      setResult(j.result);
      fireEvent("ProbabilityQuizCompleted", { bucket: j.result.bucket });
      if (j.result.bucket === "high_probability" || j.result.bucket === "coverage_with_pa") {
        fireEvent("HighProbabilityLead", { bucket: j.result.bucket });
      } else {
        fireEvent("SelfPayLead", { bucket: j.result.bucket });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error) return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#ED1B1B] p-6 text-center">
        <p className="text-[#ED1B1B] font-semibold mb-3">Something went wrong</p>
        <p className="text-sm text-neutral-600 mb-4">{error}</p>
        <button onClick={() => { setError(null); setResult(null); }} className="text-sm bg-[#ED1B1B] text-white px-4 py-2 rounded-full">Try again</button>
      </div>
    </main>
  );

  if (result) return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <ResultsView result={result} firstName={firstName} />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-12">
      <IntakeForm onSubmit={handleSubmit} initialUtm={utm} />
    </main>
  );
}
