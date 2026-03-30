import { useState, useRef, useEffect } from "react";

const BRAND = {
  red: "#ed1b1b",
  softPink: "#fde7e7",
  heading: "#0C0D0F",
  body: "#55575A",
  border: "#E5E5E5",
  white: "#FFFFFF",
  green: "#16a34a",
  amber: "#d97706",
};

const CONDITIONS = [
  { id: "obesity", label: "Obesity (BMI ≥ 30)", detail: "ICD-10: E66.01" },
  { id: "overweight_comorbid", label: "Overweight with comorbidity (BMI 27–29.9)", detail: "ICD-10: E66.3" },
  { id: "type2_diabetes", label: "Type 2 Diabetes", detail: "ICD-10: E11.x" },
  { id: "prediabetes", label: "Prediabetes / Insulin Resistance", detail: "ICD-10: R73.03" },
  { id: "hypertension", label: "Hypertension (High Blood Pressure)", detail: "ICD-10: I10" },
  { id: "dyslipidemia", label: "Dyslipidemia (High Cholesterol / Triglycerides)", detail: "ICD-10: E78.5" },
  { id: "sleep_apnea", label: "Obstructive Sleep Apnea", detail: "ICD-10: G47.33" },
  { id: "pcos", label: "Polycystic Ovary Syndrome (PCOS)", detail: "ICD-10: E28.2" },
  { id: "nafld", label: "Non-Alcoholic Fatty Liver Disease (NAFLD)", detail: "ICD-10: K76.0" },
  { id: "cardiovascular", label: "Cardiovascular Disease / History of Heart Events", detail: "ICD-10: I25.x" },
  { id: "osteoarthritis", label: "Osteoarthritis (weight-bearing joints)", detail: "ICD-10: M19.x" },
  { id: "family_history", label: "Family history of diabetes or cardiovascular disease", detail: "ICD-10: Z83.3" },
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

function FileUpload({ label, sublabel, icon, file, onFile, required }) {
  const ref = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 4 }}>
        {label} {required && <span style={{ color: BRAND.red }}>*</span>}
      </label>
      {sublabel && <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, margin: "0 0 8px" }}>{sublabel}</p>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${file ? BRAND.green : dragOver ? BRAND.red : BRAND.border}`,
          borderRadius: 12,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: file ? "#f0fdf4" : dragOver ? BRAND.softPink : "#fafafa",
          transition: "all 0.2s ease",
        }}
      >
        <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div style={{ fontSize: 28, marginBottom: 6 }}>{file ? "✓" : icon}</div>
        <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: file ? BRAND.green : BRAND.body, fontWeight: file ? 600 : 400 }}>
          {file ? file.name : "Drag & drop or click to upload"}
        </div>
        {file && (
          <button
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            style={{ marginTop: 8, background: "none", border: "none", color: BRAND.red, fontFamily: "Manrope, sans-serif", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 700,
            background: i <= current ? BRAND.red : "#f3f3f3",
            color: i <= current ? "#fff" : BRAND.body,
            transition: "all 0.3s ease",
            boxShadow: i === current ? `0 0 0 3px ${BRAND.softPink}` : "none",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && <div style={{ width: 36, height: 2, background: i < current ? BRAND.red : "#e5e5e5", borderRadius: 1, transition: "background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

function TextInput({ label, required, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 6 }}>
        {label} {required && <span style={{ color: BRAND.red }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", border: `1.5px solid ${BRAND.border}`, borderRadius: 10,
          fontFamily: "Manrope, sans-serif", fontSize: 15, color: BRAND.heading, outline: "none",
          boxSizing: "border-box", transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = BRAND.red)}
        onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
      />
    </div>
  );
}

function SelectInput({ label, required, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 6 }}>
        {label} {required && <span style={{ color: BRAND.red }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", border: `1.5px solid ${BRAND.border}`, borderRadius: 10,
          fontFamily: "Manrope, sans-serif", fontSize: 15, color: value ? BRAND.heading : "#999", background: "#fff",
          outline: "none", boxSizing: "border-box", cursor: "pointer",
        }}
      >
        <option value="" disabled>Select...</option>
        {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

export default function EligibilityCheckForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState([]);
  const containerRef = useRef();

  // Step 0 — Insurance info
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [planType, setPlanType] = useState("");
  const [memberId, setMemberId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [subscriberDob, setSubscriberDob] = useState("");
  const [relationship, setRelationship] = useState("");
  const [cardFront, setCardFront] = useState(null);
  const [cardBack, setCardBack] = useState(null);
  const [photoId, setPhotoId] = useState(null);

  // Step 1 — Medical
  const [conditions, setConditions] = useState([]);
  const [currentBmi, setCurrentBmi] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [priorAttempts, setPriorAttempts] = useState([]);
  const [priorAttemptDuration, setPriorAttemptDuration] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Step 2 — Medication preference
  const [preferredMed, setPreferredMed] = useState("");
  const [previousGlp1, setPreviousGlp1] = useState("");
  const [previousGlp1Detail, setPreviousGlp1Detail] = useState("");

  // Step 3 — Disclaimer
  const [acknowledged, setAcknowledged] = useState(false);

  const toggleItem = (arr, setter, item) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const validate = () => {
    const e = [];
    if (step === 0) {
      if (!insuranceProvider.trim()) e.push("Insurance provider is required");
      if (!memberId.trim()) e.push("Member / Subscriber ID is required");
      if (!subscriberName.trim()) e.push("Subscriber name is required");
      if (!subscriberDob) e.push("Subscriber date of birth is required");
      if (!cardFront) e.push("Insurance card front image is required");
      if (!cardBack) e.push("Insurance card back image is required");
      if (!photoId) e.push("Government-issued photo ID is required");
    }
    if (step === 1) {
      if (conditions.length === 0) e.push("Please select at least one qualifying medical condition");
      if (!weight.trim()) e.push("Current weight is required");
      if (!heightFt.trim()) e.push("Height is required");
    }
    if (step === 2) {
      if (!preferredMed) e.push("Please select a preferred medication");
      if (!previousGlp1) e.push("Please indicate prior GLP-1 experience");
    }
    if (step === 3) {
      if (!acknowledged) e.push("You must acknowledge the disclaimer to submit");
    }
    setErrors(e);
    return e.length === 0;
  };

  const next = () => {
    if (validate()) {
      setStep((s) => s + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const back = () => { setStep((s) => s - 1); setErrors([]); containerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = () => {
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${BRAND.softPink} 0%, #fff 60%)`, fontFamily: "Manrope, sans-serif", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 520, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✓</div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 24, color: BRAND.heading, margin: "0 0 12px" }}>Submission Received</h2>
          <p style={{ color: BRAND.body, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>
            Thank you for submitting your insurance eligibility documents. Our team will review your information and work diligently to determine your coverage options.
          </p>
          <div style={{ background: BRAND.softPink, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, margin: "0 0 6px" }}>What happens next?</p>
            <p style={{ color: BRAND.body, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Our insurance navigation team will verify your benefits, check formulary status, and if needed, prepare a prior authorization on your behalf. Expect to hear from us within 3–5 business days.
            </p>
          </div>
          <p style={{ color: BRAND.body, fontSize: 13, fontStyle: "italic", margin: 0 }}>
            A confirmation email has been sent to you with your submission reference number.
          </p>
        </div>
      </div>
    );
  }

  const STEPS = [
    { title: "Insurance Information", desc: "Upload your insurance card and provide plan details" },
    { title: "Medical History", desc: "Qualifying conditions that support coverage" },
    { title: "Medication Preference", desc: "Which GLP-1 medication are you seeking coverage for?" },
    { title: "Review & Acknowledge", desc: "Important disclaimer before submission" },
  ];

  return (
    <div ref={containerRef} style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${BRAND.softPink} 0%, #fff 40%, #fff 100%)`, fontFamily: "Manrope, sans-serif", overflowY: "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BRAND.border}`, padding: "16px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 18, color: BRAND.heading }}>Body Good</span>
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 18, color: BRAND.red }}>Studio</span>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 50, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green }} />
            <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 600, color: BRAND.green }}>Score: 75%+ — Eligible</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Banner */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.heading} 0%, #2a2b2f 100%)`, borderRadius: 16, padding: "28px 28px", marginBottom: 28, color: "#fff" }}>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 22, margin: "0 0 8px", lineHeight: 1.3 }}>Insurance Eligibility Verification</h1>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0, lineHeight: 1.6 }}>
            Your coverage probability score qualifies you for a full eligibility check. Please complete all steps below so our team can determine your insurance coverage for GLP-1 medications.
          </p>
        </div>

        <StepIndicator current={step} total={4} />

        {/* Step title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 20, color: BRAND.heading, margin: "0 0 4px" }}>{STEPS[step].title}</h2>
          <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: BRAND.body, margin: 0 }}>{STEPS[step].desc}</p>
        </div>

        {/* Error display */}
        {errors.length > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            {errors.map((e, i) => (
              <div key={i} style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: "#b91c1c", marginBottom: i < errors.length - 1 ? 4 : 0 }}>• {e}</div>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: `1px solid ${BRAND.border}` }}>

          {/* STEP 0 — Insurance */}
          {step === 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <TextInput label="Insurance Provider / Carrier" required value={insuranceProvider} onChange={setInsuranceProvider} placeholder="e.g., Blue Cross Blue Shield, Aetna, UnitedHealthcare" />
                </div>
                <SelectInput label="Plan Type" value={planType} onChange={setPlanType} options={[
                  "PPO", "HMO", "EPO", "POS", "HDHP / HSA", "Medicaid / MCO", "Medicare", "Other / Not Sure"
                ]} />
                <SelectInput label="Relationship to Subscriber" required value={relationship} onChange={setRelationship} options={["Self", "Spouse", "Dependent Child", "Other"]} />
                <TextInput label="Member / Subscriber ID" required value={memberId} onChange={setMemberId} placeholder="Found on your insurance card" />
                <TextInput label="Group Number" value={groupNumber} onChange={setGroupNumber} placeholder="If applicable" />
                <TextInput label="Primary Subscriber Full Name" required value={subscriberName} onChange={setSubscriberName} placeholder="As shown on insurance card" />
                <TextInput label="Subscriber Date of Birth" required value={subscriberDob} onChange={setSubscriberDob} type="date" />
              </div>

              <div style={{ height: 1, background: BRAND.border, margin: "24px 0" }} />
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, marginBottom: 4 }}>Document Uploads</p>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, marginBottom: 16 }}>
                Clear, well-lit photos or scans. Accepted formats: JPG, PNG, PDF. All text must be legible.
              </p>

              <FileUpload label="Insurance Card — Front" required icon="🪪" file={cardFront} onFile={setCardFront} sublabel="Must show carrier name, member ID, group number, and plan type" />
              <FileUpload label="Insurance Card — Back" required icon="🔄" file={cardBack} onFile={setCardBack} sublabel="Must show claims address, phone numbers, and Rx BIN/PCN if visible" />
              <FileUpload label="Government-Issued Photo ID" required icon="🆔" file={photoId} onFile={setPhotoId} sublabel="Driver's license, state ID, or passport — must match subscriber name" />
            </>
          )}

          {/* STEP 1 — Medical */}
          {step === 1 && (
            <>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, margin: "0 0 4px" }}>
                Qualifying Medical Conditions <span style={{ color: BRAND.red }}>*</span>
              </p>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, margin: "0 0 16px" }}>
                Select all diagnoses that apply. These conditions strengthen your clinical case for GLP-1 medication coverage.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {CONDITIONS.map((c) => {
                  const active = conditions.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleItem(conditions, setConditions, c.id)}
                      style={{
                        border: `1.5px solid ${active ? BRAND.red : BRAND.border}`,
                        background: active ? BRAND.softPink : "#fff",
                        borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 600, color: BRAND.heading, marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, color: BRAND.body }}>{c.detail}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: BRAND.border, margin: "20px 0" }} />
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, margin: "0 0 14px" }}>Biometrics</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <TextInput label="Height (ft)" required value={heightFt} onChange={setHeightFt} placeholder="5" type="number" />
                <TextInput label="Height (in)" value={heightIn} onChange={setHeightIn} placeholder="6" type="number" />
                <TextInput label="Weight (lbs)" required value={weight} onChange={setWeight} placeholder="210" type="number" />
              </div>
              {heightFt && weight && (
                <div style={{ background: BRAND.softPink, borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
                  <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.heading, fontWeight: 600 }}>
                    Calculated BMI: {(703 * Number(weight) / Math.pow(Number(heightFt) * 12 + Number(heightIn || 0), 2)).toFixed(1)}
                  </span>
                </div>
              )}

              <div style={{ height: 1, background: BRAND.border, margin: "20px 0" }} />
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, margin: "0 0 4px" }}>Prior Weight Loss Attempts</p>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, margin: "0 0 14px" }}>
                Many insurers require documented prior attempts. Select all that apply.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {PRIOR_ATTEMPTS.map((a) => {
                  const active = priorAttempts.includes(a);
                  return (
                    <div
                      key={a}
                      onClick={() => toggleItem(priorAttempts, setPriorAttempts, a)}
                      style={{
                        border: `1.5px solid ${active ? BRAND.red : BRAND.border}`,
                        background: active ? BRAND.softPink : "#fff",
                        borderRadius: 10, padding: "10px 14px", cursor: "pointer",
                        fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: active ? 600 : 400, color: BRAND.heading,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {active ? "✓ " : ""}{a}
                    </div>
                  );
                })}
              </div>
              <SelectInput label="Duration of prior weight management efforts" value={priorAttemptDuration} onChange={setPriorAttemptDuration} options={[
                "Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "2+ years", "Not applicable"
              ]} />

              <div style={{ height: 1, background: BRAND.border, margin: "20px 0" }} />
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 6 }}>Current Medications</label>
                <textarea
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="List current prescriptions relevant to weight, metabolism, or comorbidities (e.g., Metformin 500mg, Lisinopril 10mg)"
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${BRAND.border}`, borderRadius: 10, fontFamily: "Manrope, sans-serif", fontSize: 14, color: BRAND.heading, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 6 }}>Additional Clinical Notes</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information that may support your case (e.g., lab results, provider notes, failed therapies)"
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${BRAND.border}`, borderRadius: 10, fontFamily: "Manrope, sans-serif", fontSize: 14, color: BRAND.heading, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
            </>
          )}

          {/* STEP 2 — Medication */}
          {step === 2 && (
            <>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, margin: "0 0 4px" }}>
                Which GLP-1 medication are you seeking coverage for? <span style={{ color: BRAND.red }}>*</span>
              </p>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, margin: "0 0 16px" }}>
                This helps our team target the correct formulary and prior authorization pathway.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { id: "tirzepatide", name: "Tirzepatide (Zepbound® / Mounjaro®)", desc: "GLP-1/GIP dual agonist — typically covered under obesity or T2D indications" },
                  { id: "semaglutide", name: "Semaglutide (Wegovy® / Ozempic®)", desc: "GLP-1 agonist — Wegovy for obesity, Ozempic for T2D" },
                  { id: "either", name: "Open to either — recommend best coverage path", desc: "Our team will check formulary status for both and recommend the option most likely to be covered" },
                ].map((m) => {
                  const active = preferredMed === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPreferredMed(m.id)}
                      style={{
                        border: `2px solid ${active ? BRAND.red : BRAND.border}`,
                        background: active ? BRAND.softPink : "#fff",
                        borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600, color: BRAND.heading, marginBottom: 4 }}>{m.name}</div>
                      <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body }}>{m.desc}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: BRAND.border, margin: "20px 0" }} />
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: BRAND.heading, margin: "0 0 4px" }}>
                Have you previously been prescribed a GLP-1 medication? <span style={{ color: BRAND.red }}>*</span>
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 18 }}>
                {["Yes", "No"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setPreviousGlp1(opt); if (opt === "No") setPreviousGlp1Detail(""); }}
                    style={{
                      flex: 1, textAlign: "center", padding: "12px 16px",
                      border: `2px solid ${previousGlp1 === opt ? BRAND.red : BRAND.border}`,
                      background: previousGlp1 === opt ? BRAND.softPink : "#fff",
                      borderRadius: 10, cursor: "pointer",
                      fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 600, color: BRAND.heading,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              {previousGlp1 === "Yes" && (
                <div>
                  <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, marginBottom: 6 }}>
                    Please describe (medication name, dose, duration, reason for stopping)
                  </label>
                  <textarea
                    value={previousGlp1Detail}
                    onChange={(e) => setPreviousGlp1Detail(e.target.value)}
                    placeholder="e.g., Was on Ozempic 1mg for 6 months, switched due to insurance change"
                    rows={3}
                    style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${BRAND.border}`, borderRadius: 10, fontFamily: "Manrope, sans-serif", fontSize: 14, color: BRAND.heading, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </>
          )}

          {/* STEP 3 — Disclaimer */}
          {step === 3 && (
            <>
              {/* Summary preview */}
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: "18px 20px", marginBottom: 24, border: `1px solid ${BRAND.border}` }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: BRAND.heading, margin: "0 0 10px" }}>Submission Summary</p>
                <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, lineHeight: 1.8 }}>
                  <div><strong>Insurance:</strong> {insuranceProvider} {planType && `(${planType})`}</div>
                  <div><strong>Member ID:</strong> {memberId}</div>
                  <div><strong>Subscriber:</strong> {subscriberName}</div>
                  <div><strong>Conditions:</strong> {conditions.map((id) => CONDITIONS.find((c) => c.id === id)?.label).join(", ") || "—"}</div>
                  <div><strong>BMI:</strong> {heightFt && weight ? (703 * Number(weight) / Math.pow(Number(heightFt) * 12 + Number(heightIn || 0), 2)).toFixed(1) : "—"}</div>
                  <div><strong>Preferred Medication:</strong> {preferredMed === "tirzepatide" ? "Tirzepatide" : preferredMed === "semaglutide" ? "Semaglutide" : "Open to either"}</div>
                  <div><strong>Documents:</strong> {[cardFront && "Card Front", cardBack && "Card Back", photoId && "Photo ID"].filter(Boolean).join(", ")}</div>
                </div>
              </div>

              {/* DISCLAIMER BOX */}
              <div style={{
                background: "#fffbeb",
                border: "2px solid #f59e0b",
                borderRadius: 14,
                padding: "24px 22px",
                marginBottom: 24,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 24, lineHeight: 1 }}>⚠️</div>
                  <div>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, color: "#92400e", margin: "0 0 6px" }}>
                      Important Disclaimer — Please Read Carefully
                    </p>
                  </div>
                </div>

                <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: "#78350f", lineHeight: 1.8 }}>
                  <p style={{ margin: "0 0 12px" }}>
                    By submitting this form, you understand and agree to the following:
                  </p>
                  <p style={{ margin: "0 0 10px", fontWeight: 700 }}>
                    This submission is a request for coverage confirmation — it is NOT a guarantee of insurance approval or coverage.
                  </p>
                  <p style={{ margin: "0 0 10px" }}>
                    Insurance coverage decisions are made solely by your insurance carrier. Body Good Studio does not control, influence, or determine your insurer's final decision regarding formulary coverage, prior authorization approval, or claims processing.
                  </p>
                  <p style={{ margin: "0 0 10px" }}>
                    Our insurance navigation team will use the information you provide to verify your benefits, check formulary status, and — where applicable — submit a prior authorization request with supporting clinical documentation on your behalf. We will advocate for you to the fullest extent possible.
                  </p>
                  <p style={{ margin: "0 0 10px", fontWeight: 700 }}>
                    However, we cannot and do not guarantee any specific outcome. Coverage determination, prior authorization approval, and claims adjudication are entirely at the discretion of your insurance carrier.
                  </p>
                  <p style={{ margin: "0 0 10px" }}>
                    If your insurance carrier denies coverage, our team will communicate the denial reason and discuss your alternative options, which may include appeals, alternative medications, or our self-pay compounded medication programs.
                  </p>
                  <p style={{ margin: "0 0 0" }}>
                    The $25 eligibility check fee is non-refundable regardless of the coverage determination outcome. Additional fees for prior authorization ($50) and ongoing insurance management ($75/month) apply only if you choose to proceed with those services.
                  </p>
                </div>
              </div>

              {/* Acknowledgment checkbox */}
              <div
                onClick={() => setAcknowledged(!acknowledged)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer",
                  background: acknowledged ? "#f0fdf4" : "#fff",
                  border: `2px solid ${acknowledged ? BRAND.green : BRAND.red}`,
                  borderRadius: 12, padding: "18px 20px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  width: 24, height: 24, minWidth: 24, borderRadius: 6,
                  border: `2px solid ${acknowledged ? BRAND.green : BRAND.red}`,
                  background: acknowledged ? BRAND.green : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2, transition: "all 0.2s ease",
                }}>
                  {acknowledged && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: BRAND.heading, margin: "0 0 4px" }}>
                    I acknowledge and understand this disclaimer <span style={{ color: BRAND.red }}>*</span>
                  </p>
                  <p style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: BRAND.body, margin: 0, lineHeight: 1.6 }}>
                    I confirm that I have read and understood the above disclaimer in full. I understand that this submission is a request for coverage verification only, that Body Good Studio will advocate on my behalf but does not guarantee any coverage outcome, and that the final determination rests entirely with my insurance carrier.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12 }}>
          {step > 0 ? (
            <button
              onClick={back}
              style={{
                padding: "14px 28px", borderRadius: 50, border: `1.5px solid ${BRAND.border}`,
                background: "#fff", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14,
                color: BRAND.body, cursor: "pointer", transition: "all 0.2s",
              }}
            >
              ← Back
            </button>
          ) : <div />}
          <button
            onClick={step === 3 ? handleSubmit : next}
            style={{
              padding: "14px 32px", borderRadius: 50, border: "none",
              background: step === 3 ? (acknowledged ? BRAND.green : "#ccc") : BRAND.red,
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
              color: "#fff", cursor: step === 3 && !acknowledged ? "not-allowed" : "pointer",
              transition: "all 0.2s", boxShadow: `0 4px 14px ${step === 3 ? (acknowledged ? "rgba(22,163,74,0.3)" : "transparent") : "rgba(237,27,27,0.25)"}`,
            }}
          >
            {step === 3 ? "Submit Eligibility Check →" : "Continue →"}
          </button>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 28, fontFamily: "Manrope, sans-serif", fontSize: 12, color: "#aaa" }}>
          Your information is encrypted and protected under HIPAA guidelines.
          <br />Body Good Studio — Physician-Led Weight Management
        </div>
      </div>
    </div>
  );
}
