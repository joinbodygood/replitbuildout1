"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import PharmacySearch, { type PharmacySelection } from "@/components/pharmacy-search/PharmacySearch";
import { useCart } from "@/context/CartContext";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const CONDITIONS = ["Type 2 Diabetes","High Blood Pressure","High Cholesterol","PCOS","None"];

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
        <button key={opt} type="button" onClick={() => {
          if (opt === "None") { onToggle("__clear__"); return; }
          onToggle(opt);
        }}
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
  const steps = ["About You","Medical","Rx Details","Consent"];
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
          Your branded Rx intake is submitted. Our provider will review and send your prescription to your selected pharmacy within 24–48 hours.
        </p>
        <a href="/programs" className="inline-flex items-center justify-center font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors" style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}>
          Return to Programs →
        </a>
      </div>
    </div>
  );
}

function BrandedRxForm() {
  const router = useRouter();
  const locale = useLocale();
  const { addItem, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepError, setStepError] = useState("");
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
    mtcHistory: "",
    pregnant: "",
    pancreatitis: "",
    conditions: [] as string[],
  });

  const [s3, setS3] = useState({
    preferredMeds: [] as string[],
    transferring: "", transferDetail: "",
    hasInsurance: "",
    weightGoal: "",
  });

  const [s4, setS4] = useState({ c1: false, c2: false, c3: false, signature: "" });

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function u1(k: keyof typeof s1, v: string) { setS1((p) => ({ ...p, [k]: v })); }
  function u2(k: keyof typeof s2, v: string | string[]) { setS2((p) => ({ ...p, [k]: v })); }
  function u3(k: keyof typeof s3, v: string | string[]) { setS3((p) => ({ ...p, [k]: v })); }

  function toggleCond(c: string) {
    setS2((prev) => {
      if (c === "None") return { ...prev, conditions: prev.conditions.includes("None") ? [] : ["None"] };
      const without = prev.conditions.filter((x) => x !== "None");
      return { ...prev, conditions: without.includes(c) ? without.filter((x) => x !== c) : [...without, c] };
    });
  }

  function toggleMed(m: string) {
    setS3((prev) => {
      const arr = prev.preferredMeds;
      return { ...prev, preferredMeds: arr.includes(m) ? arr.filter((x) => x !== m) : [...arr, m] };
    });
  }

  function goTo(n: number) { setStep(n); setStepError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function validate1(): string {
    if (!s1.firstName.trim()) return "First name is required.";
    if (!s1.lastName.trim()) return "Last name is required.";
    if (!s1.email.trim() || !s1.email.includes("@")) return "A valid email address is required.";
    if (!s1.phone.trim()) return "Phone number is required.";
    if (!s1.dob) return "Date of birth is required.";
    if (!s1.sex) return "Sex at birth is required.";
    if (!s1.state) return "State is required.";
    if (!s1.heightFt) return "Height (feet) is required.";
    if (s1.heightIn === "") return "Height (inches) is required.";
    if (!s1.weight.trim()) return "Weight is required.";
    if (!s1.streetAddress.trim()) return "Street address is required.";
    if (!s1.city.trim()) return "City is required.";
    if (!s1.shipState) return "Mailing state is required.";
    if (!s1.zip.trim()) return "ZIP code is required.";
    if (!pharmacy) return "Please select your preferred pharmacy.";
    return "";
  }

  function validate2(): string {
    if (!s2.hasAllergies) return "Please answer: Do you have known drug allergies?";
    if (s2.hasAllergies === "y" && !s2.allergiesDetail.trim()) return "Please list your known allergies.";
    if (!s2.hasMeds) return "Please answer: Are you on any current medications?";
    if (s2.hasMeds === "y" && !s2.medsDetail.trim()) return "Please list your current medications.";
    if (!s2.mtcHistory) return "Please answer: Personal/family history of MTC or MEN2?";
    if (!s2.pregnant) return "Please answer: Currently pregnant, breastfeeding, or planning pregnancy?";
    if (!s2.pancreatitis) return "Please answer: History of pancreatitis?";
    return "";
  }

  function validate3(): string {
    if (s3.preferredMeds.length === 0) return "Please select at least one preferred medication.";
    if (!s3.transferring) return "Please answer: Are you transferring from another provider?";
    if (s3.transferring === "y" && !s3.transferDetail.trim()) return "Please provide your transfer details.";
    return "";
  }

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
          formType: "branded-rx",
          pharmacy: pharmacy || null,
          personal: s1,
          medicalHistory: s2,
          rxDetails: s3,
          consent: { telehealth: s4.c1, medicationNotIncluded: s4.c2, glp1Warning: s4.c3, signature: s4.signature, signedAt: new Date().toISOString() },
        }),
      });
      // Intake saved — clear any prior compounded/medication items, then add ONLY the $55 review fee.
      // Branded flow never charges for medication; patient fills Rx at their own pharmacy.
      clearCart();
      addItem({
        productId: "WM-BRAND-MGMT",
        variantId: "WM-BRAND-MGMT",
        name: "Branded Rx — Doctor Review & Prescription",
        variantLabel: `One-time medical review — ${s3.preferredMeds.join(", ") || "Branded GLP-1"}`,
        price: 5500, // $55.00 in cents
        slug: "branded-rx",
        isMedPlan: false,
      });
      router.push(`/${locale}/checkout`);
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
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="font-heading text-heading text-2xl font-bold mb-1.5">
          Step 1 of 2 — <span className="text-brand-red">Your health intake.</span>
        </h1>
        <p className="text-body-muted text-sm leading-relaxed">
          Complete the form below, then you&apos;ll pay the <strong>$55 doctor review fee</strong> to submit.
        </p>
      </div>

      <div className="flex items-center gap-3 max-w-xl mx-auto px-5 mb-5 bg-white border border-border rounded-card p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-heading">Branded Rx Management</p>
          <p className="text-xs text-body-muted mt-0.5">Wegovy, Zepbound — Prescription Management Service</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <ProgressBar step={step} />

        {step === 1 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Personal Information</h3>
              <p className="text-xs text-body-muted mb-4">Required for your prescription.</p>
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
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Address &amp; Pharmacy</h3>
              <p className="text-xs text-body-muted mb-4">Your address for records and preferred pharmacy for your prescription.</p>
              <div className="mb-3"><FieldLabel required>Street Address</FieldLabel><TextInput value={s1.streetAddress} onChange={(v) => u1("streetAddress", v)} placeholder="123 Main St" /></div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div><FieldLabel required>City</FieldLabel><TextInput value={s1.city} onChange={(v) => u1("city", v)} placeholder="City" /></div>
                <div><FieldLabel required>State</FieldLabel><SelectInput value={s1.shipState} onChange={(v) => u1("shipState", v)}><option value="">Select</option>{US_STATES.map((s) => <option key={s}>{s}</option>)}</SelectInput></div>
                <div><FieldLabel required>ZIP</FieldLabel><TextInput value={s1.zip} onChange={(v) => u1("zip", v)} placeholder="ZIP" /></div>
              </div>
              <FieldLabel required>Find Your Pharmacy</FieldLabel>
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
            </div>

            {stepError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-400 rounded-lg text-xs text-red-700 flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />{stepError}
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => { const err = validate1(); if (err) { setStepError(err); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); return; } goTo(2); }}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Medical History &amp; Safety Screening</h3>
              <p className="text-xs text-body-muted mb-4">We screen for the same GLP-1 contraindications as branded prescriptions.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Known <strong>drug allergies</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasAllergies} onChange={(v) => u2("hasAllergies", v)} />
                  {s2.hasAllergies === "y" && <textarea value={s2.allergiesDetail} onChange={(e) => u2("allergiesDetail", e.target.value)} placeholder="List all..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Current <strong>medications</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.hasMeds} onChange={(v) => u2("hasMeds", v)} />
                  {s2.hasMeds === "y" && <textarea value={s2.medsDetail} onChange={(e) => u2("medsDetail", e.target.value)} placeholder="List all..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Personal/family history of <strong>MTC or MEN2</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.mtcHistory} onChange={(v) => u2("mtcHistory", v)} stopAlert="Absolute contraindication to all GLP-1 medications." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Currently <strong>pregnant, breastfeeding, or planning pregnancy</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.pregnant} onChange={(v) => u2("pregnant", v)} stopAlert="Contraindicated during pregnancy/breastfeeding." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">History of <strong>pancreatitis</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s2.pancreatitis} onChange={(v) => u2("pancreatitis", v)} warnAlert="Flagged for review." />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">Existing conditions:</p>
                  <MultiSelect options={CONDITIONS} selected={s2.conditions} onToggle={toggleCond} />
                </div>
              </div>
            </div>
            {stepError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-400 rounded-lg text-xs text-red-700 flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />{stepError}
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => goTo(1)} className="font-heading font-bold text-sm border border-border text-body px-6 py-3 rounded-pill hover:border-gray-400 transition-colors">← Back</button>
              <button
                onClick={() => { const err = validate2(); if (err) { setStepError(err); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); return; } goTo(3); }}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">Prescription Details</h3>
              <p className="text-xs text-body-muted mb-4">Help us write the right prescription for you.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-1">Which branded medication do you prefer? <span className="text-brand-red">*</span></p>
                  <MultiSelect
                    options={["Wegovy (semaglutide)","Zepbound (tirzepatide)","Ozempic (semaglutide)","Mounjaro (tirzepatide)","Provider to recommend"]}
                    selected={s3.preferredMeds}
                    onToggle={toggleMed}
                  />
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium">Are you <strong>transferring from another provider</strong>? <span className="text-brand-red">*</span></p>
                  <YesNoToggle value={s3.transferring} onChange={(v) => u3("transferring", v)} />
                  {s3.transferring === "y" && <textarea value={s3.transferDetail} onChange={(e) => u3("transferDetail", e.target.value)} placeholder="Current medication, dose, prescriber name, reason for transfer..." className={`mt-2 ${inputBase} resize-y min-h-[60px]`} />}
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-2">Do you currently have <strong>insurance coverage</strong> for branded GLP-1?</p>
                  <div className="flex gap-2">
                    {["Yes","No","Not sure"].map((opt) => (
                      <button key={opt} type="button" onClick={() => u3("hasInsurance", opt)}
                        className={`flex-1 py-2 text-xs font-semibold font-heading border rounded-lg transition-all ${s3.hasInsurance === opt ? "bg-brand-pink border-brand-red text-brand-red" : "bg-white border-border text-body hover:border-gray-400"}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="py-3">
                  <p className="text-sm text-heading font-medium mb-2">What is your primary <strong>weight loss goal</strong>?</p>
                  <TextInput value={s3.weightGoal} onChange={(v) => u3("weightGoal", v)} placeholder="e.g. Lose 40 lbs, manage diabetes, reduce A1C..." />
                </div>
              </div>
            </div>
            {stepError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-400 rounded-lg text-xs text-red-700 flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />{stepError}
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => goTo(2)} className="font-heading font-bold text-sm border border-border text-body px-6 py-3 rounded-pill hover:border-gray-400 transition-colors">← Back</button>
              <button
                onClick={() => { const err = validate3(); if (err) { setStepError(err); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); return; } goTo(4); }}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="bg-white border border-border rounded-card p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 className="font-heading font-bold text-sm text-heading mb-3">Informed Consent</h3>
              <div className="bg-gray-50 border border-border rounded-lg p-4 text-xs text-body leading-relaxed mb-4 max-h-40 overflow-y-auto">
                <strong>Telehealth Consent:</strong> I consent to telehealth evaluation by Body Good Studio.<br /><br />
                <strong>Branded Rx Notice:</strong> I understand Body Good Studio provides prescription management services only. Medication is NOT included — I will fill my prescription at my own pharmacy. Cost of branded medication depends on my insurance coverage and pharmacy pricing.<br /><br />
                <strong>GLP-1 Warning:</strong> I acknowledge the boxed warning for GLP-1 medications regarding thyroid tumors.<br /><br />
                <strong>Accuracy &amp; HIPAA:</strong> All information is accurate. Privacy per HIPAA.
              </div>
              <div className="space-y-3">
                {[
                  { key: "c1" as const, label: <>I agree to <strong>Telehealth Consent</strong> and <strong>HIPAA</strong>.</> },
                  { key: "c2" as const, label: <>I understand <strong>medication is NOT included</strong> in this service.</> },
                  { key: "c3" as const, label: <>I acknowledge the <strong>GLP-1 boxed warning</strong>.</> },
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
                {submitting ? "Saving your intake..." : "Submit & Proceed to Payment — $55 →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandedRxIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F4" }}><Loader2 className="w-6 h-6 animate-spin text-brand-red" /></div>}>
      <BrandedRxForm />
    </Suspense>
  );
}
