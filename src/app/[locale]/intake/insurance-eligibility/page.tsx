"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  X,
  ShieldCheck,
  CreditCard,
  Loader2,
  IdCard,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const CONDITIONS = [
  { id: "obesity",            label: "Obesity (BMI ≥ 30)",                                    icd: "E66.01" },
  { id: "overweight_comorbid",label: "Overweight with comorbidity (BMI 27–29.9)",              icd: "E66.3"  },
  { id: "type2_diabetes",     label: "Type 2 Diabetes",                                        icd: "E11.x"  },
  { id: "prediabetes",        label: "Prediabetes / Insulin Resistance",                       icd: "R73.03" },
  { id: "hypertension",       label: "Hypertension (High Blood Pressure)",                     icd: "I10"    },
  { id: "dyslipidemia",       label: "Dyslipidemia (High Cholesterol / Triglycerides)",        icd: "E78.5"  },
  { id: "sleep_apnea",        label: "Obstructive Sleep Apnea",                               icd: "G47.33" },
  { id: "pcos",               label: "Polycystic Ovary Syndrome (PCOS)",                       icd: "E28.2"  },
  { id: "nafld",              label: "Non-Alcoholic Fatty Liver Disease (NAFLD/MASH)",        icd: "K76.0"  },
  { id: "cardiovascular",     label: "Cardiovascular Disease / History of Heart Events",       icd: "I25.x"  },
  { id: "osteoarthritis",     label: "Osteoarthritis (weight-bearing joints)",                 icd: "M19.x"  },
  { id: "family_history",     label: "Family history of diabetes or cardiovascular disease",   icd: "Z83.3"  },
];

const PRIOR_ATTEMPTS = [
  "Physician-supervised diet program",
  "Registered dietitian / nutritionist counseling",
  "Structured exercise program",
  "Behavioral / cognitive therapy for weight",
  "Previous prescription weight loss medication",
  "Commercial weight loss program (e.g., Weight Watchers, Noom)",
  "Medically supervised very low-calorie diet (VLCD)",
];

