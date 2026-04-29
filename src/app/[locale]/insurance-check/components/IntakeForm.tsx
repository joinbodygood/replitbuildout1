"use client";
import { useState, useEffect } from "react";
import QuestionStep from "./QuestionStep";
import ContactCaptureGate from "./ContactCaptureGate";
import type { IntakeAnswers, ContactInfo, InsuranceOrigin } from "@/lib/insurance/routing";

const ORIGINS: Array<{ key: InsuranceOrigin; label: string }> = [
  { key: "aca", label: "ACA Marketplace / Healthcare.gov / state exchange" },
  { key: "medicare", label: "Medicare (Part D)" },
  { key: "medicaid", label: "Medicaid" },
  { key: "employer", label: "Through my employer" },
  { key: "federal_military", label: "TRICARE / FEHB / VA" },
  { key: "none", label: "I don't have insurance / Self-pay" },
];

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const CARRIERS = [
  { key: "cigna", label: "Cigna / Evernorth" },
  { key: "bcbs_fl", label: "Florida Blue (BCBS FL)" },
  { key: "aetna", label: "Aetna" },
  { key: "uhc", label: "UnitedHealthcare" },
  { key: "humana", label: "Humana" },
  { key: "bcbs_fep", label: "BCBS Federal Employee Program" },
  { key: "tricare", label: "TRICARE" },
  { key: "va", label: "VA" },
  { key: "medicare", label: "Medicare" },
  { key: "medicaid_fl", label: "Florida Medicaid" },
  { key: "medicaid_ny", label: "New York Medicaid" },
  { key: "medicaid_ca", label: "California Medi-Cal" },
  { key: "medicaid_tx", label: "Texas Medicaid" },
  { key: "medicaid_il", label: "Illinois Medicaid" },
  { key: "other", label: "Other / not listed" },
];

const DIAGNOSES = [
  { key: "t2d", label: "Type 2 Diabetes" },
  { key: "cvd", label: "Cardiovascular disease (heart attack, stroke, PAD, CAD)" },
  { key: "osa", label: "Sleep apnea (with sleep study)" },
  { key: "htn", label: "High blood pressure" },
  { key: "dyslipidemia", label: "High cholesterol / dyslipidemia" },
  { key: "mash", label: "MASH / fatty liver disease" },
] as const;

interface Props {
  onSubmit: (intake: IntakeAnswers) => Promise<void>;
  initialUtm: { source?: string; medium?: string; campaign?: string };
}

