"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pill,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const CONDITIONS = [
  "Type 2 Diabetes",
  "High Blood Pressure",
  "High Cholesterol",
  "PCOS",
  "GERD / Acid Reflux",
  "Hypothyroidism",
  "Fatty Liver Disease",
  "None of the above",
];

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-[11px] font-semibold font-heading text-heading mb-1">
      {children}
      {required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors ${
        readOnly ? "bg-surface-dim text-body-muted" : ""
      }`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
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

function YesNoToggle({
  value,
  onChange,
  warnAlert,
  stopAlert,
}: {
  value: string;
  onChange: (v: string) => void;
  warnAlert?: React.ReactNode;
  stopAlert?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => onChange("y")}
          className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${
            value === "y"
              ? "bg-red-50 border-red-600 text-red-600"
              : "bg-white border-border text-body hover:border-gray-400"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange("n")}
          className={`flex-1 py-2 text-center text-xs font-semibold font-heading border rounded-lg transition-all ${
            value === "n"
              ? "bg-green-50 border-green-700 text-green-700"
              : "bg-white border-border text-body hover:border-gray-400"
          }`}
        >
          No
        </button>
      </div>
      {stopAlert && value === "y" && <StopAlert>{stopAlert}</StopAlert>}
      {warnAlert && value === "y" && <WarnAlert>{warnAlert}</WarnAlert>}
    </>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["About You", "Medical", "Oral Screen", "Consent"];
  return (
    <div className="mb-7">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-brand-red rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <span
              key={n}
              className={`text-[10px] font-semibold font-heading uppercase tracking-wide flex items-center gap-1.5 transition-colors ${
                done ? "text-success" : active ? "text-brand-red" : "text-body-muted"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                  done
                    ? "bg-success border-success text-white"
                    : active
                    ? "bg-brand-red border-brand-red text-white"
                    : "bg-white border-border text-body-muted"
                }`}
              >
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
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "#FBF7F4" }}
    >
      <div className="text-center py-12 max-w-sm">
        <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-success" />
        </div>
        <h2 className="font-heading text-heading text-2xl font-bold mb-3">
          Intake Complete!
        </h2>
        <p className="text-body-muted text-sm leading-relaxed mb-8">
          Your Glow Rx intake is submitted. Our team will begin your evaluation
          within 24–48 hours.
        </p>
        <a
          href="/programs"
          className="inline-flex items-center justify-center font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
          style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
        >
          Return to Programs →
        </a>
      </div>
    </div>
  );
}

function GLP1OralForm() {
  const params = useSearchParams();
  const med = params.get("med") || "sema";

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
    priorGlp1: "", priorGlp1Detail: "",
    conditions: [] as string[],
    weightGoal: "",
  });

  const [s3, setS3] = useState({
    mtcHistory: "", men2: "",
    pancreatitis: "", pregnant: "",
    kidneyDisease: "",
    ibd: "", gastroparesis: "",
    swallowingDifficulty: "", acidReducers: "",
    otherConcerns: "",
  });

  const [s4, setS4] = useState({
    c1: false, c2: false, c3: false, signature: "",
  });

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function u1(key: keyof typeof s1, val: string) {
    setS1((p) => ({ ...p, [key]: val }));
  }
  function u2(key: keyof typeof s2, val: string) {
    setS2((p) => ({ ...p, [key]: val }));
  }
  function u3(key: keyof typeof s3, val: string) {
    setS3((p) => ({ ...p, [key]: val }));
  }

  function toggleCondition(cond: string) {
    setS2((prev) => {
      if (cond === "None of the above") {
        return {
          ...prev,
          conditions: prev.conditions.includes(cond) ? [] : [cond],
        };
      }
      const without = prev.conditions.filter((c) => c !== "None of the above");
      return {
        ...prev,
        conditions: without.includes(cond)
          ? without.filter((c) => c !== cond)
          : [...without, cond],
      };
    });
  }

  function goTo(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!s4.c1 || !s4.c2 || !s4.c3) {
      setSubmitError("Please agree to all consent items.");
      return;
    }
    if (!s4.signature.trim()) {
      setSubmitError("Please enter your full legal name as your signature.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "glp1-oral",
          med,
          personal: s1,
          medicalHistory: { ...s2 },
          screening: { ...s3 },
          consent: {
            telehealth: s4.c1,
            accuracy: s4.c2,
            glp1AndOralAck: s4.c3,
            signature: s4.signature,
            signedAt: new Date().toISOString(),
          },
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

  const inputBase =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-heading bg-white focus:outline-none focus:border-brand-red transition-colors";

  const productName =
    med === "tirz" ? "Glow Rx — Oral Tirzepatide" : "Glow Rx — Oral Semaglutide";

  return (
    <div className="min-h-screen" style={{ background: "#FBF7F4" }}>
      <div className="text-center py-7 px-5 max-w-xl mx-auto">
        <div className="w-12 h-12 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <h1 className="font-heading text-heading text-2xl font-bold mb-1.5">
          Order confirmed.{" "}
          <span className="text-brand-red">One more step.</span>
        </h1>
        <p className="text-body-muted text-sm leading-relaxed">
          Complete your medical intake so we can start your Glow Rx evaluation.
        </p>
      </div>

      <div
        className="flex items-center gap-3 max-w-xl mx-auto px-5 mb-5 bg-white border border-border rounded-card p-4"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#FFF8EB" }}
        >
          <Pill className="w-5 h-5" style={{ color: "#C4912A" }} />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-heading">
            {productName}
          </p>
          <p className="text-xs text-body-muted mt-0.5">
            Self-Pay · Oral Compounded Medication · Shipped to You
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <ProgressBar step={step} />

        {step === 1 && (
          <div>
            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Personal Information
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                Required for your medical evaluation and prescription.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <TextInput value={s1.firstName} onChange={(v) => u1("firstName", v)} placeholder="First name" />
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <TextInput value={s1.lastName} onChange={(v) => u1("lastName", v)} placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <TextInput type="email" value={s1.email} onChange={(v) => u1("email", v)} placeholder="you@email.com" />
                </div>
                <div>
                  <FieldLabel required>Phone</FieldLabel>
                  <TextInput type="tel" value={s1.phone} onChange={(v) => u1("phone", v)} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <TextInput type="date" value={s1.dob} onChange={(v) => u1("dob", v)} />
                </div>
                <div>
                  <FieldLabel required>Sex at Birth</FieldLabel>
                  <SelectInput value={s1.sex} onChange={(v) => u1("sex", v)}>
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel required>State</FieldLabel>
                  <SelectInput value={s1.state} onChange={(v) => u1("state", v)}>
                    <option value="">Select</option>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </SelectInput>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel required>Height (ft)</FieldLabel>
                  <SelectInput value={s1.heightFt} onChange={(v) => u1("heightFt", v)}>
                    <option value="">Feet</option>
                    {[4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel required>Height (in)</FieldLabel>
                  <SelectInput value={s1.heightIn} onChange={(v) => u1("heightIn", v)}>
                    <option value="">In</option>
                    {Array.from({ length: 12 }, (_, i) => i).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel required>Weight (lbs)</FieldLabel>
                  <TextInput type="number" value={s1.weight} onChange={(v) => u1("weight", v)} placeholder="lbs" />
                </div>
              </div>
            </div>

            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Shipping Address
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                Where should we ship your Glow Rx?
              </p>
              <div className="mb-3">
                <FieldLabel required>Street Address</FieldLabel>
                <TextInput value={s1.streetAddress} onChange={(v) => u1("streetAddress", v)} placeholder="123 Main St, Apt 4B" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel required>City</FieldLabel>
                  <TextInput value={s1.city} onChange={(v) => u1("city", v)} placeholder="City" />
                </div>
                <div>
                  <FieldLabel required>State</FieldLabel>
                  <SelectInput value={s1.shipState} onChange={(v) => u1("shipState", v)}>
                    <option value="">Select</option>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel required>ZIP</FieldLabel>
                  <TextInput value={s1.zip} onChange={(v) => u1("zip", v)} placeholder="ZIP" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => goTo(2)}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Medical History
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                Answer honestly — this directly impacts prescribing decisions.
              </p>

              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Known <strong>drug allergies</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s2.hasAllergies}
                    onChange={(v) => u2("hasAllergies", v)}
                  />
                  {s2.hasAllergies === "y" && (
                    <textarea
                      value={s2.allergiesDetail}
                      onChange={(e) => u2("allergiesDetail", e.target.value)}
                      placeholder="List allergies and reactions..."
                      className={`mt-2 ${inputBase} resize-y min-h-[60px]`}
                    />
                  )}
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Currently taking any <strong>medications</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s2.hasMeds}
                    onChange={(v) => u2("hasMeds", v)}
                  />
                  {s2.hasMeds === "y" && (
                    <textarea
                      value={s2.medsDetail}
                      onChange={(e) => u2("medsDetail", e.target.value)}
                      placeholder="List all medications, doses, frequency..."
                      className={`mt-2 ${inputBase} resize-y min-h-[60px]`}
                    />
                  )}
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Previously taken a <strong>GLP-1 medication</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s2.priorGlp1}
                    onChange={(v) => u2("priorGlp1", v)}
                  />
                  {s2.priorGlp1 === "y" && (
                    <textarea
                      value={s2.priorGlp1Detail}
                      onChange={(e) => u2("priorGlp1Detail", e.target.value)}
                      placeholder="Which, dose, duration, reason stopped..."
                      className={`mt-2 ${inputBase} resize-y min-h-[60px]`}
                    />
                  )}
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug mb-2">
                    Existing conditions:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCondition(c)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs text-left transition-all ${
                          s2.conditions.includes(c)
                            ? "bg-brand-pink border-brand-red text-brand-red font-semibold"
                            : "bg-white border-border text-heading hover:border-gray-400"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 text-[9px] font-bold transition-all ${
                            s2.conditions.includes(c)
                              ? "bg-brand-red border-brand-red text-white"
                              : "border-border"
                          }`}
                        >
                          {s2.conditions.includes(c) ? "✓" : ""}
                        </span>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug mb-2">
                    Primary <strong>weight loss goal</strong>:
                  </p>
                  <TextInput
                    value={s2.weightGoal}
                    onChange={(v) => u2("weightGoal", v)}
                    placeholder="e.g. Lose 30 lbs, manage PCOS, reduce A1C..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => goTo(1)}
                className="font-heading font-bold text-sm text-body border border-border px-6 py-3 rounded-pill hover:border-gray-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => goTo(3)}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Oral GLP-1 Safety Screening
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                These questions address both GLP-1 contraindications and
                oral-specific absorption concerns.
              </p>

              <div className="divide-y divide-gray-100">
                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Personal or family history of{" "}
                    <strong>medullary thyroid carcinoma (MTC)</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.mtcHistory}
                    onChange={(v) => u3("mtcHistory", v)}
                    stopAlert={
                      <>
                        <strong>Prescribing Alert:</strong> MTC history is an
                        absolute contraindication to GLP-1 therapy.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Diagnosed with <strong>MEN2</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.men2}
                    onChange={(v) => u3("men2", v)}
                    stopAlert={
                      <>
                        <strong>Prescribing Alert:</strong> MEN2 is an absolute
                        contraindication.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    History of <strong>pancreatitis</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.pancreatitis}
                    onChange={(v) => u3("pancreatitis", v)}
                    warnAlert={
                      <>
                        <strong>Flagged:</strong> Requires additional
                        evaluation. You may still qualify.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Currently{" "}
                    <strong>
                      pregnant, breastfeeding, or planning pregnancy
                    </strong>{" "}
                    within 2 months?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.pregnant}
                    onChange={(v) => u3("pregnant", v)}
                    stopAlert={
                      <>
                        <strong>Contraindicated</strong> during pregnancy and
                        breastfeeding.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    <strong>Severe kidney disease</strong> (eGFR &lt; 30)?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.kidneyDisease}
                    onChange={(v) => u3("kidneyDisease", v)}
                    warnAlert={
                      <>
                        <strong>Flagged:</strong> Additional labs may be needed.
                      </>
                    }
                  />
                </div>

                <div className="pt-4 pb-2">
                  <div
                    className="rounded-lg px-4 py-3 mb-1"
                    style={{ background: "#FFF8EB", border: "2px solid #FFF8EB" }}
                  >
                    <p
                      className="font-heading font-bold text-xs mb-0.5"
                      style={{ color: "#C4912A" }}
                    >
                      Oral-Specific Questions
                    </p>
                    <p className="text-[11px] text-body-muted">
                      These help determine if oral GLP-1 is the right
                      formulation for you.
                    </p>
                  </div>
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Do you have{" "}
                    <strong>
                      Crohn&apos;s disease, ulcerative colitis, or history of
                      bowel obstruction
                    </strong>
                    ? <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.ibd}
                    onChange={(v) => u3("ibd", v)}
                    warnAlert={
                      <>
                        <strong>Flagged:</strong> Inflammatory bowel conditions
                        may affect oral medication absorption. Provider may
                        recommend injectable instead.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Do you have <strong>gastroparesis</strong> or severely
                    delayed gastric emptying?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.gastroparesis}
                    onChange={(v) => u3("gastroparesis", v)}
                    warnAlert={
                      <>
                        <strong>Flagged:</strong> GLP-1 further slows gastric
                        emptying and oral absorption may be unreliable. Provider
                        will evaluate.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Do you have difficulty{" "}
                    <strong>swallowing tablets or capsules</strong>?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.swallowingDifficulty}
                    onChange={(v) => u3("swallowingDifficulty", v)}
                    warnAlert={
                      <>
                        <strong>Note:</strong> Provider may recommend injectable
                        formulation as an alternative.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug">
                    Do you take{" "}
                    <strong>
                      acid-reducing medications
                    </strong>{" "}
                    (omeprazole, pantoprazole, famotidine, antacids)?{" "}
                    <span className="text-brand-red">*</span>
                  </p>
                  <YesNoToggle
                    value={s3.acidReducers}
                    onChange={(v) => u3("acidReducers", v)}
                    warnAlert={
                      <>
                        <strong>Flagged:</strong> PPIs and antacids can alter
                        oral GLP-1 absorption. Provider will advise on timing.
                      </>
                    }
                  />
                </div>

                <div className="py-3">
                  <p className="text-sm text-heading font-medium leading-snug mb-2">
                    Anything else your provider should know?
                  </p>
                  <textarea
                    value={s3.otherConcerns}
                    onChange={(e) => u3("otherConcerns", e.target.value)}
                    placeholder="Optional — surgeries, hospitalizations, other concerns..."
                    className={`${inputBase} resize-y min-h-[60px]`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => goTo(2)}
                className="font-heading font-bold text-sm text-body border border-border px-6 py-3 rounded-pill hover:border-gray-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => goTo(4)}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Informed Consent
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                Review and agree before your evaluation begins.
              </p>

              <div className="bg-surface-dim border border-border rounded-lg p-4 text-[11.5px] text-body leading-relaxed mb-4 max-h-44 overflow-y-auto">
                <strong>Telehealth Consent:</strong> I consent to telehealth
                evaluation by a licensed physician/PA at Body Good Studio.
                <br />
                <br />
                <strong>Prescription Acknowledgment:</strong> Prescribing is at
                the provider&apos;s sole discretion. I will use medications only
                as directed.
                <br />
                <br />
                <strong>GLP-1 Boxed Warning:</strong> I understand GLP-1
                agonists carry a warning about thyroid C-cell tumors in rodent
                studies.
                <br />
                <br />
                <strong>Oral Medication Notice:</strong> I understand oral GLP-1
                must be taken on an empty stomach with minimal water, at least
                30 minutes before food or other medications, for proper
                absorption.
                <br />
                <br />
                <strong>Accuracy:</strong> All information I provided is
                accurate and complete.
                <br />
                <br />
                <strong>HIPAA:</strong> Body Good Studio maintains privacy per
                HIPAA.
                <br />
                <br />
                <strong>Billing:</strong> I understand my subscription terms.
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-xs text-heading mt-3 select-none">
                <input
                  type="checkbox"
                  checked={s4.c1}
                  onChange={(e) => setS4((p) => ({ ...p, c1: e.target.checked }))}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-brand-red"
                />
                <span>
                  I agree to <strong>Telehealth Consent</strong> and{" "}
                  <strong>HIPAA Notice</strong>.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs text-heading mt-3 select-none">
                <input
                  type="checkbox"
                  checked={s4.c2}
                  onChange={(e) => setS4((p) => ({ ...p, c2: e.target.checked }))}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-brand-red"
                />
                <span>
                  I certify all information is{" "}
                  <strong>accurate and complete</strong>.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs text-heading mt-3 select-none">
                <input
                  type="checkbox"
                  checked={s4.c3}
                  onChange={(e) => setS4((p) => ({ ...p, c3: e.target.checked }))}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-brand-red"
                />
                <span>
                  I acknowledge the <strong>GLP-1 boxed warning</strong> and{" "}
                  <strong>oral medication instructions</strong>.
                </span>
              </label>
            </div>

            <div
              className="bg-white border border-border rounded-card p-6 mb-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="font-heading font-bold text-sm text-heading mb-0.5">
                Electronic Signature
              </h3>
              <p className="text-xs text-body-muted mb-4 leading-relaxed">
                Type your full legal name to sign.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Full Legal Name</FieldLabel>
                  <TextInput
                    value={s4.signature}
                    onChange={(v) => setS4((p) => ({ ...p, signature: v }))}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <TextInput value={today} readOnly />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-50 text-xs text-red-700 flex gap-2">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => goTo(3)}
                className="font-heading font-bold text-sm text-body border border-border px-6 py-3 rounded-pill hover:border-gray-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="font-heading font-bold text-sm bg-brand-red text-white px-8 py-3 rounded-pill hover:bg-brand-red-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ boxShadow: "0 4px 12px rgba(237,27,27,0.2)" }}
              >
                {submitting ? "Submitting..." : "Submit Intake →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GLP1OralIntakePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#FBF7F4" }}
        >
          <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GLP1OralForm />
    </Suspense>
  );
}