const PLAN_TYPES = ["PPO", "HMO", "EPO", "POS", "HDHP / HSA", "Medicaid / MCO", "Medicare", "Other / Not Sure"];
const RELATIONSHIPS = ["Self", "Spouse", "Dependent Child", "Other"];
const DURATIONS = ["Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "2+ years", "Not applicable"];

const EMPLOYER_SIZES = [
  { id: "large_5000_plus",  label: "Large employer (5,000+ employees)" },
  { id: "medium_500_4999",  label: "Medium employer (500–4,999 employees)" },
  { id: "small_under_500",  label: "Small employer (under 500 employees)" },
  { id: "government_federal", label: "Federal government / military" },
  { id: "government_state", label: "State / local government" },
  { id: "self_employed",    label: "Self-employed / individual market" },
  { id: "marketplace_aca",  label: "ACA marketplace plan" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const MEDICATIONS = [
  { id: "tirzepatide", name: "Tirzepatide (Zepbound® / Mounjaro®)", desc: "GLP-1/GIP dual agonist — typically covered under obesity or T2D indications" },
  { id: "semaglutide", name: "Semaglutide (Wegovy® / Ozempic®)", desc: "GLP-1 agonist — Wegovy for obesity, Ozempic for T2D" },
  { id: "either", name: "Open to either — recommend best coverage path", desc: "Our team will check formulary status for both and recommend the option most likely to be covered" },
];

const STEPS = [
  { title: "Insurance Information", desc: "Upload your insurance card and provide plan details" },
  { title: "Medical History", desc: "Qualifying conditions that support GLP-1 coverage" },
  { title: "Medication Preference", desc: "Which GLP-1 medication are you seeking coverage for?" },
  { title: "Review & Acknowledge", desc: "Important disclaimer before submission" },
];

const LOADING_MESSAGES = [
  "Securely uploading your documents...",
  "Encrypting and submitting your information...",
  "Saving your eligibility request...",
  "Adding your verification to cart...",
  "Redirecting to payment...",
];

const inputBase = "w-full border border-[#E5E5E5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0C0D0F] bg-white focus:outline-none focus:border-[#ED1B1B] transition-colors";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold font-heading text-[#0C0D0F] mb-1.5">
      {children}{required && <span className="text-[#ED1B1B] ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ label, required, value, onChange, placeholder, type = "text" }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={inputBase} />
    </div>
  );
}

function SelectInput({ label, required, value, onChange, options, placeholder = "Select..." }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} appearance-none cursor-pointer`}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SelectInputPairs({ label, required, value, onChange, options, placeholder = "Select..." }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} appearance-none cursor-pointer`}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextareaInput({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={`${inputBase} resize-vertical`} />
    </div>
  );
}

function FileUploadZone({ label, sublabel, Icon, file, onFile, required }: {
  label: string; sublabel?: string; Icon: React.ElementType; file: File | null; onFile: (f: File | null) => void; required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {sublabel && <p className="text-[11px] text-[#55575A] mb-2">{sublabel}</p>}
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative rounded-[12px] border-2 border-dashed p-6 text-center transition-all ${
          file
            ? "border-green-500 bg-green-50 cursor-default"
            : drag
            ? "border-[#ED1B1B] bg-[#FDE7E7] cursor-copy"
            : "border-[#E5E5E5] bg-[#FAFAFA] cursor-pointer hover:border-[#ED1B1B]/40"
        }`}
      >
        <input ref={ref} type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

        {file ? (
          <>
            <CheckCircle className="w-7 h-7 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-700 truncate max-w-xs mx-auto">{file.name}</p>
            <p className="text-[11px] text-green-600 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="mt-2 text-[#ED1B1B] text-xs font-semibold underline flex items-center gap-1 mx-auto">
              <X className="w-3 h-3" /> Remove
            </button>
          </>
        ) : (
          <>
            <Icon className="w-8 h-8 text-[#55575A]/50 mx-auto mb-2" />
            <p className="text-sm text-[#55575A]">Drag & drop or <span className="text-[#ED1B1B] font-semibold">click to upload</span></p>
            <p className="text-[11px] text-[#55575A]/60 mt-1">JPG, PNG, PDF — max 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-7">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-[#ED1B1B] rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <div className="flex justify-between">
        {STEPS.map((s, i) => {
          const done = i < step; const active = i === step;
          return (
            <span key={i} className={`text-[10px] font-semibold font-heading uppercase tracking-wide flex items-center gap-1 transition-colors ${done ? "text-green-600" : active ? "text-[#ED1B1B]" : "text-[#55575A]/50"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${done ? "bg-green-600 border-green-600 text-white" : active ? "bg-[#ED1B1B] border-[#ED1B1B] text-white" : "bg-white border-[#E5E5E5] text-[#55575A]/50"}`}>
                {done ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title.split(" ")[0]}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

async function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => res(r.result as string);
    r.onerror = rej;
  });
}

function EligibilityFormInner() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const router = useRouter();
  const { addItem } = useCart();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [formState, setFormState] = useState<"idle" | "loading" | "submitted">("idle");
  const [submitError, setSubmitError] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Step 0 — Insurance
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [planType, setPlanType] = useState("");
  const [memberId, setMemberId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [subscriberDob, setSubscriberDob] = useState("");
  const [relationship, setRelationship] = useState("");
  const [state, setState] = useState("FL");
  const [employerSize, setEmployerSize] = useState("");
  const [cardFront, setCardFront] = useState<File | null>(null);
  const [cardBack, setCardBack] = useState<File | null>(null);
  const [photoId, setPhotoId] = useState<File | null>(null);

  // Step 1 — Medical
  const [conditions, setConditions] = useState<string[]>([]);
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [priorAttempts, setPriorAttempts] = useState<string[]>([]);
  const [priorDuration, setPriorDuration] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Step 2 — Medication
  const [preferredMed, setPreferredMed] = useState("");
  const [prevGlp1, setPrevGlp1] = useState("");
  const [prevGlp1Detail, setPrevGlp1Detail] = useState("");

  // Step 3 — Acknowledge
  const [acknowledged, setAcknowledged] = useState(false);

  const bmi = heightFt && weight
    ? (703 * Number(weight) / Math.pow(Number(heightFt) * 12 + Number(heightIn || 0), 2)).toFixed(1)
    : null;

  const toggleCondition = (id: string) =>
    setConditions((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAttempt = (a: string) =>
    setPriorAttempts((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const validate = useCallback(() => {
    const e: string[] = [];
    if (step === 0) {
      if (!insuranceProvider.trim()) e.push("Insurance provider is required");
      if (!memberId.trim()) e.push("Member / Subscriber ID is required");
      if (!subscriberName.trim()) e.push("Subscriber full name is required");
      if (!subscriberDob) e.push("Subscriber date of birth is required");
      if (!state) e.push("State is required");
      if (!employerSize) e.push("Plan / employer type is required");
      if (!cardFront) e.push("Insurance card front is required");
      if (!cardBack) e.push("Insurance card back is required");
      if (!photoId) e.push("Government-issued photo ID is required");
    }
    if (step === 1) {
      if (conditions.length === 0) e.push("Please select at least one qualifying medical condition");
      if (!heightFt.trim()) e.push("Height (ft) is required");
      if (!weight.trim()) e.push("Current weight is required");
    }
    if (step === 2) {
      if (!preferredMed) e.push("Please select a preferred medication");
      if (!prevGlp1) e.push("Please indicate your prior GLP-1 experience");
    }
    if (step === 3) {
      if (!acknowledged) e.push("You must acknowledge the disclaimer to submit");
    }
    setErrors(e);
    return e.length === 0;
  }, [step, insuranceProvider, memberId, subscriberName, subscriberDob, state, employerSize, cardFront, cardBack, photoId, conditions, heightFt, weight, preferredMed, prevGlp1, acknowledged]);

  const next = () => {
    if (validate()) {
      setStep((s) => s + 1);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const back = () => {
    setStep((s) => s - 1);
    setErrors([]);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormState("loading");
    setSubmitError("");
    topRef.current?.scrollIntoView({ behavior: "smooth" });

    let msgTimer: ReturnType<typeof setInterval> | null = null;
    msgTimer = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);

    try {
      const [cardFrontB64, cardBackB64, photoIdB64] = await Promise.all([
        cardFront ? toBase64(cardFront) : Promise.resolve(null),
        cardBack  ? toBase64(cardBack)  : Promise.resolve(null),
        photoId   ? toBase64(photoId)   : Promise.resolve(null),
      ]);

      const selectedConditions = conditions.map((id) => {
        const c = CONDITIONS.find((x) => x.id === id);
        return { id, label: c?.label || id, icd: c?.icd || "" };
      });

      const intakePayload = {
        formType: "insurance-eligibility",
        step1_insurance: {
          insuranceProvider, planType, memberId, groupNumber,
          subscriberName, subscriberDob, relationship, state, employerSize,
          cardFront: cardFront ? { name: cardFront.name, type: cardFront.type, data: cardFrontB64 } : null,
          cardBack:  cardBack  ? { name: cardBack.name,  type: cardBack.type,  data: cardBackB64  } : null,
          photoId:   photoId   ? { name: photoId.name,   type: photoId.type,   data: photoIdB64   } : null,
        },
        step2_medical: {
          conditions: selectedConditions,
          heightFt, heightIn, weight, bmi,
          priorAttempts, priorDuration,
          currentMeds, additionalNotes,
        },
        step3_medication: { preferredMed, prevGlp1: prevGlp1 === "Yes", prevGlp1Detail },
        step4_consent: { acknowledged, acknowledgedAt: new Date().toISOString() },
      };

      await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intakePayload),
      });

      addItem({
        productId: "INS-ELIG",
        variantId: "INS-ELIG-v1",
        name: "Insurance Eligibility Check",
        variantLabel: "One-time verification",
        price: 2500,
        slug: "insurance-eligibility-check",
      });

      router.push(`/${locale}/checkout`);
    } catch {
      if (msgTimer) clearInterval(msgTimer);
      setFormState("idle");
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      if (msgTimer) clearInterval(msgTimer);
    }
  };

  // ── Loading Screen ──
  if (formState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDE7E7] via-white to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-12 max-w-md w-full text-center"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>
          <div className="w-16 h-16 rounded-full border-4 border-[#E5E5E5] border-t-[#ED1B1B] animate-spin mx-auto mb-6" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#ED1B1B]" />
            <span className="font-heading font-bold text-xs text-[#ED1B1B] uppercase tracking-wider">Checking across 4 data sources</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-[#0C0D0F] mb-2">Analyzing your coverage...</h2>
          <p className="text-sm text-[#55575A] leading-relaxed min-h-[40px] transition-all">
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <div className="mt-6 flex justify-center gap-1.5">
            {LOADING_MESSAGES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === loadingMsgIdx ? "bg-[#ED1B1B]" : "bg-[#E5E5E5]"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  // ── Main Form ──
  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-b from-[#FDE7E7] via-white to-white">
      {/* Sticky header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-heading font-extrabold text-lg text-[#0C0D0F]">Body Good</span>
            <span className="font-heading font-extrabold text-lg text-[#ED1B1B]">Studio</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">Score Qualified — Eligibility Check</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 pb-16">
        {/* Hero banner */}
        <div className="bg-[#0C0D0F] rounded-2xl px-7 py-7 mb-7 text-white">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-7 h-7 text-green-400 shrink-0 mt-0.5" />
            <div>
              <h1 className="font-heading font-bold text-xl mb-1.5">Insurance Eligibility Verification</h1>
              <p className="text-sm text-white/70 leading-relaxed">
                Complete all steps and upload your insurance card and ID. After paying the $25 verification fee, our team will check your actual benefits and contact you within 3–5 business days.
              </p>
            </div>
          </div>
        </div>

        <ProgressBar step={step} />

        {/* Step title */}
        <div className="mb-5">
          <h2 className="font-heading font-bold text-xl text-[#0C0D0F] mb-1">{STEPS[step].title}</h2>
          <p className="text-sm text-[#55575A]">{STEPS[step].desc}</p>
        </div>

        {/* Error banner */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-700 font-medium">• {e}</p>
            ))}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-7 mb-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>

          {/* ── STEP 0: Insurance Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <TextInput label="Insurance Provider / Carrier" required value={insuranceProvider} onChange={setInsuranceProvider}
                placeholder="e.g., Blue Cross Blue Shield, Aetna, UnitedHealthcare" />

              <div className="grid grid-cols-2 gap-4">
                <SelectInput label="Plan Type" value={planType} onChange={setPlanType} options={PLAN_TYPES} />
                <SelectInput label="Relationship to Subscriber" value={relationship} onChange={setRelationship} options={RELATIONSHIPS} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Member / Subscriber ID" required value={memberId} onChange={setMemberId}
                  placeholder="Found on your insurance card" />
                <TextInput label="Group Number" value={groupNumber} onChange={setGroupNumber} placeholder="If applicable" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Primary Subscriber Full Name" required value={subscriberName} onChange={setSubscriberName}
                  placeholder="As shown on insurance card" />
                <TextInput label="Subscriber Date of Birth" required value={subscriberDob} onChange={setSubscriberDob} type="date" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>State</FieldLabel>
                  <select value={state} onChange={(e) => setState(e.target.value)} className={`${inputBase} appearance-none cursor-pointer`}>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <SelectInputPairs
                  label="Employer / Plan Type"
                  required
                  value={employerSize}
                  onChange={setEmployerSize}
                  options={EMPLOYER_SIZES}
                  placeholder="Select plan type..."
                />
              </div>

              <div className="pt-2 border-t border-[#E5E5E5]">
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-1">Document Uploads</p>
                <p className="text-xs text-[#55575A] mb-5">Clear, well-lit photos or scans. Accepted: JPG, PNG, PDF. All text must be legible.</p>
                <div className="space-y-5">
                  <FileUploadZone label="Insurance Card — Front" required Icon={CreditCard}
                    sublabel="Must show carrier name, member ID, group number, and plan type"
                    file={cardFront} onFile={setCardFront} />
                  <FileUploadZone label="Insurance Card — Back" required Icon={CreditCard}
                    sublabel="Must show claims address, phone numbers, and Rx BIN/PCN if visible"
                    file={cardBack} onFile={setCardBack} />
                  <FileUploadZone label="Government-Issued Photo ID" required Icon={IdCard}
                    sublabel="Driver's license, state ID, or passport — must match subscriber name"
                    file={photoId} onFile={setPhotoId} />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Medical History ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-1">
                  Qualifying Medical Conditions <span className="text-[#ED1B1B]">*</span>
                </p>
                <p className="text-xs text-[#55575A] mb-3">
                  Select all diagnoses that apply. These conditions strengthen your clinical case and directly affect coverage probability.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {CONDITIONS.map((c) => {
                    const active = conditions.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCondition(c.id)}
                        className={`text-left p-3 rounded-[10px] border transition-all ${
                          active ? "border-[#ED1B1B] bg-[#FDE7E7]" : "border-[#E5E5E5] bg-white hover:border-[#ED1B1B]/40"
                        }`}>
                        <p className={`text-xs font-semibold leading-snug mb-0.5 ${active ? "text-[#ED1B1B]" : "text-[#0C0D0F]"}`}>{c.label}</p>
                        <p className="text-[10px] text-[#55575A]">ICD-10: {c.icd}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-5">
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-4">Biometrics</p>
                <div className="grid grid-cols-3 gap-3">
                  <TextInput label="Height (ft)" required value={heightFt} onChange={setHeightFt} placeholder="5" type="number" />
                  <TextInput label="Height (in)" value={heightIn} onChange={setHeightIn} placeholder="6" type="number" />
                  <TextInput label="Weight (lbs)" required value={weight} onChange={setWeight} placeholder="210" type="number" />
                </div>
                {bmi && (
                  <div className="mt-3 bg-[#FDE7E7] rounded-[10px] px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0C0D0F]">Calculated BMI: {bmi}</span>
                    <span className="text-[10px] text-[#55575A]">
                      {Number(bmi) >= 30 ? "— Obese (strong eligibility)" : Number(bmi) >= 27 ? "— Overweight" : ""}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-5">
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-1">Prior Weight Loss Attempts</p>
                <p className="text-xs text-[#55575A] mb-3">Many insurers require documented prior attempts. Select all that apply.</p>
                <div className="flex flex-col gap-2 mb-4">
                  {PRIOR_ATTEMPTS.map((a) => {
                    const active = priorAttempts.includes(a);
                    return (
                      <button key={a} type="button" onClick={() => toggleAttempt(a)}
                        className={`text-left px-4 py-2.5 rounded-[10px] border text-xs transition-all ${
                          active ? "border-[#ED1B1B] bg-[#FDE7E7] text-[#ED1B1B] font-semibold" : "border-[#E5E5E5] bg-white text-[#0C0D0F] hover:border-[#ED1B1B]/40"
                        }`}>
                        {active && "✓ "}{a}
                      </button>
                    );
                  })}
                </div>
                <SelectInput label="Duration of prior weight management efforts" value={priorDuration}
                  onChange={setPriorDuration} options={DURATIONS} />
              </div>

              <div className="border-t border-[#E5E5E5] pt-5 space-y-4">
                <TextareaInput label="Current Medications"
                  value={currentMeds} onChange={setCurrentMeds}
                  placeholder="List current prescriptions relevant to weight, metabolism, or comorbidities (e.g., Metformin 500mg, Lisinopril 10mg)" />
                <TextareaInput label="Additional Clinical Notes"
                  value={additionalNotes} onChange={setAdditionalNotes}
                  placeholder="Any additional information that may support your case (e.g., lab results, provider notes, failed therapies)" />
              </div>
            </div>
          )}

          {/* ── STEP 2: Medication Preference ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-1">
                  Which GLP-1 medication are you seeking coverage for? <span className="text-[#ED1B1B]">*</span>
                </p>
                <p className="text-xs text-[#55575A] mb-4">
                  This helps our team target the correct formulary and prior authorization pathway.
                </p>
                <div className="flex flex-col gap-3">
                  {MEDICATIONS.map((m) => {
                    const active = preferredMed === m.id;
                    return (
                      <button key={m.id} type="button" onClick={() => setPreferredMed(m.id)}
                        className={`text-left p-4 rounded-[12px] border-2 transition-all ${
                          active ? "border-[#ED1B1B] bg-[#FDE7E7]" : "border-[#E5E5E5] bg-white hover:border-[#ED1B1B]/40"
                        }`}>
                        <p className={`font-heading font-semibold text-sm mb-1 ${active ? "text-[#ED1B1B]" : "text-[#0C0D0F]"}`}>{m.name}</p>
                        <p className="text-xs text-[#55575A] leading-relaxed">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-5">
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-1">
                  Have you previously been prescribed a GLP-1 medication? <span className="text-[#ED1B1B]">*</span>
                </p>
                <div className="flex gap-3 mt-3 mb-4">
                  {["Yes", "No"].map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => { setPrevGlp1(opt); if (opt === "No") setPrevGlp1Detail(""); }}
                      className={`flex-1 py-2.5 rounded-[10px] border-2 text-sm font-semibold font-heading transition-all ${
                        prevGlp1 === opt ? "border-[#ED1B1B] bg-[#FDE7E7] text-[#ED1B1B]" : "border-[#E5E5E5] bg-white text-[#0C0D0F] hover:border-[#ED1B1B]/40"
                      }`}>{opt}</button>
                  ))}
                </div>
                {prevGlp1 === "Yes" && (
                  <TextareaInput
                    label="Please describe (medication name, dose, duration, reason for stopping)"
                    value={prevGlp1Detail} onChange={setPrevGlp1Detail}
                    placeholder="e.g., Was on Ozempic 1mg for 6 months, switched due to insurance change" />
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Acknowledge ── */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-[12px] p-5">
                <p className="font-heading font-semibold text-sm text-[#0C0D0F] mb-3">Submission Summary</p>
                <div className="space-y-1.5 text-xs text-[#55575A] leading-relaxed">
                  <p><strong className="text-[#0C0D0F]">Insurance:</strong> {insuranceProvider}{planType ? ` (${planType})` : ""}</p>
                  <p><strong className="text-[#0C0D0F]">Member ID:</strong> {memberId}</p>
                  <p><strong className="text-[#0C0D0F]">Subscriber:</strong> {subscriberName} · {state}</p>
                  <p><strong className="text-[#0C0D0F]">Conditions:</strong> {conditions.map((id) => CONDITIONS.find((c) => c.id === id)?.label).join(", ") || "—"}</p>
                  <p><strong className="text-[#0C0D0F]">BMI:</strong> {bmi ?? "—"}</p>
                  <p><strong className="text-[#0C0D0F]">Preferred Medication:</strong> {preferredMed === "tirzepatide" ? "Tirzepatide (Zepbound® / Mounjaro®)" : preferredMed === "semaglutide" ? "Semaglutide (Wegovy® / Ozempic®)" : preferredMed === "either" ? "Open to either" : "—"}</p>
                  <p><strong className="text-[#0C0D0F]">Documents:</strong> {[cardFront && "Card Front", cardBack && "Card Back", photoId && "Photo ID"].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-[14px] p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-[#D97706] shrink-0 mt-0.5" />
                  <p className="font-heading font-bold text-base text-[#92400E]">
                    Important Disclaimer — Please Read Carefully
                  </p>
                </div>
                <div className="text-[13px] text-[#78350F] leading-[1.85] space-y-3">
                  <p>By submitting this form, you understand and agree to the following:</p>
                  <p className="font-bold">
                    This submission is a request for coverage confirmation — it is NOT a guarantee of insurance approval or coverage.
                  </p>
                  <p>
                    Insurance coverage decisions are made solely by your insurance carrier. Body Good Studio does not control, influence, or determine your insurer's final decision regarding formulary coverage, prior authorization approval, or claims processing.
                  </p>
                  <p>
                    Our insurance navigation team will use the information you provide to verify your benefits, check formulary status, and — where applicable — submit a prior authorization request with supporting clinical documentation on your behalf. We will advocate for you to the fullest extent possible.
                  </p>
                  <p className="font-bold">
                    However, we cannot and do not guarantee any specific outcome. Coverage determination, prior authorization approval, and claims adjudication are entirely at the discretion of your insurance carrier.
                  </p>
                  <p>
                    The $25 eligibility check fee is non-refundable regardless of the coverage determination outcome. After payment, our team will verify your benefits, check formulary status, and contact you within 3–5 business days with your results. Additional fees for prior authorization ($50) and ongoing insurance management ($75/month) apply only if you choose to proceed with those services.
                  </p>
                </div>
              </div>

              {/* Acknowledge checkbox */}
              <button type="button" onClick={() => setAcknowledged(!acknowledged)}
                className={`w-full text-left flex items-start gap-4 p-5 rounded-[12px] border-2 transition-all ${
                  acknowledged ? "border-green-500 bg-green-50" : "border-[#ED1B1B] bg-white"
                }`}>
                <div className={`w-6 h-6 min-w-[24px] rounded-[6px] border-2 flex items-center justify-center mt-0.5 transition-all ${
                  acknowledged ? "bg-green-500 border-green-500" : "bg-white border-[#ED1B1B]"
                }`}>
                  {acknowledged && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-[#0C0D0F] mb-1">
                    I acknowledge and understand this disclaimer <span className="text-[#ED1B1B]">*</span>
                  </p>
                  <p className="text-xs text-[#55575A] leading-relaxed">
                    I confirm that I have read and understood the above disclaimer in full. I understand that this submission is a request for coverage verification only, that Body Good Studio will advocate on my behalf but does not guarantee any coverage outcome, and that the $25 verification fee is non-refundable.
                  </p>
                </div>
              </button>

              {submitError && (
                <p className="text-xs text-red-600 font-medium text-center">{submitError}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-3">
          {step > 0 ? (
            <button type="button" onClick={back}
              className="px-7 py-3.5 rounded-full border border-[#E5E5E5] bg-white text-sm font-semibold font-heading text-[#55575A] hover:border-gray-400 transition-colors">
              ← Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={next}
              className="px-8 py-3.5 rounded-full bg-[#ED1B1B] text-white font-heading font-bold text-sm hover:bg-[#d41717] transition-colors"
              style={{ boxShadow: "0 4px 14px rgba(237,27,27,0.25)" }}>
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!acknowledged}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-heading font-bold text-sm text-white transition-all ${
                acknowledged
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-[#CCC] cursor-not-allowed"
              }`}
              style={{ boxShadow: acknowledged ? "0 4px 14px rgba(22,163,74,0.3)" : "none" }}>
              <Zap className="w-4 h-4" /> Submit & Pay $25 →
            </button>
          )}
        </div>

        {/* HIPAA footer */}
        <p className="text-center text-[11px] text-[#55575A]/50 mt-7">
          Your information is encrypted and protected under HIPAA guidelines.<br />
          Body Good Studio — Physician-Led Weight Management
        </p>
      </div>
    </div>
  );
}

export default function InsuranceEligibilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#ED1B1B]" /></div>}>
      <EligibilityFormInner />
    </Suspense>
  );
}
