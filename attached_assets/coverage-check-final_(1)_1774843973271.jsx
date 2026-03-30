import { useState, useEffect, useRef } from "react";

const BRAND = { red: "#ED3D43", pink: "#F088AD", black: "#1A1A1A", white: "#FFFFFF", light: "#F8F7F5", mid: "#E8E6E2", gray: "#6B6B6B" };

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const INSURERS = [
  "Aetna","Ambetter","Anthem Blue Cross Blue Shield","AvMed",
  "Blue Cross Blue Shield of Florida (Florida Blue)","Blue Cross Blue Shield of Georgia",
  "Blue Cross Blue Shield of Illinois","Blue Cross Blue Shield of Massachusetts",
  "Blue Cross Blue Shield of Michigan","Blue Cross Blue Shield of New York (Excellus)",
  "Blue Cross Blue Shield of North Carolina","Blue Cross Blue Shield of Pennsylvania (Highmark)",
  "Blue Cross Blue Shield of South Carolina","Blue Cross Blue Shield of Tennessee",
  "Blue Cross Blue Shield of Texas","Blue Shield of California",
  "CareFirst BlueCross BlueShield","Centene / WellCare","Cigna","CareSource",
  "Devoted Health","EmblemHealth","Empire Blue Cross Blue Shield",
  "Geisinger Health Plan","Golden Rule Insurance (UnitedHealthcare)",
  "HAP (Health Alliance Plan)","Health Net","HealthFirst","HealthPartners",
  "Horizon Blue Cross Blue Shield of New Jersey","Humana","Independence Blue Cross",
  "Kaiser Permanente","Medicaid — Florida","Medicaid — New York","Medicaid — Illinois",
  "Medicaid — California (Medi-Cal)","Medicaid — Other State",
  "Medicare Part D","Medicare Advantage","Medigap / Medicare Supplement",
  "Meritain Health","Molina Healthcare","MVP Health Care","Oscar Health","Oxford Health Plans",
  "Point32Health (Harvard Pilgrim / Tufts)","Premera Blue Cross","Priority Health",
  "Regence Blue Cross Blue Shield","SelectHealth",
  "TRICARE East (Humana Military)","TRICARE West (Health Net Federal)",
  "TRICARE For Life","TRICARE Prime","TRICARE Select",
  "UnitedHealthcare","UnitedHealthcare Community Plan","UMR (UnitedHealthcare)",
  "UPMC Health Plan","US Department of Veterans Affairs (VA)",
  "BCBS Federal Employee Program (FEP)","Wellmark Blue Cross Blue Shield",
];

const DIAGNOSES = [
  { id: "t2d", label: "Type 2 Diabetes" },
  { id: "obesity", label: "Obesity (BMI ≥ 30)" },
  { id: "overweight", label: "Overweight with comorbidity (BMI 27-29.9)" },
  { id: "prediabetes", label: "Prediabetes / Insulin Resistance" },
  { id: "osa", label: "Obstructive Sleep Apnea (OSA)" },
  { id: "cvd", label: "Cardiovascular Disease / Heart Disease" },
  { id: "metabolic", label: "Metabolic Syndrome" },
  { id: "pcos", label: "PCOS" },
  { id: "none", label: "None of the above / Not sure" },
];

const EMPLOYER_SIZES = [
  { id: "large_5000_plus", label: "Large company (5,000+ employees)" },
  { id: "medium_500_4999", label: "Mid-size company (500-4,999 employees)" },
  { id: "small_under_500", label: "Small company (under 500 employees)" },
  { id: "government_federal", label: "Federal government" },
  { id: "government_state", label: "State / local government" },
  { id: "self_employed", label: "Self-employed" },
  { id: "not_sure", label: "Not sure" },
];

const PLAN_TYPES = [
  { id: "employer", label: "Through my employer" },
  { id: "marketplace", label: "ACA Marketplace (Healthcare.gov)" },
  { id: "medicaid", label: "Medicaid" },
  { id: "medicare", label: "Medicare" },
  { id: "tricare", label: "TRICARE (military)" },
  { id: "va", label: "VA Health" },
  { id: "bcbs_fep", label: "BCBS Federal Employee Program" },
  { id: "not_sure", label: "Not sure" },
];

