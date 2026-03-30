"use client";

import { Suspense, useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Loader2,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const WELLNESS_GOALS = [
  "Energy & Fatigue","Metabolism Support","Immune Support","Anti-Aging",
  "Athletic Recovery","Skin Health / Detox","Weight Loss Support","Muscle Building",
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold font-heading text-heading mb-1">
      {children}{required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}

const inputBase = "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors";

function TextInput({ value, onChange, placeholder, type = "text", readOnly }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder} readOnly={readOnly}
      className={`${inputBase} ${readOnly ? "bg-surface-dim text-body-muted" : ""}`} />
  );
}

function SelectInput({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors appearance-none">
      {children}
    </select>
  );
}

function WarnAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 rounded-lg border border-orange-400 bg-orange-50 text-xs text-orange-800 leading-relaxed flex gap-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-500" /><span>{children}</span>
    </div>
  );
}

function StopAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 rounded-lg border border-red-500 bg-red-50 text-xs text-red-700 leading-relaxed flex gap-2">
      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{children}</span>
    </div>
  );
}

function YesNoToggle({ value, onChange, warnAlert, stopAlert, altOptions }: {
  value: string; onChange: (v: string) => void; warnAlert?: React.ReactNode; stopAlert?: React.ReactNode; altOptions?: [string, string];
}) {
  const [yes, no] = altOptions || ["Yes", "No"];
  return (
    <>
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={() => onChange("y")}
          className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${value === "y" ? "bg-red-50 border-red-600 text-red-600" : "bg-white border-border text-body hover:border-gray-400"}`}>{yes}</button>
        <button type="button" onClick={() => onChange("n")}
          className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${value === "n" ? "bg-green-50 border-green-700 text-green-700" : "bg-white border-border text-body hover:border-gray-400"}`}>{no}</button>
      </div>
      {stopAlert && value === "y" && <StopAlert>{stopAlert}</StopAlert>}
      {warnAlert && value === "y" && <WarnAlert>{warnAlert}</WarnAlert>}
    </>
  );
}