export default function IntakeForm({ onSubmit, initialUtm }: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [origin, setOrigin] = useState<InsuranceOrigin | null>(null);
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [carrier, setCarrier] = useState("");
  const [planName, setPlanName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerSize, setEmployerSize] = useState<"lt_500"|"500_4999"|"5000_plus"|"unknown"|null>(null);
  const [diagnoses, setDiagnoses] = useState<Array<typeof DIAGNOSES[number]["key"]>>([]);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(6);
  const [weightLb, setWeightLb] = useState(180);

  const isEmployer = origin === "employer";
  const totalSteps = isEmployer ? 9 : 8;

  useEffect(() => {
    if (origin === "none") {
      window.location.href = "/self-pay";
    }
  }, [origin]);

  const [planSuggestions, setPlanSuggestions] = useState<Array<{ planId: string; planName: string }>>([]);
  useEffect(() => {
    if (origin !== "aca" || !carrier || !state || planName.length < 2) { setPlanSuggestions([]); return; }
    const ac = new AbortController();
    fetch(`/api/insurance-check/plans?carrier=${carrier}&state=${state}&q=${encodeURIComponent(planName)}`, { signal: ac.signal })
      .then(r => r.json())
      .then(j => setPlanSuggestions(j.plans ?? []))
      .catch(() => {});
    return () => ac.abort();
  }, [origin, carrier, state, planName]);

  const heightInchesTotal = heightFt * 12 + heightIn;

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(1, s - 1));

  async function handleContactSubmit(contact: ContactInfo) {
    setSubmitting(true);
    const intake: IntakeAnswers = {
      insuranceOrigin: origin!,
      carrier,
      state,
      zip,
      planName: planName.trim() || null,
      employerName: isEmployer ? (employerName.trim() || null) : null,
      employerSize: isEmployer ? employerSize : null,
      diagnoses,
      heightInches: heightInchesTotal,
      weightLb,
      contact,
      utm: initialUtm,
    };
    try {
      await onSubmit(intake);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 1) return (
    <QuestionStep step={1} total={totalSteps} title="How do you get your health insurance?"
      onNext={next} nextDisabled={!origin}>
      <div className="space-y-2">
        {ORIGINS.map(o => (
          <button key={o.key} type="button" onClick={() => setOrigin(o.key)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition ${origin === o.key ? "border-[#ED1B1B] bg-[#FDE7E7]" : "border-neutral-300 hover:border-neutral-500"}`}>
            <span className="text-sm">{o.label}</span>
          </button>
        ))}
      </div>
    </QuestionStep>
  );

  if (step === 2) return (
    <QuestionStep step={2} total={totalSteps} title="What state do you live in?" onBack={back} onNext={next} nextDisabled={!state}>
      <select value={state} onChange={e => setState(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:outline-none focus:border-[#ED1B1B]">
        <option value="">Select your state…</option>
        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </QuestionStep>
  );

  if (step === 3) return (
    <QuestionStep step={3} total={totalSteps} title="What's your ZIP code?" onBack={back} onNext={next} nextDisabled={!/^\d{5}$/.test(zip)}>
      <input type="text" inputMode="numeric" maxLength={5} value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, ""))}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:outline-none focus:border-[#ED1B1B]"
        placeholder="33101" />
    </QuestionStep>
  );

  if (step === 4) return (
    <QuestionStep step={4} total={totalSteps} title="Which insurance company?" onBack={back} onNext={next} nextDisabled={!carrier}>
      <select value={carrier} onChange={e => setCarrier(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:outline-none focus:border-[#ED1B1B]">
        <option value="">Select your carrier…</option>
        {CARRIERS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
    </QuestionStep>
  );

  if (step === 5) return (
    <QuestionStep step={5} total={totalSteps} title="What's your plan name?" hint="Optional. We can still check coverage without it." onBack={back} onNext={next}>
      <input type="text" value={planName} onChange={e => setPlanName(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:outline-none focus:border-[#ED1B1B]"
        placeholder="e.g. BlueOptions Silver 1234" />
      {planSuggestions.length > 0 && (
        <ul className="mt-2 border border-neutral-200 rounded-lg overflow-hidden">
          {planSuggestions.map(p => (
            <li key={p.planId}>
              <button type="button" onClick={() => setPlanName(p.planName)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">{p.planName}</button>
            </li>
          ))}
        </ul>
      )}
    </QuestionStep>
  );

  if (step === 6 && isEmployer) return (
    <QuestionStep step={6} total={totalSteps} title="Tell us about your employer" hint="Larger employers tend to have better GLP-1 coverage." onBack={back} onNext={next} nextDisabled={!employerSize}>
      <input type="text" value={employerName} onChange={e => setEmployerName(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:outline-none focus:border-[#ED1B1B] mb-3"
        placeholder="Employer name (optional)" />
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "lt_500", label: "Under 500 employees" },
          { key: "500_4999", label: "500–4,999" },
          { key: "5000_plus", label: "5,000+" },
          { key: "unknown", label: "I don't know" },
        ].map(o => (
          <button key={o.key} type="button" onClick={() => setEmployerSize(o.key as never)}
            className={`text-left px-3 py-3 rounded-xl border text-sm transition ${employerSize === o.key ? "border-[#ED1B1B] bg-[#FDE7E7]" : "border-neutral-300 hover:border-neutral-500"}`}>{o.label}</button>
        ))}
      </div>
    </QuestionStep>
  );

  const dxStep = isEmployer ? 7 : 6;
  if (step === dxStep) return (
    <QuestionStep step={dxStep} total={totalSteps} title="Which apply to you?" hint="Select any that have been diagnosed." onBack={back} onNext={next}>
      <div className="space-y-2">
        {DIAGNOSES.map(d => {
          const checked = diagnoses.includes(d.key);
          return (
            <button key={d.key} type="button"
              onClick={() => setDiagnoses(prev => checked ? prev.filter(x => x !== d.key) : [...prev, d.key])}
              className={`w-full text-left px-4 py-3 rounded-xl border transition ${checked ? "border-[#ED1B1B] bg-[#FDE7E7]" : "border-neutral-300 hover:border-neutral-500"}`}>
              <span className="text-sm">{d.label}</span>
            </button>
          );
        })}
      </div>
    </QuestionStep>
  );

  const bmiStep = isEmployer ? 8 : 7;
  if (step === bmiStep) return (
    <QuestionStep step={bmiStep} total={totalSteps} title="Your height and weight" hint="Used for BMI-based PA criteria." onBack={back} onNext={next} nextDisabled={heightInchesTotal === 0 || weightLb < 50}>
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Feet</span>
          <select value={heightFt} onChange={e => setHeightFt(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
            {[4,5,6,7].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Inches</span>
          <select value={heightIn} onChange={e => setHeightIn(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
            {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Weight (lb)</span>
          <input type="number" min={50} max={700} value={weightLb} onChange={e => setWeightLb(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
        </label>
      </div>
    </QuestionStep>
  );

  return <ContactCaptureGate onSubmit={handleContactSubmit} loading={submitting} />;
}