const STATUS_CONFIG = {
  eligible: { color: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0", icon: "✓", label: "Likely Covered" },
  pa_required: { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "⏳", label: "PA Required" },
  not_covered: { color: BRAND.red, bg: "#FEF2F2", border: "#FECACA", icon: "✕", label: "Not Covered" },
  inconclusive: { color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB", icon: "?", label: "Needs Verification" },
};

// Mock API response - in production this comes from the Cloudflare Worker
function getMockApiResponse(form) {
  const hasDx = (id) => form.diagnoses.includes(id);
  const isMedicaid = form.planType === "medicaid";
  const isMedicare = form.planType === "medicare";
  const isTricare = form.planType === "tricare";
  const isLargeEmployer = form.employerSize === "large_5000_plus" || form.employerSize === "government_federal";

  return {
    bucket: "green",
    insurance: { payer: form.insurer, plan: "Open Access Plus", pharmacyPhone: "(800) 244-6224", pbm: { name: "Express Scripts" } },
    sourcesUsed: 4,
    medications: [
      {
        displayName: "Wegovy®", generic: "semaglutide 2.4mg", manufacturer: "Novo Nordisk",
        fdaIndication: "Weight management + CV risk reduction",
        status: hasDx("cvd") ? "pa_required" : isMedicaid && form.state === "FL" ? "not_covered" : "pa_required",
        confidenceScore: hasDx("cvd") ? 82 : 68,
        confidenceLevel: hasDx("cvd") ? "high" : "moderate",
        rating: hasDx("cvd") ? "green" : "yellow",
        probabilityDisplay: hasDx("cvd") ? "55-70%" : isMedicaid && form.state !== "NY" ? "0%" : isLargeEmployer ? "40-55%" : "30-45%",
        recommendedIndication: hasDx("cvd") ? "CV Risk Reduction" : "Weight Management",
        paRequired: true,
        nextStep: hasDx("cvd") ? "We handle your PA — high approval likelihood" : isMedicaid && form.state === "FL" ? "Self-pay: $169/mo" : "We handle your PA — Tier 2 ($50)",
        nextStepPrice: hasDx("cvd") ? "$50 one-time" : isMedicaid && form.state === "FL" ? "$169/mo" : "$50 one-time",
        diagnosisNote: hasDx("cvd") ? "Your cardiovascular history qualifies you for the CV risk reduction indication — this works even on plans that exclude weight-loss-only coverage." : null,
        sourcesAgreeing: 3, sourcesTotal: 4,
        requiredDocumentation: hasDx("cvd") ? ["Prior MI/stroke/PAD/CAD records", "BMI 27+ documentation", "Cardiologist records"] : ["BMI documentation", "3+ months lifestyle modification records", "Letter of medical necessity"],
      },
      {
        displayName: "Zepbound®", generic: "tirzepatide", manufacturer: "Eli Lilly",
        fdaIndication: "Weight management + Obstructive sleep apnea",
        status: hasDx("osa") ? "pa_required" : "pa_required",
        confidenceScore: hasDx("osa") ? 78 : 55,
        confidenceLevel: hasDx("osa") ? "moderate" : "low",
        rating: hasDx("osa") ? "yellow" : "yellow",
        probabilityDisplay: hasDx("osa") ? "45-60%" : isLargeEmployer ? "35-50%" : "25-40%",
        recommendedIndication: hasDx("osa") ? "Obstructive Sleep Apnea" : "Weight Management",
        paRequired: true,
        nextStep: "We handle your PA — Tier 2 ($50)",
        nextStepPrice: "$50 one-time",
        diagnosisNote: hasDx("osa") ? "Your OSA diagnosis creates an FDA-approved coverage pathway. Sleep study documentation will significantly strengthen your PA." : null,
        sourcesAgreeing: 3, sourcesTotal: 4,
        requiredDocumentation: hasDx("osa") ? ["Sleep study (AHI 15+)", "BMI 30+ documentation", "PAP therapy records"] : ["BMI documentation", "3+ months lifestyle records", "Letter of medical necessity"],
      },
      {
        displayName: "Mounjaro®", generic: "tirzepatide", manufacturer: "Eli Lilly",
        fdaIndication: "Type 2 Diabetes",
        status: hasDx("t2d") ? "pa_required" : hasDx("prediabetes") || hasDx("metabolic") ? "pa_required" : "not_covered",
        confidenceScore: hasDx("t2d") ? 90 : hasDx("prediabetes") ? 55 : 80,
        confidenceLevel: hasDx("t2d") ? "high" : hasDx("prediabetes") ? "low" : "high",
        rating: hasDx("t2d") ? "green" : hasDx("prediabetes") ? "yellow" : "red",
        probabilityDisplay: hasDx("t2d") ? "85-95%" : hasDx("prediabetes") ? "50-65%" : "5-15%",
        recommendedIndication: hasDx("t2d") ? "Type 2 Diabetes" : hasDx("prediabetes") ? "Metabolic/Prediabetes" : "Not FDA-approved for weight loss",
        paRequired: hasDx("t2d") || hasDx("prediabetes"),
        nextStep: hasDx("t2d") ? "We handle your PA — very high approval likelihood" : hasDx("prediabetes") ? "Dr. Linda reviews your case for advocacy" : "Self-pay: $299/mo",
        nextStepPrice: hasDx("t2d") ? "$50 one-time" : hasDx("prediabetes") ? "$50 one-time" : "$299/mo",
        diagnosisNote: hasDx("t2d") ? "Your T2D diagnosis qualifies you for the FDA-approved indication. Highest probability path." : hasDx("prediabetes") ? "Your prediabetes opens a possible PA pathway. Dr. Linda can advocate with A1C and fasting glucose documentation." : "Mounjaro is only FDA-approved for T2D. Without a diabetes/metabolic diagnosis, coverage is very unlikely.",
        sourcesAgreeing: hasDx("t2d") ? 4 : 2, sourcesTotal: 4,
        requiredDocumentation: hasDx("t2d") ? ["A1C lab result (6.5+)", "Diabetes treatment history"] : hasDx("prediabetes") ? ["A1C (5.7-6.4) or fasting glucose (100-125)", "Metformin trial documentation", "Letter of medical necessity"] : [],
      },
      {
        displayName: "Ozempic®", generic: "semaglutide 0.5/1/2mg", manufacturer: "Novo Nordisk",
        fdaIndication: "Type 2 Diabetes + CV/renal protection",
        status: hasDx("t2d") ? "eligible" : "not_covered",
        confidenceScore: hasDx("t2d") ? 92 : 88,
        confidenceLevel: "high",
        rating: hasDx("t2d") ? "green" : "red",
        probabilityDisplay: hasDx("t2d") ? "85-95%" : "0-5%",
        recommendedIndication: hasDx("t2d") ? "Type 2 Diabetes" : "Not approved for weight loss",
        paRequired: false,
        nextStep: hasDx("t2d") ? "Branded Rx program: $45/mo" : "Consider Wegovy (same drug, weight mgmt indication)",
        nextStepPrice: hasDx("t2d") ? "$45/mo" : "See Wegovy",
        diagnosisNote: hasDx("t2d") ? "Your T2D diagnosis qualifies you for formulary coverage. Ozempic is widely covered with minimal barriers." : "Ozempic is only FDA-approved for T2D. For weight management, see Wegovy (same active ingredient, different indication).",
        sourcesAgreeing: 4, sourcesTotal: 4,
        requiredDocumentation: hasDx("t2d") ? ["A1C lab result", "Current diabetes treatment plan"] : [],
      },
    ],
  };
}

function InsurerSearch({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [hl, setHl] = useState(-1);
  const ref = useRef(null);
  const filtered = query.length > 0 ? INSURERS.filter(i => i.toLowerCase().includes(query.toLowerCase())) : INSURERS;
  const showCustom = query.length > 2 && filtered.length === 0;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="text" placeholder="Start typing your insurance name..." value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setIsOpen(true); setHl(-1); }}
        onFocus={() => setIsOpen(true)}
        style={{ width: "100%", padding: "12px 16px", fontSize: 15, fontFamily: "'Manrope', sans-serif", border: `1.5px solid ${isOpen ? BRAND.pink : BRAND.mid}`, borderRadius: 10, outline: "none", backgroundColor: BRAND.white, boxSizing: "border-box", boxShadow: isOpen ? `0 0 0 3px ${BRAND.pink}22` : "none" }}
      />
      {isOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, maxHeight: 200, overflowY: "auto", backgroundColor: BRAND.white, border: `1.5px solid ${BRAND.mid}`, borderTop: "none", borderRadius: "0 0 10px 10px", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          {filtered.length > 0 ? filtered.slice(0, 15).map((ins, i) => (
            <div key={ins} onClick={() => { setQuery(ins); onChange(ins); setIsOpen(false); }}
              style={{ padding: "10px 16px", fontSize: 14, cursor: "pointer", backgroundColor: hl === i ? `${BRAND.pink}15` : "transparent", borderBottom: `1px solid ${BRAND.light}`, color: BRAND.black }}
              onMouseEnter={() => setHl(i)}>{ins}</div>
          )) : showCustom ? (
            <div onClick={() => { onChange(query); setIsOpen(false); }} style={{ padding: "12px 16px", fontSize: 14, cursor: "pointer" }}>
              <span style={{ fontWeight: 700, color: BRAND.red }}>Use: </span>"{query}" <span style={{ color: BRAND.gray, fontSize: 12 }}>— we'll look it up</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: BRAND.black, marginBottom: 5 }}>
        {label} {required && <span style={{ color: BRAND.red }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: BRAND.gray, marginTop: 3, lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text" }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "11px 14px", fontSize: 15, fontFamily: "'Manrope', sans-serif", border: `1.5px solid ${BRAND.mid}`, borderRadius: 10, outline: "none", backgroundColor: BRAND.white, boxSizing: "border-box" }}
    onFocus={e => { e.target.style.borderColor = BRAND.pink; }} onBlur={e => { e.target.style.borderColor = BRAND.mid; }} />;
}

function PillSelect({ options, selected, onChange, multi = false }) {
  const toggle = (id) => {
    if (!multi) { onChange([id]); return; }
    if (id === "none") { onChange(selected.includes("none") ? [] : ["none"]); return; }
    const without = selected.filter(s => s !== "none");
    onChange(without.includes(id) ? without.filter(s => s !== id) : [...without, id]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {options.map(o => {
        const on = selected.includes(o.id);
        return <button key={o.id} onClick={() => toggle(o.id)} style={{
          padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${on ? BRAND.red : BRAND.mid}`,
          backgroundColor: on ? `${BRAND.red}12` : BRAND.white, color: on ? BRAND.red : BRAND.black,
          fontSize: 13, fontWeight: on ? 700 : 500, fontFamily: "'Manrope', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
        }}>{on ? "✓ " : ""}{o.label}</button>;
      })}
    </div>
  );
}

function ConfidenceMeter({ score, level }) {
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : score >= 40 ? "#F97316" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, backgroundColor: BRAND.mid, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", backgroundColor: color, borderRadius: 3, transition: "width 0.6s ease-out" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 35 }}>{score}%</span>
    </div>
  );
}

function MedCard({ med, index }) {
  const s = STATUS_CONFIG[med.status] || STATUS_CONFIG.inconclusive;
  return (
    <div style={{
      background: BRAND.white, borderRadius: 16, border: `1.5px solid ${BRAND.mid}`, padding: 24, marginBottom: 14,
      animation: `fadeUp 0.4s ease-out ${index * 0.08}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: BRAND.black, margin: 0 }}>{med.displayName}</h3>
          <p style={{ fontSize: 12, color: BRAND.gray, margin: "2px 0 0" }}>{med.generic} · {med.manufacturer}</p>
          <p style={{ fontSize: 11, color: BRAND.pink, margin: "3px 0 0", fontWeight: 600 }}>{med.fdaIndication}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 100, fontSize: 13, fontWeight: 700, color: s.color, backgroundColor: s.bg, border: `1.5px solid ${s.border}` }}>
            {s.icon} {s.label}
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 4 }}>{med.probabilityDisplay}</div>
          <div style={{ fontSize: 10, color: BRAND.gray }}>est. approval probability</div>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 11, color: BRAND.gray, fontWeight: 600 }}>CONFIDENCE ({med.sourcesAgreeing}/{med.sourcesTotal} sources agree)</span>
          <span style={{ fontSize: 11, color: BRAND.gray }}>{med.confidenceLevel}</span>
        </div>
        <ConfidenceMeter score={med.confidenceScore} level={med.confidenceLevel} />
      </div>

      <div style={{ fontSize: 13, padding: "10px 14px", backgroundColor: s.bg, borderRadius: 10, borderLeft: `3px solid ${s.color}`, marginBottom: 10, lineHeight: 1.5 }}>
        <strong>Recommended pathway:</strong> {med.recommendedIndication}
        {med.paRequired && <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: `${s.color}15`, color: s.color, fontWeight: 700 }}>PA REQUIRED</span>}
      </div>

      {med.diagnosisNote && (
        <div style={{ fontSize: 12, padding: "10px 14px", backgroundColor: `${BRAND.red}06`, borderRadius: 10, marginBottom: 10, lineHeight: 1.5, color: BRAND.red, fontWeight: 600 }}>
          💡 {med.diagnosisNote}
        </div>
      )}

      {med.requiredDocumentation?.length > 0 && (
        <details style={{ marginBottom: 10 }}>
          <summary style={{ fontSize: 12, fontWeight: 600, color: BRAND.gray, cursor: "pointer" }}>Required documentation ({med.requiredDocumentation.length} items)</summary>
          <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
            {med.requiredDocumentation.map((d, i) => <li key={i} style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{d}</li>)}
          </ul>
        </details>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{
          padding: "10px 22px", borderRadius: 100, border: "none", fontSize: 14, fontWeight: 700,
          fontFamily: "'Manrope', sans-serif", cursor: "pointer",
          backgroundColor: med.status === "not_covered" ? BRAND.black : BRAND.red, color: BRAND.white,
        }}>
          {med.nextStep} →
        </button>
      </div>
    </div>
  );
}

function ProgressSteps({ step }) {
  const steps = [
    { label: "Insurance Info", icon: "🪪" },
    { label: "Health Profile", icon: "🩺" },
    { label: "Checking", icon: "⚡" },
    { label: "Your Results", icon: "📋" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 100,
            backgroundColor: i === step ? BRAND.red : i < step ? `${BRAND.red}15` : BRAND.light,
            color: i === step ? BRAND.white : i < step ? BRAND.red : BRAND.gray,
            fontSize: 12, fontWeight: i <= step ? 700 : 500, whiteSpace: "nowrap",
          }}>{s.icon} {s.label}</div>
          {i < steps.length - 1 && <div style={{ width: 14, height: 2, backgroundColor: i < step ? BRAND.pink : BRAND.mid, borderRadius: 2 }} />}
        </div>
      ))}
    </div>
  );
}

