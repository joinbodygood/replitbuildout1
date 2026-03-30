"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Loader2,
  Building2,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold font-heading text-heading mb-1">
      {children}{required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}

const inputBase = "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors";

function TextInput({ value, onChange, placeholder, type = "text", readOnly, disabled }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean; disabled?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder} readOnly={readOnly} disabled={disabled}
      className={`${inputBase} ${(readOnly || disabled) ? "bg-surface-dim text-body-muted cursor-not-allowed" : ""}`} />
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

function YesNoToggle({ value, onChange, warnAlert, stopAlert }: {
  value: string; onChange: (v: string) => void; warnAlert?: React.ReactNode; stopAlert?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex gap-2 mt-2">
        {["y","n"].map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${
              value === v ? (v === "y" ? "bg-red-50 border-red-600 text-red-600" : "bg-green-50 border-green-700 text-green-700") : "bg-white border-border text-body hover:border-gray-400"
            }`}>{v === "y" ? "Yes" : "No"}</button>
        ))}
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

interface Pharmacy { name: string; address: string; npi: string; }

function PharmacySearch({ onSelect, selected, onClear }: {
  onSelect: (p: Pharmacy) => void; selected: Pharmacy | null; onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function search(q: string) {
    try {
      const isZip = /^\d{5}/.test(q);
      let url = "https://npiregistry.cms.hhs.gov/api/?version=2.1&enumeration_type=NPI-2&taxonomy_description=Pharmacy&limit=8";
      if (isZip) url += `&postal_code=${encodeURIComponent(q.substring(0, 5))}*`;
      else { url += `&organization_name=${encodeURIComponent(q)}*`; if (zip) url += `&postal_code=${encodeURIComponent(zip)}*`; }
      setLoading(true);
      const res = await fetch(url);
      const data = await res.json();
      setLoading(false);
      if (!data.results?.length) { setResults([]); setOpen(true); return; }
      setResults(data.results.map((r: Record<string, unknown>) => {
        const addr = (r.addresses as Record<string, string>[])?.[0] || {};
        const basic = r.basic as Record<string, string> | undefined;
        return { name: basic?.organization_name || "Unknown", address: [addr.address_1, addr.city, addr.state, addr.postal_code?.substring(0, 5)].filter(Boolean).join(", "), npi: (r.number as string) || "" };
      }));
      setOpen(true);
    } catch { setLoading(false); }
  }

  function handleInput(v: string) {
    setQuery(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.length < 3) { setOpen(false); return; }
    timerRef.current = setTimeout(() => search(v), 500);
  }

  if (selected) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-600 rounded-lg mt-2">
        <Building2 className="w-4 h-4 text-green-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-xs text-heading truncate">{selected.name}</p>
          <p className="text-[11px] text-body-muted truncate">{selected.address}{selected.npi ? ` · NPI: ${selected.npi}` : ""}</p>
        </div>
        <button type="button" onClick={onClear} className="text-brand-red text-xs font-semibold font-heading border border-brand-red px-2.5 py-1 rounded-full hover:bg-red-50 shrink-0">Change</button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative mt-2">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="col-span-2"><TextInput value={query} onChange={handleInput} placeholder="Search by pharmacy name or ZIP..." /></div>
        <TextInput value={zip} onChange={setZip} placeholder="ZIP (optional)" />
      </div>
      {loading && <p className="text-xs text-body-muted py-2 text-center">Searching pharmacies...</p>}
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-border rounded-b-lg shadow-lg max-h-52 overflow-y-auto">
          {results.length === 0 ? <p className="text-xs text-body-muted px-3 py-3">No pharmacies found.</p> : results.map((p, i) => (
            <button key={i} type="button" onClick={() => { onSelect(p); setOpen(false); setQuery(""); }}
              className="w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-red-50 transition-colors last:border-b-0">
              <p className="font-heading font-semibold text-xs text-heading">{p.name}</p>
              <p className="text-[11px] text-body-muted mt-0.5">{p.address}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["About You","Insurance","Clinical","Consent"];
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
          Your insurance navigation intake is submitted. Our team will begin your eligibility check within 24–48 hours. You&apos;ll receive an email with results.
        </p>
        <a href="/programs" className="inline-flex items-center justify-center font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
          Return to Programs →
        </a>
      </div>
    </div>
  );
}

function InsuranceForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);

  const [s1, setS1] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", sex: "", state: "",
    heightFt: "", heightIn: "", weight: "",
    streetAddress: "", city: "", shipState: "", zip: "",
  });

  const [s2, setS2] = useState({
    provider: "", planName: "", memberId: "", subscriberName: "",
    hasSecondary: "", employer: "",
  });

  const [s3, setS3] = useState({
    reasons: [] as string[],
    comorbidities: [] as string[],
    triedOther: "", triedOtherDetail: "",
    priorDenial: "", priorDenialDetail: "",
    hasPcp: "", pcpDetail: "",
    hasAllergies: "", allergiesDetail: "",
    hasMeds: "", medsDetail: "",
  });

  const [s4, setS4] = useState({ c1: false, c2: false, c3: false, signature: "" });

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function u1(k: keyof typeof s1, v: string) { setS1((p) => ({ ...p, [k]: v })); }
  function u2(k: keyof typeof s2, v: string) { setS2((p) => ({ ...p, [k]: v })); }
  function u3(k: keyof typeof s3, v: string | string[]) { setS3((p) => ({ ...p, [k]: v })); }

  function toggleArr(key: "reasons" | "comorbidities", val: string) {
    setS3((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  }

  const bmi = (() => {
    const ft = parseFloat(s1.heightFt) || 0;
    const inches = parseFloat(s1.heightIn) || 0;
    const lbs = parseFloat(s1.weight) || 0;
    const totalIn = ft * 12 + inches;
    if (!totalIn || !lbs) return null;
    return ((lbs / (totalIn * totalIn)) * 703).toFixed(1);
  })();

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
          formType: "insurance",
          pharmacy: pharmacy || null,
          personal: { ...s1, bmi },
          insurance: s2,
          clinical: s3,
          consent: { telehealth: s4.c1, communicateWithInsurer: s4.c2, approvalNotGuaranteed: s4.c3, signature: s4.signature, signedAt: new Date().toISOString() },
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
          Order confirmed. <span className="text-brand-red">Let&apos;s get started.</span>
        </h1>
        <p className="text-body-muted text-sm leading-relaxed">Complete your intake so we can begin fighting your insurance for GLP-1 coverage.</p>
      </div>

      <div className="flex items-center gap-3 max-w-xl mx-auto px-5 mb-5 bg-white border border-border rounded-card p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-heading">GLP-1 Insurance Navigation</p>
          <p className="text-xs text-body-muted mt-0.5">Insurance Eligibility &amp; Prior Authorization Services</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <ProgressBar step={step} />

        {step === 1 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Personal Information</h3>
              <p className="text-xs text-body-muted mb-4">Required for your insurance eligibility check.</p>
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
                <div><FieldLabel required>Height (ft)</FieldLabel><SelectInput value={s1.heightFt} onChange={(v) => u1("heightFt", v)}><option value="">Feet</option>{[4,5,6,7].map((n) => <option key={n}>{n}</option>)}</SelectInput></div>
                <div><FieldLabel required>Height (in)</FieldLabel><SelectInput value={s1.heightIn} onChange={(v) => u1("heightIn", v)}><option value="">In</option>{Array.from({length:12},(_,i)=>i).map((n)=><option key={n}>{n}</option>)}</SelectInput></div>
                <div><FieldLabel required>Weight (lbs)</FieldLabel><TextInput type="number" value={s1.weight} onChange={(v) => u1("weight", v)} placeholder="lbs" /></div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Home Address</h3>
              <p className="text-xs text-body-muted mb-4">For medical records and insurance verification.</p>
              <div className="mb-3"><FieldLabel required>Street Address</FieldLabel><TextInput value={s1.streetAddress} onChange={(v) => u1("streetAddress", v)} placeholder="123 Main St" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><FieldLabel required>City</FieldLabel><TextInput value={s1.city} onChange={(v) => u1("city", v)} placeholder="City" /></div>
                <div><FieldLabel required>State</FieldLabel><SelectInput value={s1.shipState} onChange={(v) => u1("shipState", v)}><option value="">Select</option>{US_STATES.map((s) => <option key={s}>{s}</option>)}</SelectInput></div>
                <div><FieldLabel required>ZIP</FieldLabel><TextInput value={s1.zip} onChange={(v) => u1("zip", v)} placeholder="ZIP" /></div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Preferred Pharmacy</h3>
              <p className="text-xs text-body-muted mb-2">Once approved, where should your prescription be sent?</p>
              <PharmacySearch onSelect={setPharmacy} selected={pharmacy} onClear={() => setPharmacy(null)} />
            </div>

            <div className="flex justify-end">
              <button onClick={() => goTo(2)} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Insurance Details</h3>
              <p className="text-xs text-body-muted mb-4">We&apos;ll use this to check coverage and submit your prior authorization.</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><FieldLabel required>Insurance Provider</FieldLabel><TextInput value={s2.provider} onChange={(v) => u2("provider", v)} placeholder="e.g. UnitedHealthcare, Aetna, BCBS" /></div>
                <div><FieldLabel required>Plan Name / Group #</FieldLabel><TextInput value={s2.planName} onChange={(v) => u2("planName", v)} placeholder="Plan name or group number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><FieldLabel required>Member ID</FieldLabel><TextInput value={s2.memberId} onChange={(v) => u2("memberId", v)} placeholder="Member ID on your card" /></div>
                <div><FieldLabel>Subscriber Name (if different)</FieldLabel><TextInput value={s2.subscriberName} onChange={(v) => u2("subscriberName", v)} placeholder="If you're a dependent" /></div>
              </div>
              <div className="mb-3">
                <FieldLabel>Insurance Card Upload (front + back)</FieldLabel>
                <div className="w-full border border-dashed border-border rounded-lg px-3 py-4 text-center text-xs text-body-muted bg-gray-50">
                  File upload will be enabled during intake review. Please have your insurance card ready.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Do you have secondary insurance?</FieldLabel>
                  <SelectInput value={s2.hasSecondary} onChange={(v) => u2("hasSecondary", v)}>
                    <option value="">Select</option><option>No</option><option>Yes</option>
                  </SelectInput>
                </div>
                <div><FieldLabel>Employer (if employer-sponsored)</FieldLabel><TextInput value={s2.employer} onChange={(v) => u2("employer", v)} placeholder="Employer name (optional)" /></div>
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
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Clinical Eligibility</h3>
              <p className="text-xs text-body-muted mb-4">This information helps us build the strongest possible case for your prior authorization.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">Primary reason for seeking GLP-1 medication? <span className="text-brand-red">*</span></p>
                  <MultiSelect options={["Weight management","Type 2 Diabetes","Cardiovascular risk","PCOS","Sleep Apnea"]} selected={s3.reasons} onToggle={(v) => toggleArr("reasons", v)} />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">Your current <strong>BMI</strong></p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-border">
                    <span className="font-heading font-bold text-lg text-heading">{bmi ?? "—"}</span>
                    {bmi && <span className="text-xs text-body-muted">calculated from height/weight above</span>}
                  </div>
                  <p className="text-[11px] text-body-muted mt-1">Most insurers require BMI ≥ 27 with comorbidity or BMI ≥ 30</p>
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">Documented <strong>weight-related comorbidities</strong>? (Select all — these strengthen your PA)</p>
                  <MultiSelect options={["Hypertension","Type 2 Diabetes / Prediabetes","Dyslipidemia","Sleep Apnea","PCOS","NAFLD / Fatty Liver","Osteoarthritis","GERD"]} selected={s3.comorbidities} onToggle={(v) => toggleArr("comorbidities", v)} />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Tried other weight loss methods in past 3 months? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.triedOther} onChange={(v) => u3("triedOther", v)} />
                  {s3.triedOther === "y" && <textarea value={s3.triedOtherDetail} onChange={(e) => u3("triedOtherDetail", e.target.value)} placeholder="Describe: structured diet, exercise program, medications tried, duration..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Has your insurance previously <strong>denied</strong> GLP-1 coverage? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.priorDenial} onChange={(v) => u3("priorDenial", v)} />
                  {s3.priorDenial === "y" && <textarea value={s3.priorDenialDetail} onChange={(e) => u3("priorDenialDetail", e.target.value)} placeholder="Which medication, when, denial reason if known..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Do you have a <strong>primary care physician</strong> who has documented your weight history?</p>
                  <YesNoToggle value={s3.hasPcp} onChange={(v) => u3("hasPcp", v)} />
                  {s3.hasPcp === "y" && <TextInput value={s3.pcpDetail} onChange={(v) => u3("pcpDetail", v)} placeholder="PCP name and practice (for records request if needed)" />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Known <strong>drug allergies</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.hasAllergies} onChange={(v) => u3("hasAllergies", v)} />
                  {s3.hasAllergies === "y" && <textarea value={s3.allergiesDetail} onChange={(e) => u3("allergiesDetail", e.target.value)} placeholder="List allergies..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Currently taking any <strong>medications</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.hasMeds} onChange={(v) => u3("hasMeds", v)} />
                  {s3.hasMeds === "y" && <textarea value={s3.medsDetail} onChange={(e) => u3("medsDetail", e.target.value)} placeholder="List all..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
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
                <strong>Telehealth Consent:</strong> I consent to evaluation by Body Good Studio.<br /><br />
                <strong>Insurance Navigation:</strong> I understand Body Good Studio acts as my advocate with my insurance company but does not guarantee approval. Prior authorization outcomes depend on my insurance plan&apos;s formulary and clinical criteria. I authorize Body Good Studio to communicate with my insurer on my behalf.<br /><br />
                <strong>Accuracy:</strong> All information is accurate. Inaccurate insurance info may delay processing.<br /><br />
                <strong>HIPAA Authorization:</strong> I authorize Body Good Studio to access and share my medical records as necessary for the prior authorization process.
              </div>
              <div className="space-y-3">
                {[
                  { key: "c1" as const, label: <>I agree to <strong>Telehealth Consent</strong> and <strong>HIPAA Authorization</strong>.</> },
                  { key: "c2" as const, label: <>I authorize Body Good to <strong>communicate with my insurer</strong> on my behalf.</> },
                  { key: "c3" as const, label: <>I understand <strong>approval is not guaranteed</strong>.</> },
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

export default function InsuranceIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F4" }}><Loader2 className="w-6 h-6 animate-spin text-brand-red" /></div>}>
      <InsuranceForm />
    </Suspense>
  );
}