function MultiSelect({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onToggle(opt)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs text-left transition-all ${
            selected.includes(opt) ? "bg-brand-pink border-brand-red text-brand-red font-semibold" : "bg-white border-border text-heading hover:border-gray-400"
          }`}>
          <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 text-[9px] font-bold ${selected.includes(opt) ? "bg-brand-red border-brand-red text-white" : "border-border"}`}>
            {selected.includes(opt) ? "✓" : ""}
          </span>{opt}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["About You","Medical","Screening","Consent"];
  return (
    <div className="mb-7">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-brand-red rounded-full transition-all duration-500" style={{ width: `${((step-1)/3)*100}%` }} />
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => {
          const n = i+1; const done = n < step; const active = n === step;
          return (
            <span key={n} className={`text-[10px] font-semibold font-heading uppercase tracking-wide flex items-center gap-1 transition-colors ${done ? "text-success" : active ? "text-brand-red" : "text-body-muted"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${done ? "bg-success border-success text-white" : active ? "bg-brand-red border-brand-red text-white" : "bg-white border-border text-body-muted"}`}>
                {done ? "✓" : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "#FBF7F4" }}>
      <div className="text-center py-12 max-w-sm">
        <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-success" />
        </div>
        <h2 className="font-heading text-heading text-2xl font-bold mb-3">Intake Complete!</h2>
        <p className="text-body-muted text-sm leading-relaxed mb-8">
          Your wellness injection intake is submitted. Provider evaluation within 24–48 hours.
        </p>
        <a href="/programs" className="inline-flex items-center justify-center font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
          Return to Programs →
        </a>
      </div>
    </div>
  );
}

function WellnessForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [s1, setS1] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", sex: "", state: "",
    heightFt: "", heightIn: "", weight: "",
    streetAddress: "", city: "", shipState: "", zip: "",
  });

  const [s2, setS2] = useState({
    hasAllergies: "", allergiesDetail: "",
    hasMeds: "", medsDetail: "",
    goals: [] as string[],
  });

  const [s3, setS3] = useState({
    bVitaminAllergy: "",
    lebersDisease: "",
    kidneyDisease: "",
    cancerHistory: "",
    bloodClotting: "",
    pregnant: "",
    diabetes: "",
    selfInjection: "",
    otherConcerns: "",
  });

  const [s4, setS4] = useState({ c1: false, c2: false, c3: false, signature: "" });

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function u1(k: keyof typeof s1, v: string) { setS1((p) => ({ ...p, [k]: v })); }
  function u2(k: keyof typeof s2, v: string | string[]) { setS2((p) => ({ ...p, [k]: v })); }
  function u3(k: keyof typeof s3, v: string) { setS3((p) => ({ ...p, [k]: v })); }

  function toggleGoal(g: string) {
    setS2((prev) => {
      const arr = prev.goals;
      return { ...prev, goals: arr.includes(g) ? arr.filter((x) => x !== g) : [...arr, g] };
    });
  }

  function goTo(n: number) { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function handleSubmit() {
    if (!s4.c1 || !s4.c2 || !s4.c3) { setSubmitError("Please agree to all consent items."); return; }
    if (!s4.signature.trim()) { setSubmitError("Please enter your full legal name as your signature."); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "wellness",
          personal: s1,
          medicalHistory: s2,
          injectionScreening: s3,
          consent: { telehealth: s4.c1, accuracy: s4.c2, injectionRisks: s4.c3, signature: s4.signature, signedAt: new Date().toISOString() },
        }),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <SuccessScreen />;

  return (
    <div className="min-h-screen" style={{ background: "#FBF7F4" }}>
      <div className="text-center py-7 px-5 max-w-xl mx-auto">
        <div className="w-12 h-12 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <h1 className="font-heading text-heading text-2xl font-bold mb-1.5">
          Order confirmed. <span className="text-brand-red">One more step.</span>
        </h1>
        <p className="text-body-muted text-sm leading-relaxed">Complete your intake for your wellness injection protocol.</p>
      </div>

      <div className="flex items-center gap-3 max-w-xl mx-auto px-5 mb-5 bg-white border border-border rounded-card p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-heading">Wellness Injections</p>
          <p className="text-xs text-body-muted mt-0.5">Vitamin &amp; Peptide Injection Protocol · Shipped to You</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <ProgressBar step={step} />

        {step === 1 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Personal Information</h3>
              <p className="text-xs text-body-muted mb-4">Required for your provider evaluation.</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><FieldLabel required>First Name</FieldLabel><TextInput value={s1.firstName} onChange={(v) => u1("firstName", v)} placeholder="First name" /></div>
                <div><FieldLabel required>Last Name</FieldLabel><TextInput value={s1.lastName} onChange={(v) => u1("lastName", v)} placeholder="Last name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><FieldLabel required>Email</FieldLabel><TextInput type="email" value={s1.email} onChange={(v) => u1("email", v)} placeholder="you@email.com" /></div>
                <div><FieldLabel required>Phone</FieldLabel><TextInput type="tel" value={s1.phone} onChange={(v) => u1("phone", v)} placeholder="(555) 123-4567" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><FieldLabel required>Date of Birth</FieldLabel><TextInput type="date" value={s1.dob} onChange={(v) => u1("dob", v)} /></div>
                <div><FieldLabel required>Sex at Birth</FieldLabel><SelectInput value={s1.sex} onChange={(v) => u1("sex", v)}><option value="">Select</option><option>Female</option><option>Male</option></SelectInput></div>
                <div><FieldLabel required>State</FieldLabel><SelectInput value={s1.state} onChange={(v) => u1("state", v)}><option value="">Select</option>{US_STATES.map((s) => <option key={s}>{s}</option>)}</SelectInput></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><FieldLabel>Height (ft)</FieldLabel><SelectInput value={s1.heightFt} onChange={(v) => u1("heightFt", v)}><option value="">Feet</option>{[4,5,6,7].map((n) => <option key={n}>{n}</option>)}</SelectInput></div>
                <div><FieldLabel>Height (in)</FieldLabel><SelectInput value={s1.heightIn} onChange={(v) => u1("heightIn", v)}><option value="">In</option>{Array.from({length:12},(_,i)=>i).map((n)=><option key={n}>{n}</option>)}</SelectInput></div>
                <div><FieldLabel>Weight (lbs)</FieldLabel><TextInput type="number" value={s1.weight} onChange={(v) => u1("weight", v)} placeholder="lbs" /></div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Shipping Address</h3>
              <p className="text-xs text-body-muted mb-4">Where should we ship your injections?</p>
              <div className="mb-3"><FieldLabel required>Street Address</FieldLabel><TextInput value={s1.streetAddress} onChange={(v) => u1("streetAddress", v)} placeholder="123 Main St" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><FieldLabel required>City</FieldLabel><TextInput value={s1.city} onChange={(v) => u1("city", v)} placeholder="City" /></div>
                <div><FieldLabel required>State</FieldLabel><SelectInput value={s1.shipState} onChange={(v) => u1("shipState", v)}><option value="">Select</option>{US_STATES.map((s) => <option key={s}>{s}</option>)}</SelectInput></div>
                <div><FieldLabel required>ZIP</FieldLabel><TextInput value={s1.zip} onChange={(v) => u1("zip", v)} placeholder="ZIP" /></div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => goTo(2)} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Medical History</h3>
              <p className="text-xs text-body-muted mb-4">Quick medical background for injection safety.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Known <strong>drug or supplement allergies</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasAllergies} onChange={(v) => u2("hasAllergies", v)} />
                  {s2.hasAllergies === "y" && (
                    <textarea value={s2.allergiesDetail} onChange={(e) => u2("allergiesDetail", e.target.value)}
                      placeholder="List all allergies — especially B vitamins, cobalt, or benzyl alcohol..."
                      className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />
                  )}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Currently taking any <strong>medications or supplements</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasMeds} onChange={(v) => u2("hasMeds", v)} />
                  {s2.hasMeds === "y" && (
                    <textarea value={s2.medsDetail} onChange={(e) => u2("medsDetail", e.target.value)}
                      placeholder="List all..."
                      className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />
                  )}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">What are your <strong>primary wellness goals</strong>? <span className="text-brand-red">*</span></p>
                  <MultiSelect options={WELLNESS_GOALS} selected={s2.goals} onToggle={toggleGoal} />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => goTo(1)} className="font-heading font-bold text-sm border border-border text-body px-6 py-3 rounded-pill hover:border-gray-400 transition-colors">← Back</button>
              <button onClick={() => goTo(3)} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Wellness Injection Screening</h3>
              <p className="text-xs text-body-muted mb-4">Safety screening specific to injectable vitamins and peptides.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Known allergy to <strong>B vitamins, cobalt, or benzyl alcohol</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.bVitaminAllergy} onChange={(v) => u3("bVitaminAllergy", v)} stopAlert="B12 and lipotropic injections contain these compounds. Provider will evaluate safe alternatives." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium"><strong>Leber&apos;s disease</strong> (hereditary optic neuropathy)? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.lebersDisease} onChange={(v) => u3("lebersDisease", v)} stopAlert="B12 supplementation is contraindicated with Leber's disease." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium"><strong>Kidney disease</strong> or impaired kidney function? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.kidneyDisease} onChange={(v) => u3("kidneyDisease", v)} warnAlert="Some peptides (Sermorelin, NAD+) require dose adjustment with renal impairment." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium"><strong>Active cancer diagnosis</strong> or history of cancer? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.cancerHistory} onChange={(v) => u3("cancerHistory", v)} stopAlert="Growth hormone-stimulating peptides (Sermorelin) are contraindicated with active malignancy. Provider will select safe options." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium"><strong>Blood clotting disorder</strong> (polycythemia, DVT)? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.bloodClotting} onChange={(v) => u3("bloodClotting", v)} warnAlert="B12 injections can increase red blood cell production. Provider will monitor." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Currently <strong>pregnant or breastfeeding</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.pregnant} onChange={(v) => u3("pregnant", v)} warnAlert="B12 is safe during pregnancy; however, peptides like Sermorelin and NAD+ are not established as safe. Provider will limit to approved injections." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium"><strong>Diabetes</strong> or blood sugar issues? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.diabetes} onChange={(v) => u3("diabetes", v)} warnAlert="Sermorelin can affect blood glucose. Provider will factor in diabetes management." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Comfortable with <strong>self-administering injections</strong> at home? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.selfInjection} onChange={(v) => u3("selfInjection", v)} altOptions={["Yes, I can do it","I need guidance"]} />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-2">Anything else your provider should know?</p>
                  <textarea value={s3.otherConcerns} onChange={(e) => u3("otherConcerns", e.target.value)} placeholder="Optional..." className={`${inputBase} resize-y min-h-[60px]`} />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => goTo(2)} className="font-heading font-bold text-sm border border-border text-body px-6 py-3 rounded-pill hover:border-gray-400 transition-colors">← Back</button>
              <button onClick={() => goTo(4)} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-3">Informed Consent</h3>
              <div className="bg-gray-50 border border-border rounded-lg p-4 text-xs text-body leading-relaxed mb-4 max-h-40 overflow-y-auto">
                <strong>Telehealth Consent:</strong> I consent to telehealth evaluation by Body Good Studio.<br /><br />
                <strong>Injection Acknowledgment:</strong> I understand injectable vitamins and peptides carry risks including injection-site reactions, bruising, and rare allergic reactions. I will report any adverse effects immediately.<br /><br />
                <strong>Self-Administration:</strong> I understand I will receive instructions for self-injection and agree to follow them carefully.<br /><br />
                <strong>Accuracy &amp; HIPAA:</strong> All information is accurate. Privacy maintained per HIPAA.
              </div>
              <div className="space-y-3">
                {[
                  { key: "c1" as const, label: <>I agree to <strong>Telehealth Consent</strong> and <strong>HIPAA</strong>.</> },
                  { key: "c2" as const, label: <>I certify all information is <strong>accurate</strong>.</> },
                  { key: "c3" as const, label: <>I acknowledge <strong>injection risks</strong> and self-administration responsibilities.</> },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={s4[key]} onChange={(e) => setS4((p) => ({ ...p, [key]: e.target.checked }))} className="mt-1 accent-red-600 w-4 h-4 shrink-0" />
                    <span className="text-sm text-heading">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-3">Electronic Signature</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel required>Full Legal Name</FieldLabel><TextInput value={s4.signature} onChange={(v) => setS4((p) => ({ ...p, signature: v }))} placeholder="Full name" /></div>
                <div><FieldLabel>Date</FieldLabel><TextInput value={today} readOnly /></div>
              </div>
            </div>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-400 rounded-lg text-xs text-red-700 flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />{submitError}
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => goTo(3)} className="font-heading font-bold text-sm border border-border text-body px-6 py-3 rounded-pill hover:border-gray-400 transition-colors">← Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors disabled:opacity-60 flex items-center gap-2" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Intake →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WellnessIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F4" }}><Loader2 className="w-6 h-6 animate-spin text-brand-red" /></div>}>
      <WellnessForm />
    </Suspense>
  );
}
