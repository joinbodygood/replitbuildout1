"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Syringe, Check, Truck } from "lucide-react";

// ─── Product scoring database ────────────────────────────────────────────────
const PRODUCTS = [
  { handle: "lipotropic-super-b", tags: ["energy", "metabolism", "b-vitamins", "fat-burning"], price: 129 },
  { handle: "nad-plus",           tags: ["longevity", "anti-aging", "energy", "cellular-health"], price: 199 },
  { handle: "sermorelin",         tags: ["peptide", "growth-hormone", "anti-aging", "recovery", "sleep"], price: 179 },
  { handle: "glutathione",        tags: ["detox", "skin", "antioxidant", "wellness"], price: 149 },
  { handle: "l-carnitine",        tags: ["fat-burning", "energy", "metabolism", "muscle"], price: 99 },
  { handle: "lipo-c",             tags: ["fat-burning", "weight-loss", "metabolism", "lipotropic"], price: 99 },
  { handle: "vitamin-b12",        tags: ["energy", "metabolism", "b12", "wellness"], price: 59 },
];

// ─── Quiz questions ───────────────────────────────────────────────────────────
const Q1_OPTIONS = [
  { id: "energy",   label: "More energy & less brain fog",    tags: ["energy", "metabolism"] },
  { id: "fat",      label: "Burn more fat & boost metabolism", tags: ["fat-burning", "metabolism"] },
  { id: "skin",     label: "Better skin & detox",              tags: ["detox", "skin", "antioxidant"] },
  { id: "aging",    label: "Anti-aging & longevity",           tags: ["longevity", "anti-aging", "cellular-health"] },
  { id: "recovery", label: "Better sleep & recovery",          tags: ["recovery", "sleep", "peptide"] },
  { id: "all",      label: "All of the above — I want the works", tags: ["all"] },
];

const Q2_OPTIONS = [
  { id: "yes",     label: "Yes — I'm on tirzepatide or semaglutide", boost: ["fat-burning", "energy", "detox"],    weight: 1.2 },
  { id: "no",      label: "No — I'm here just for wellness",          boost: ["longevity", "anti-aging", "energy"], weight: 1.2 },
  { id: "maybe",   label: "I'm thinking about starting one",          boost: [],                                     weight: 1.0 },
];

const Q3_OPTIONS = [
  { id: "very",    label: "Very active — I work out 4+ times/week", boost: ["l-carnitine", "sermorelin"] },
  { id: "moderate",label: "Moderately active — 2–3 times/week",     boost: ["lipotropic-super-b", "l-carnitine"] },
  { id: "light",   label: "Light activity — walks, stretching",      boost: ["vitamin-b12", "lipotropic-super-b"] },
  { id: "low",     label: "Not very active right now",               boost: ["vitamin-b12", "glutathione"] },
];

const Q4_OPTIONS = [
  { id: "tired",    label: "I'm exhausted all the time",               boost: ["vitamin-b12", "lipotropic-super-b", "nad-plus"] },
  { id: "aging",    label: "I feel like I'm aging faster than I should", boost: ["nad-plus", "sermorelin", "glutathione"] },
  { id: "skin",     label: "My skin looks dull or tired",              boost: ["glutathione"] },
  { id: "muscle",   label: "I'm losing muscle along with the fat",     boost: ["sermorelin", "l-carnitine"] },
  { id: "blah",     label: "I just feel 'blah' — no motivation",       boost: ["lipotropic-super-b", "vitamin-b12", "nad-plus"] },
  { id: "optimize", label: "I want to optimize everything",            boost: ["nad-plus", "sermorelin", "glutathione"] },
];

const Q5_OPTIONS = [
  { id: "budget", label: "Under $75/mo — keep it simple",         filter: ["vitamin-b12"] },
  { id: "mid",    label: "$75–$150/mo — mid-range",               filter: ["lipo-c", "l-carnitine", "lipotropic-super-b"] },
  { id: "premium",label: "$150–$200/mo — I want the good stuff",  filter: ["glutathione", "sermorelin", "nad-plus"] },
  { id: "all",    label: "I'll invest whatever it takes for results", filter: ["all"] },
];