export default function CoverageCheckFinal() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName: "", lastName: "", dob: "", state: "FL", insurer: "", memberId: "", groupNumber: "", diagnoses: [], employerSize: "", planType: "" });
  const [results, setResults] = useState(null);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canStep1 = form.firstName && form.lastName && form.dob && form.insurer && form.memberId && form.state;
  const canStep2 = form.diagnoses.length > 0 && form.employerSize && form.planType;

  const handleSubmit = () => {
    setStep(2);
    setTimeout(() => { setResults(getMockApiResponse(form)); setStep(3); }, 3500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ fontFamily: "'Manrope', sans-serif", minHeight: "100vh", background: `linear-gradient(180deg, ${BRAND.light} 0%, ${BRAND.white} 100%)` }}>
        {/* Header */}
        <div style={{ background: BRAND.black, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: BRAND.white, fontSize: 14 }}>B</div>
          <span style={{ color: BRAND.white, fontWeight: 800, fontSize: 16 }}>BODY GOOD</span>
        </div>

        <div style={{ maxWidth: 660, margin: "0 auto", padding: "36px 20px 60px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, backgroundColor: `${BRAND.red}10`, color: BRAND.red, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              {step === 3 ? "Your Coverage Results" : "Insurance Coverage Check"}
            </div>
            <h1 style={{ fontSize: step === 3 ? 24 : 26, fontWeight: 800, color: BRAND.black, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              {step === 0 && "Let's check what your insurance covers"}
              {step === 1 && "A few more details for accurate results"}
              {step === 2 && "Hang tight, babe"}
              {step === 3 && "Here's your personalized coverage breakdown"}
            </h1>
            <p style={{ fontSize: 14, color: BRAND.gray, margin: 0, lineHeight: 1.5, maxWidth: 500, marginInline: "auto" }}>
              {step === 0 && "We check your real-time benefits for Wegovy, Mounjaro, Zepbound, and Ozempic."}
              {step === 1 && "Your diagnoses and plan type dramatically affect coverage. This helps us give you the most accurate results."}
              {step === 2 && "We're verifying your benefits across 4 data sources right now."}
              {step === 3 && results && <><strong>{results.insurance.payer}</strong> · {results.insurance.plan} · {results.sourcesUsed} sources checked</>}
            </p>
          </div>

          <ProgressSteps step={step} />

          {/* Step 0: Insurance Info */}
          {step === 0 && (
            <div style={{ backgroundColor: BRAND.white, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${BRAND.mid}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", animation: "fadeUp 0.4s ease-out" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <Field label="First Name" required><Input placeholder="Sarah" value={form.firstName} onChange={v => u("firstName", v)} /></Field>
                <Field label="Last Name" required><Input placeholder="Mitchell" value={form.lastName} onChange={v => u("lastName", v)} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <Field label="Date of Birth" required><Input type="date" value={form.dob} onChange={v => u("dob", v)} /></Field>
                <Field label="State" required>
                  <select value={form.state} onChange={e => u("state", e.target.value)} style={{ width: "100%", padding: "11px 14px", fontSize: 15, fontFamily: "'Manrope', sans-serif", border: `1.5px solid ${BRAND.mid}`, borderRadius: 10, backgroundColor: BRAND.white, boxSizing: "border-box" }}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Insurance Company" required hint="Start typing — if yours isn't listed, type the full name">
                <InsurerSearch value={form.insurer} onChange={v => u("insurer", v)} />
              </Field>
              <Field label="Member ID" required hint="Found on the front of your insurance card">
                <Input placeholder="e.g. XYZ123456789" value={form.memberId} onChange={v => u("memberId", v)} />
              </Field>
              <Field label="Group Number" hint="Optional — helps find your exact plan">
                <Input placeholder="e.g. 12345" value={form.groupNumber} onChange={v => u("groupNumber", v)} />
              </Field>
              <button onClick={() => setStep(1)} disabled={!canStep1} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none", fontSize: 16, fontWeight: 700,
                fontFamily: "'Manrope', sans-serif", cursor: canStep1 ? "pointer" : "not-allowed",
                backgroundColor: canStep1 ? BRAND.red : BRAND.mid, color: canStep1 ? BRAND.white : BRAND.gray, marginTop: 6,
              }}>Next: Health Profile →</button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: BRAND.light }}>
                <svg width="12" height="14" viewBox="0 0 14 16" fill="none"><rect x="2" y="7" width="10" height="8" rx="2" stroke={BRAND.gray} strokeWidth="1.5"/><path d="M4 7V5C4 3.34 5.34 2 7 2C8.66 2 10 3.34 10 5V7" stroke={BRAND.gray} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 11, color: BRAND.gray, fontWeight: 500 }}>HIPAA-secure · Your data is encrypted and never stored</span>
              </div>
            </div>
          )}

          {/* Step 1: Health Profile */}
          {step === 1 && (
            <div style={{ backgroundColor: BRAND.white, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${BRAND.mid}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", animation: "fadeUp 0.4s ease-out" }}>
              <Field label="Do you have any of these diagnoses?" required hint="Select all that apply. This directly impacts your coverage probability.">
                <PillSelect options={DIAGNOSES} selected={form.diagnoses} onChange={v => u("diagnoses", v)} multi />
              </Field>

              <div style={{ marginTop: 4, padding: "12px 16px", borderRadius: 10, backgroundColor: BRAND.light, fontSize: 12, lineHeight: 1.6, color: BRAND.gray, marginBottom: 18 }}>
                <strong style={{ color: BRAND.black }}>Why this matters:</strong><br />
                <strong>Zepbound</strong> — FDA-approved for obesity + OSA<br />
                <strong>Wegovy</strong> — FDA-approved for weight management + CV risk reduction<br />
                <strong>Mounjaro & Ozempic</strong> — FDA-approved for T2D. Prediabetes may open a pathway with physician advocacy.
              </div>

              <Field label="How do you get your insurance?" required>
                <PillSelect options={PLAN_TYPES} selected={form.planType ? [form.planType] : []} onChange={v => u("planType", v[0])} />
              </Field>

              {(form.planType === "employer" || form.planType === "") && (
                <Field label="How large is your employer?" required hint="Larger employers are more likely to cover GLP-1 medications">
                  <PillSelect options={EMPLOYER_SIZES} selected={form.employerSize ? [form.employerSize] : []} onChange={v => u("employerSize", v[0])} />
                </Field>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(0)} style={{ padding: "12px 22px", borderRadius: 12, border: `1.5px solid ${BRAND.mid}`, fontSize: 14, fontWeight: 600, fontFamily: "'Manrope', sans-serif", cursor: "pointer", backgroundColor: BRAND.white, color: BRAND.gray }}>← Back</button>
                <button onClick={handleSubmit} disabled={!canStep2} style={{
                  flex: 1, padding: "14px", borderRadius: 12, border: "none", fontSize: 16, fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif", cursor: canStep2 ? "pointer" : "not-allowed",
                  backgroundColor: canStep2 ? BRAND.red : BRAND.mid, color: canStep2 ? BRAND.white : BRAND.gray,
                }}>Check My Coverage</button>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ backgroundColor: BRAND.white, borderRadius: 18, border: `1.5px solid ${BRAND.mid}`, padding: "50px 20px", textAlign: "center", animation: "fadeUp 0.3s" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 20px", borderRadius: "50%", border: `3px solid ${BRAND.mid}`, borderTopColor: BRAND.red, animation: "spin 0.8s linear infinite" }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: BRAND.black, margin: "0 0 6px" }}>Checking your coverage...</h3>
              <p style={{ fontSize: 14, color: BRAND.gray, margin: 0 }}>Verifying across 4 data sources for maximum accuracy</p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <div style={{ animation: "fadeUp 0.4s ease-out" }}>
              {/* Legend */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "eligible", title: "Likely Covered", desc: "Your plan covers this. Proceed with minimal friction." },
                  { key: "pa_required", title: "PA Required", desc: "Coverage possible — insurer needs medical justification. We handle this." },
                  { key: "not_covered", title: "Not Covered", desc: "Not on formulary for this indication. Self-pay or alternative recommended." },
                ].map(s => {
                  const c = STATUS_CONFIG[s.key];
                  return (
                    <div key={s.key} style={{ padding: "14px 12px", borderRadius: 12, backgroundColor: c.bg, border: `1px solid ${c.border}`, textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 3 }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: BRAND.gray, lineHeight: 1.3 }}>{s.desc}</div>
                    </div>
                  );
                })}
              </div>

              {results.medications.map((med, i) => <MedCard key={med.displayName} med={med} index={i} />)}

              {/* Bottom CTA */}
              <div style={{
                marginTop: 24, padding: "22px 24px", borderRadius: 16,
                background: `linear-gradient(135deg, ${BRAND.black} 0%, #2A2A2A 100%)`, textAlign: "center",
              }}>
                <p style={{ color: BRAND.pink, fontSize: 12, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Not sure which option is right for you?</p>
                <h3 style={{ color: BRAND.white, fontSize: 18, fontWeight: 800, margin: "0 0 10px" }}>We'll help you figure it out</h3>
                <p style={{ color: "#999", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>Dr. Linda's team reviews every case personally. Whether insurance or self-pay, we've got you.</p>
                <button style={{ padding: "11px 26px", borderRadius: 100, border: "none", fontSize: 14, fontWeight: 700, fontFamily: "'Manrope', sans-serif", cursor: "pointer", backgroundColor: BRAND.red, color: BRAND.white }}>Start My Medical Review</button>
              </div>

              <p style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 20, lineHeight: 1.5, maxWidth: 480, marginInline: "auto" }}>
                Results based on real-time eligibility data, published formulary policies, Body Good historical data, and FDA-approved indications. Confidence scores reflect agreement across {results.sourcesUsed} independent data sources. Actual coverage may vary. PA outcomes depend on clinical documentation. This check is non-refundable.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
