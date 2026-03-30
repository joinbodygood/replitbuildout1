"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Scissors,
  Heart,
  Brain,
  Loader2,
} from "lucide-react";
import PharmacySearch, { type PharmacySelection } from "@/components/pharmacy-search/PharmacySearch";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const PROGRAM_CONFIG = {
  hair: {
    name: "Hair Loss Treatment",
    sub: "Prescription Hair Restoration",
    icon: Scissors,
    color: "#FFF8EB",
    iconColor: "#C47B00",
    stepLabel: "Hair Screening",
  },
  feminine: {
    name: "Feminine Health",
    sub: "Vaginal Health & Hormone Support",
    icon: Heart,
    color: "#FDE8F0",
    iconColor: "#C2185B",
    stepLabel: "FH Screening",
  },
  mental: {
    name: "Mental Health",
    sub: "Anxiety, Depression & Sleep Support",
    icon: Brain,
    color: "#E8ECFD",
    iconColor: "#3949AB",
    stepLabel: "MH Screening",
  },
};

type Program = keyof typeof PROGRAM_CONFIG;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold font-heading text-heading mb-1">
      {children}
      {required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}

const inputBase = "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors";

function TextInput({ value, onChange, placeholder, type = "text", readOnly }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`${inputBase} ${readOnly ? "bg-surface-dim text-body-muted" : ""}`}
    />
  );
}

function SelectInput({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors appearance-none"
    >
      {children}
    </select>
  );
}

function WarnAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 rounded-lg border border-orange-400 bg-orange-50 text-xs text-orange-800 leading-relaxed flex gap-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-500" />
      <span>{children}</span>
    </div>
  );
}

function StopAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 rounded-lg border border-red-500 bg-red-50 text-xs text-red-700 leading-relaxed flex gap-2">
      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function YesNoToggle({ value, onChange, warnAlert, stopAlert }: {
  value: string; onChange: (v: string) => void; warnAlert?: React.ReactNode; stopAlert?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex gap-2 mt-2">
        {["y", "n"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${
              value === v
                ? v === "y"
                  ? "bg-red-50 border-red-600 text-red-600"
                  : "bg-green-50 border-green-700 text-green-700"
                : "bg-white border-border text-body hover:border-gray-400"
            }`}
          >
            {v === "y" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {stopAlert && value === "y" && <StopAlert>{stopAlert}</StopAlert>}
      {warnAlert && value === "y" && <WarnAlert>{warnAlert}</WarnAlert>}
    </>
  );
}

function MultiSelect({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs text-left transition-all ${
            selected.includes(opt)
              ? "bg-brand-pink border-brand-red text-brand-red font-semibold"
              : "bg-white border-border text-heading hover:border-gray-400"
          }`}
        >
          <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 text-[9px] font-bold transition-all ${
            selected.includes(opt) ? "bg-brand-red border-brand-red text-white" : "border-border"
          }`}>
            {selected.includes(opt) ? "✓" : ""}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}


function ProgressBar({ step, stepLabel }: { step: number; stepLabel: string }) {
  const steps = ["About You", "Medical", stepLabel, "Consent"];
  return (
    <div className="mb-7">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-brand-red rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
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

function SuccessScreen({ program }: { program: Program }) {
  const cfg = PROGRAM_CONFIG[program] || PROGRAM_CONFIG.hair;
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "#FBF7F4" }}>
      <div className="text-center py-12 max-w-sm">
        <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-success" />
        </div>
        <h2 className="font-heading text-heading text-2xl font-bold mb-3">Intake Complete!</h2>
        <p className="text-body-muted text-sm leading-relaxed mb-8">
          Your {cfg.name} intake is submitted. Our clinical team will begin your evaluation and you&apos;ll hear back within 24–48 hours.
        </p>
        <a href="/programs" className="inline-flex items-center justify-center font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
          Return to Programs →
        </a>
      </div>
    </div>
  );
}

function SpecialtyForm() {
  const params = useSearchParams();
  const program = (params.get("program") || "hair") as Program;
  const fulfillmentParam = params.get("fulfillment") || "ship";
  const cfg = PROGRAM_CONFIG[program] || PROGRAM_CONFIG.hair;
  const Icon = cfg.icon;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fulfillment, setFulfillment] = useState<"ship" | "pharm">(fulfillmentParam as "ship" | "pharm");
  const [pharmacy, setPharmacy] = useState<PharmacySelection | null>(null);

  const [s1, setS1] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", sex: "", state: "",
    heightFt: "", heightIn: "", weight: "",
    streetAddress: "", city: "", shipState: "", zip: "",
  });

  const [s2, setS2] = useState({
    hasAllergies: "", allergiesDetail: "",
    hasMeds: "", medsDetail: "",
    pregnant: "",
  });

  const [hair, setHair] = useState({
    patterns: [] as string[],
    duration: "",
    familyHistory: "",
    thyroid: "",
    priorMeds: "", priorMedsDetail: "",
    liverDisease: "",
    prostateCancer: "",
  });

  const [fem, setFem] = useState({
    concerns: [] as string[],
    menstrualStatus: "",
    hormoneCancers: "",
    bloodClots: "",
    birthControl: "", birthControlDetail: "",
    vaginalBleeding: "",
    liverDisease: "",
  });

  const [mental, setMental] = useState({
    concerns: [] as string[],
    duration: "",
    hasTherapist: "", therapistDetail: "",
    psychMeds: "", psychMedsDetail: "",
    seizures: "",
    bipolar: "",
    substanceAbuse: "",
    alcohol: "",
    glaucoma: "",
  });

  const [s4, setS4] = useState({ c1: false, c2: false, c3: false, signature: "" });

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function u1(k: keyof typeof s1, v: string) { setS1((p) => ({ ...p, [k]: v })); }
  function u2(k: keyof typeof s2, v: string) { setS2((p) => ({ ...p, [k]: v })); }
  function uH(k: keyof typeof hair, v: string) { setHair((p) => ({ ...p, [k]: v })); }
  function uF(k: keyof typeof fem, v: string) { setFem((p) => ({ ...p, [k]: v })); }
  function uM(k: keyof typeof mental, v: string) { setMental((p) => ({ ...p, [k]: v })); }

  function toggleArr<T extends { [key: string]: unknown }>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T, val: string) {
    setter((prev) => {
      const arr = (prev[key] as string[]);
      return { ...prev, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
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
          formType: "specialty",
          program,
          fulfillment,
          pharmacy: pharmacy || null,
          personal: s1,
          medicalHistory: s2,
          screening: program === "hair" ? hair : program === "feminine" ? fem : mental,
          consent: { telehealth: s4.c1, accuracy: s4.c2, providerDiscretion: s4.c3, signature: s4.signature, signedAt: new Date().toISOString() },
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

  if (submitted) return <SuccessScreen program={program} />;

  return (
    <div className="min-h-screen" style={{ background: "#FBF7F4" }}>
      <div className="text-center py-7 px-5 max-w-xl mx-auto">
        <div className="w-12 h-12 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <h1 className="font-heading text-heading text-2xl font-bold mb-1.5">
          Order confirmed. <span className="text-brand-red">One more step.</span>
        </h1>
        <p className="text-body-muted text-sm leading-relaxed">
          Complete your medical intake so our clinical team can begin your evaluation.
        </p>
      </div>

      <div className="flex items-center gap-3 max-w-xl mx-auto px-5 mb-5 bg-white border border-border rounded-card p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.color }}>
          <Icon className="w-5 h-5" style={{ color: cfg.iconColor }} />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-heading">{cfg.name}</p>
          <p className="text-xs text-body-muted mt-0.5">{cfg.sub}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <ProgressBar step={step} stepLabel={cfg.stepLabel} />

        {step === 1 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Personal Information</h3>
              <p className="text-xs text-body-muted mb-4">Required for your medical evaluation and prescription.</p>
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
                <div><FieldLabel required>Height (in)</FieldLabel><SelectInput value={s1.heightIn} onChange={(v) => u1("heightIn", v)}><option value="">In</option>{Array.from({ length: 12 }, (_, i) => i).map((n) => <option key={n}>{n}</option>)}</SelectInput></div>
                <div><FieldLabel required>Weight (lbs)</FieldLabel><TextInput type="number" value={s1.weight} onChange={(v) => u1("weight", v)} placeholder="lbs" /></div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-3">Fulfillment Method</h3>
              <div className="flex gap-3 mb-4">
                {(["ship", "pharm"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFulfillment(type)}
                    className={`flex-1 py-2.5 text-xs font-semibold font-heading border rounded-lg transition-all ${fulfillment === type ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}
                  >
                    {type === "ship" ? "Ship to Me" : "Local Pharmacy"}
                  </button>
                ))}
              </div>

              {fulfillment === "ship" ? (
                <>
                  <h4 className="font-heading font-semibold text-xs text-heading mb-3">Shipping Address</h4>
                  <div className="mb-3"><FieldLabel required>Street Address</FieldLabel><TextInput value={s1.streetAddress} onChange={(v) => u1("streetAddress", v)} placeholder="123 Main St" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><FieldLabel required>City</FieldLabel><TextInput value={s1.city} onChange={(v) => u1("city", v)} placeholder="City" /></div>
                    <div><FieldLabel required>State</FieldLabel><SelectInput value={s1.shipState} onChange={(v) => u1("shipState", v)}><option value="">Select</option>{US_STATES.map((s) => <option key={s}>{s}</option>)}</SelectInput></div>
                    <div><FieldLabel required>ZIP</FieldLabel><TextInput value={s1.zip} onChange={(v) => u1("zip", v)} placeholder="ZIP" /></div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-heading font-semibold text-xs text-heading mb-2">Find Your Pharmacy <span className="text-brand-red">*</span></h4>
                  {pharmacy ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-600 rounded-lg mt-2">
                      <CheckCircle className="w-4 h-4 text-green-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-xs text-heading truncate">{pharmacy.pharmacy_name}</p>
                        <p className="text-[11px] text-body-muted truncate">{pharmacy.pharmacy_address}{pharmacy.pharmacy_npi ? ` · NPI: ${pharmacy.pharmacy_npi}` : ""}</p>
                      </div>
                      <button type="button" onClick={() => setPharmacy(null)} className="text-brand-red text-xs font-semibold font-heading border border-brand-red px-2.5 py-1 rounded-full hover:bg-red-50 shrink-0">Change</button>
                    </div>
                  ) : (
                    <PharmacySearch onSelect={setPharmacy} />
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => goTo(2)} className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Medical History</h3>
              <p className="text-xs text-body-muted mb-4">Answer honestly — this directly impacts prescribing decisions and your safety.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Known <strong>drug allergies</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasAllergies} onChange={(v) => u2("hasAllergies", v)} />
                  {s2.hasAllergies === "y" && <textarea value={s2.allergiesDetail} onChange={(e) => u2("allergiesDetail", e.target.value)} placeholder="List all..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Current <strong>medications</strong>? (Rx, OTC, supplements) <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasMeds} onChange={(v) => u2("hasMeds", v)} />
                  {s2.hasMeds === "y" && <textarea value={s2.medsDetail} onChange={(e) => u2("medsDetail", e.target.value)} placeholder="List all..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Currently <strong>pregnant, breastfeeding, or planning pregnancy</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.pregnant} onChange={(v) => u2("pregnant", v)} warnAlert="Some medications in this program may be contraindicated. Provider will select safe alternatives." />
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
            {program === "hair" && (
              <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Hair Loss — Clinical Screening</h3>
                <p className="text-xs text-body-muted mb-4">Help your provider determine the right treatment approach.</p>
                <div className="divide-y divide-gray-100">
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-1">Hair loss pattern? <span className="text-brand-red">*</span></p>
                    <MultiSelect options={["Thinning at crown","Receding hairline","Overall thinning","Patchy loss (alopecia)","Post-partum shedding","Thinning eyebrows/lashes"]} selected={hair.patterns} onToggle={(v) => toggleArr(setHair, "patterns", v)} />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-2">How long have you noticed hair loss? <span className="text-brand-red">*</span></p>
                    <div className="flex gap-2 flex-wrap">
                      {["< 6 months", "6–12 months", "1+ years"].map((opt) => (
                        <button key={opt} type="button" onClick={() => uH("duration", opt)} className={`px-4 py-2 text-xs font-semibold font-heading border rounded-lg transition-all ${hair.duration === opt ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium"><strong>Family history</strong> of hair loss (either parent)? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={hair.familyHistory} onChange={(v) => uH("familyHistory", v)} />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Had <strong>thyroid testing</strong> in the past year? <span className="text-brand-red">*</span></p>
                    <div className="flex gap-2 mt-2">
                      {["Yes — normal","Yes — abnormal","No"].map((opt) => (
                        <button key={opt} type="button" onClick={() => uH("thyroid", opt)} className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${hair.thyroid === opt ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                      ))}
                    </div>
                    {hair.thyroid === "Yes — abnormal" && <WarnAlert>Thyroid dysfunction is a common cause of hair loss. Provider may request labs.</WarnAlert>}
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Tried <strong>minoxidil, finasteride, or spironolactone</strong> before?</p>
                    <YesNoToggle value={hair.priorMeds} onChange={(v) => uH("priorMeds", v)} />
                    {hair.priorMeds === "y" && <textarea value={hair.priorMedsDetail} onChange={(e) => uH("priorMedsDetail", e.target.value)} placeholder="Which product, how long, results..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>liver disease</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={hair.liverDisease} onChange={(v) => uH("liverDisease", v)} warnAlert="Finasteride and spironolactone are hepatically metabolized. Provider will evaluate." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>prostate cancer</strong>? (males only) <span className="text-brand-red">*</span></p>
                    <div className="flex gap-2 mt-2">
                      {["Yes","No","N/A"].map((opt) => (
                        <button key={opt} type="button" onClick={() => uH("prostateCancer", opt)} className={`flex-1 py-2 text-xs font-semibold font-heading border rounded-lg transition-all ${hair.prostateCancer === opt ? (opt === "Yes" ? "bg-red-50 border-red-600 text-red-600" : "bg-green-50 border-green-700 text-green-700") : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                      ))}
                    </div>
                    {hair.prostateCancer === "Yes" && <StopAlert>5-alpha reductase inhibitors affect PSA levels. Provider will discuss alternatives.</StopAlert>}
                  </div>
                </div>
              </div>
            )}

            {program === "feminine" && (
              <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Feminine Health — Clinical Screening</h3>
                <p className="text-xs text-body-muted mb-4">Help your provider understand your symptoms for safe prescribing.</p>
                <div className="divide-y divide-gray-100">
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-1">Primary concern? <span className="text-brand-red">*</span></p>
                    <MultiSelect options={["Vaginal dryness","Recurring yeast infections","Bacterial vaginosis","UTI prevention","Menopause symptoms","Low libido","Painful intercourse","Hormonal imbalance"]} selected={fem.concerns} onToggle={(v) => toggleArr(setFem, "concerns", v)} />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-2">Menstrual status? <span className="text-brand-red">*</span></p>
                    <div className="flex gap-2 flex-wrap">
                      {["Regular periods","Irregular","Perimenopause","Post-menopause"].map((opt) => (
                        <button key={opt} type="button" onClick={() => uF("menstrualStatus", opt)} className={`px-3 py-2 text-xs font-semibold font-heading border rounded-lg transition-all ${fem.menstrualStatus === opt ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>hormone-sensitive cancers</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={fem.hormoneCancers} onChange={(v) => uF("hormoneCancers", v)} stopAlert="Hormonal treatments are contraindicated. Provider will discuss non-hormonal options." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>blood clots</strong> (DVT, PE, stroke)? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={fem.bloodClots} onChange={(v) => uF("bloodClots", v)} warnAlert="Estrogen increases clot risk. Provider will select safer options." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Currently using <strong>hormonal birth control</strong>?</p>
                    <YesNoToggle value={fem.birthControl} onChange={(v) => uF("birthControl", v)} />
                    {fem.birthControl === "y" && <TextInput value={fem.birthControlDetail} onChange={(v) => uF("birthControlDetail", v)} placeholder="Which type? (pill, IUD, patch, ring...)" />}
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>unexplained vaginal bleeding</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={fem.vaginalBleeding} onChange={(v) => uF("vaginalBleeding", v)} warnAlert="Must be evaluated before starting hormonal therapy." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>liver disease</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={fem.liverDisease} onChange={(v) => uF("liverDisease", v)} warnAlert="Hormonal medications are hepatically metabolized." />
                  </div>
                </div>
              </div>
            )}

            {program === "mental" && (
              <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Mental Health — Clinical Screening</h3>
                <p className="text-xs text-body-muted mb-4">Helps your provider prescribe safely and effectively.</p>
                <div className="divide-y divide-gray-100">
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-1">Primary concern? <span className="text-brand-red">*</span></p>
                    <MultiSelect options={["Anxiety","Depression","Insomnia / Sleep","ADHD / Focus","Stress management","Panic attacks"]} selected={mental.concerns} onToggle={(v) => toggleArr(setMental, "concerns", v)} />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium mb-2">How long have you experienced these symptoms? <span className="text-brand-red">*</span></p>
                    <div className="flex gap-2 flex-wrap">
                      {["< 3 months","3–12 months","1+ years"].map((opt) => (
                        <button key={opt} type="button" onClick={() => uM("duration", opt)} className={`px-4 py-2 text-xs font-semibold font-heading border rounded-lg transition-all ${mental.duration === opt ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Currently seeing a <strong>therapist or psychiatrist</strong>?</p>
                    <YesNoToggle value={mental.hasTherapist} onChange={(v) => uM("hasTherapist", v)} />
                    {mental.hasTherapist === "y" && <TextInput value={mental.therapistDetail} onChange={(v) => uM("therapistDetail", v)} placeholder="Provider name (helpful for care coordination)" />}
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Currently taking any <strong>psychiatric medications</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={mental.psychMeds} onChange={(v) => uM("psychMeds", v)} />
                    {mental.psychMeds === "y" && <textarea value={mental.psychMedsDetail} onChange={(e) => uM("psychMedsDetail", e.target.value)} placeholder="List medication, dose, prescriber..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>seizures or epilepsy</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={mental.seizures} onChange={(v) => uM("seizures", v)} warnAlert="Bupropion lowers seizure threshold. Provider will select safe alternatives." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>bipolar disorder or manic episodes</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={mental.bipolar} onChange={(v) => uM("bipolar", v)} stopAlert="Some antidepressants can trigger mania in bipolar patients. This is essential for your provider to know." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">History of <strong>substance abuse</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={mental.substanceAbuse} onChange={(v) => uM("substanceAbuse", v)} warnAlert="Certain medications (benzodiazepines, stimulants) have abuse potential. Provider will consider alternatives." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium">Do you use <strong>alcohol</strong> regularly? (3+ drinks/week)</p>
                    <YesNoToggle value={mental.alcohol} onChange={(v) => uM("alcohol", v)} warnAlert="Alcohol interacts with many psychiatric medications. Provider will advise." />
                  </div>
                  <div className="py-3">
                    <p className="text-sm text-heading font-medium"><strong>Narrow-angle glaucoma</strong>? <span className="text-brand-red">*</span></p>
                    <YesNoToggle value={mental.glaucoma} onChange={(v) => uM("glaucoma", v)} warnAlert="Some SSRIs and SNRIs can worsen narrow-angle glaucoma." />
                  </div>
                </div>
              </div>
            )}

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
                <strong>Prescription Acknowledgment:</strong> Prescribing is at the provider&apos;s discretion. I will use medications as directed and report side effects immediately.<br /><br />
                <strong>Accuracy &amp; HIPAA:</strong> All information is accurate. Privacy maintained per HIPAA.
              </div>
              <div className="space-y-3">
                {[
                  { key: "c1" as const, label: <>I agree to <strong>Telehealth Consent</strong> and <strong>HIPAA</strong>.</> },
                  { key: "c2" as const, label: <>I certify all information is <strong>accurate and complete</strong>.</> },
                  { key: "c3" as const, label: <>I understand prescribing is at <strong>provider&apos;s discretion</strong>.</> },
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

export default function SpecialtyIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F4" }}><Loader2 className="w-6 h-6 animate-spin text-brand-red" /></div>}>
      <SpecialtyForm />
    </Suspense>
  );
}