// ─── Scoring engine ───────────────────────────────────────────────────────────
function scoreProducts(q1: string, q2: string, q3: string, q4: string[], q5: string) {
  const scores: Record<string, number> = {};
  PRODUCTS.forEach((p) => (scores[p.handle] = 0));

  // Q1: +3 for matching goal tags
  const goalOption = Q1_OPTIONS.find((o) => o.id === q1);
  if (goalOption) {
    const isAll = goalOption.tags.includes("all");
    PRODUCTS.forEach((p) => {
      if (isAll || p.tags.some((t) => goalOption.tags.includes(t))) {
        scores[p.handle] += 3;
      }
    });
  }

  // Q2: multiply relevant tags by weight factor
  const programOption = Q2_OPTIONS.find((o) => o.id === q2);
  if (programOption && programOption.weight !== 1.0) {
    PRODUCTS.forEach((p) => {
      if (p.tags.some((t) => programOption.boost.includes(t))) {
        scores[p.handle] = Math.round(scores[p.handle] * programOption.weight);
      }
    });
  }

  // Q3: +2 for boosted handles
  const exerciseOption = Q3_OPTIONS.find((o) => o.id === q3);
  if (exerciseOption) {
    exerciseOption.boost.forEach((handle) => {
      if (scores[handle] !== undefined) scores[handle] += 2;
    });
  }

  // Q4: +2 per matching concern (max 2 selected)
  const selectedConcerns = q4.slice(0, 2);
  selectedConcerns.forEach((cid) => {
    const opt = Q4_OPTIONS.find((o) => o.id === cid);
    if (opt) {
      opt.boost.forEach((handle) => {
        if (scores[handle] !== undefined) scores[handle] += 2;
      });
    }
  });

  // Q5: filter by budget (zero out out-of-budget products unless "all")
  const budgetOption = Q5_OPTIONS.find((o) => o.id === q5);
  if (budgetOption && !budgetOption.filter.includes("all")) {
    PRODUCTS.forEach((p) => {
      if (!budgetOption.filter.includes(p.handle)) {
        scores[p.handle] = 0;
      }
    });
  }

  return PRODUCTS
    .map((p) => ({ handle: p.handle, score: scores[p.handle] }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── Step wrapper (module-level to prevent re-mount) ─────────────────────────
function StepWrapper({
  step, total, progress, title, subtitle, children,
}: {
  step: number; total: number; progress: number;
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fdf6f0] flex flex-col">
      <div className="w-full h-1.5 bg-gray-100">
        <div
          className="h-full bg-[#ed1b1b] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <p className="text-xs font-semibold text-[#ed1b1b] uppercase tracking-widest mb-4">
            Question {step} of {total}
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 text-sm mb-8">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Single-select option ─────────────────────────────────────────────────────
function SingleOption({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all mb-3 flex items-center gap-3 ${
        selected
          ? "border-[#ed1b1b] bg-[#fde7e7] text-gray-900 font-semibold"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#ed1b1b]/50"
      }`}
    >
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#ed1b1b] bg-[#ed1b1b]" : "border-gray-300"
      }`}>
        {selected && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

// ─── Multi-select option ──────────────────────────────────────────────────────
function MultiOption({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all mb-3 flex items-center gap-3 ${
        selected
          ? "border-[#ed1b1b] bg-[#fde7e7] text-gray-900 font-semibold"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#ed1b1b]/50"
      }`}
    >
      <span className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#ed1b1b] bg-[#ed1b1b]" : "border-gray-300"
      }`}>
        {selected && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

// ─── Main quiz component ──────────────────────────────────────────────────────
export default function WellnessQuizPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [step, setStep] = useState(1);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState<string[]>([]);
  const [q5, setQ5] = useState("");

  const totalSteps = 5;
  const progressPct = (step / totalSteps) * 100;

  function toggleQ4(id: string) {
    setQ4((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function handleSubmit() {
    const results = scoreProducts(q1, q2, q3, q4, q5);
    const topHandles = results.slice(0, 3).map((r) => r.handle).join(",");
    router.push(`/${locale}/wellness-injections?rec=${topHandles}&from=quiz`);
  }

  function canAdvance() {
    if (step === 1) return !!q1;
    if (step === 2) return !!q2;
    if (step === 3) return !!q3;
    if (step === 4) return q4.length > 0;
    if (step === 5) return !!q5;
    return false;
  }

  // ── Step 1: Primary Goal ──
  if (step === 1) {
    return (
      <StepWrapper step={1} total={totalSteps} progress={progressPct}
        title="What's your #1 goal right now?"
        subtitle="We'll personalize your injection recommendations based on your answer."
      >
        {Q1_OPTIONS.map((opt) => (
          <SingleOption key={opt.id} selected={q1 === opt.id} onClick={() => setQ1(opt.id)}>
            {opt.label}
          </SingleOption>
        ))}
        <button
          onClick={() => setStep(2)}
          disabled={!canAdvance()}
          className="mt-4 w-full py-4 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: "#ed1b1b" }}
        >
          Continue <ChevronRight size={18} />
        </button>
      </StepWrapper>
    );
  }

  // ── Step 2: GLP-1 Program ──
  if (step === 2) {
    return (
      <StepWrapper step={2} total={totalSteps} progress={progressPct}
        title="Are you currently on a GLP-1 weight loss program?"
      >
        {Q2_OPTIONS.map((opt) => (
          <SingleOption key={opt.id} selected={q2 === opt.id} onClick={() => setQ2(opt.id)}>
            {opt.label}
          </SingleOption>
        ))}
        <div className="mt-4 flex gap-3">
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors px-4 py-3 rounded-full border border-gray-200 bg-white">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={!canAdvance()}
            className="flex-1 py-4 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </StepWrapper>
    );
  }

  // ── Step 3: Exercise Level ──
  if (step === 3) {
    return (
      <StepWrapper step={3} total={totalSteps} progress={progressPct}
        title="How active are you right now?"
      >
        {Q3_OPTIONS.map((opt) => (
          <SingleOption key={opt.id} selected={q3 === opt.id} onClick={() => setQ3(opt.id)}>
            {opt.label}
          </SingleOption>
        ))}
        <div className="mt-4 flex gap-3">
          <button onClick={() => setStep(2)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors px-4 py-3 rounded-full border border-gray-200 bg-white">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(4)}
            disabled={!canAdvance()}
            className="flex-1 py-4 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </StepWrapper>
    );
  }

  // ── Step 4: Top Concern (multi-select, max 2) ──
  if (step === 4) {
    return (
      <StepWrapper step={4} total={totalSteps} progress={progressPct}
        title="What bothers you the most lately?"
        subtitle="Select up to 2."
      >
        {Q4_OPTIONS.map((opt) => (
          <MultiOption key={opt.id} selected={q4.includes(opt.id)} onClick={() => toggleQ4(opt.id)}>
            {opt.label}
          </MultiOption>
        ))}
        {q4.length >= 2 && (
          <p className="text-xs text-gray-400 mb-3 text-center">Maximum 2 selected — deselect one to change.</p>
        )}
        <div className="mt-4 flex gap-3">
          <button onClick={() => setStep(3)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors px-4 py-3 rounded-full border border-gray-200 bg-white">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(5)}
            disabled={!canAdvance()}
            className="flex-1 py-4 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </StepWrapper>
    );
  }

  // ── Step 5: Budget ──
  if (step === 5) {
    return (
      <StepWrapper step={5} total={totalSteps} progress={progressPct}
        title="What monthly investment feels comfortable for a wellness add-on?"
      >
        {Q5_OPTIONS.map((opt) => (
          <SingleOption key={opt.id} selected={q5 === opt.id} onClick={() => setQ5(opt.id)}>
            {opt.label}
          </SingleOption>
        ))}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Truck size={13} /> All injections include supplies and ship to your door.
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep(4)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors px-4 py-3 rounded-full border border-gray-200 bg-white">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canAdvance()}
            className="flex-1 py-4 rounded-full font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            See My Recommendations <ChevronRight size={20} />
          </button>
        </div>
      </StepWrapper>
    );
  }

  // ── Intro screen (before step 1 / fallback) ──
  return (
    <div className="min-h-screen bg-[#fdf6f0] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-14 h-14 rounded-2xl bg-[#fde7e7] flex items-center justify-center mb-6">
        <Syringe size={28} className="text-[#ed1b1b]" />
      </div>
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">
        Which wellness injection is right for you?
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-2">
        Answer 5 quick questions. We&apos;ll recommend the perfect add-on for your goals.
      </p>
      <p className="text-xs text-gray-400 text-center mb-8 flex items-center gap-2">
        <Truck size={13} /> All injections ship directly to your door with supplies included.
      </p>
      <button
        onClick={() => setStep(1)}
        className="px-10 py-4 rounded-full font-bold text-white text-lg flex items-center gap-2 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#ed1b1b" }}
      >
        Find Your Injection <ChevronRight size={20} />
      </button>
    </div>
  );
}
