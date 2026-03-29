import { useState, useEffect } from "react";

const T = {
  red: "#ed1b1b", pink: "#fde7e7", heading: "#0C0D0F", body: "#55575A",
  border: "#E5E5E5", green: "#1B8A4A", greenLight: "#E8F5EE",
  blue: "#1A6EED", blueLight: "#EBF2FF", gold: "#F59E0B", goldLight: "#FFFBEB",
  white: "#ffffff", gray50: "#FAFAFA",
};

// ═══════════════════════════════════════════════════════════
// DOSE-AWARE PRODUCT DATABASE
// Products with `doses` array get the dose selection step
// Each dose maps to a pricing tier (starter or maintenance)
// ═══════════════════════════════════════════════════════════
const ALL_PRODUCTS = {
  "WM-TIR-INJ": {
    sku: "WM-TIR-INJ", name: "Tirzepatide Injection", program: "Weight Loss — Self Pay",
    type: "compounded",
    description: "Compounded Tirzepatide / B6 (Pyridoxine) Injectable",
    bestFor: "Most effective GLP-1 — dual action (GLP-1 + GIP)",
    slug: "tirzepatide",
    doses: [
      { mg: "2.5mg",   tier: "starter",     label: "2.5mg",   tag: "Starting dose" },
      { mg: "5mg",     tier: "starter",     label: "5mg" },
      { mg: "7.5mg",   tier: "starter",     label: "7.5mg" },
      { mg: "9mg",     tier: "starter",     label: "9mg",     tag: "Starter max" },
      { mg: "10mg",    tier: "maintenance", label: "10mg" },
      { mg: "11.25mg", tier: "maintenance", label: "11.25mg" },
      { mg: "12.5mg",  tier: "maintenance", label: "12.5mg" },
      { mg: "13.5mg",  tier: "maintenance", label: "13.5mg" },
      { mg: "14.75mg", tier: "maintenance", label: "14.75mg", tag: "Max dose" },
    ],
    tierPricing: {
      starter:     { 1: 299, 3: 279, 6: 259 },
      maintenance: { 1: 349, 3: 329, 6: 319 },
    },
    onetimePrice: 315,
  },

  "WM-SEM-INJ": {
    sku: "WM-SEM-INJ", name: "Semaglutide Injection", program: "Weight Loss — Self Pay",
    type: "compounded",
    description: "Compounded Semaglutide / B6 (Pyridoxine) Injectable",
    bestFor: "Proven GLP-1 for steady, sustainable weight loss",
    slug: "semaglutide",
    doses: [
      { mg: "0.25mg", tier: "flat", label: "0.25mg", tag: "Starting dose" },
      { mg: "0.5mg",  tier: "flat", label: "0.5mg" },
      { mg: "1mg",    tier: "flat", label: "1mg" },
      { mg: "1.7mg",  tier: "flat", label: "1.7mg" },
      { mg: "2.4mg",  tier: "flat", label: "2.4mg", tag: "Max dose" },
    ],
    tierPricing: {
      flat: { 1: 169, 3: 149, 6: 139 },
    },
    onetimePrice: 179,
  },

  "WM-ORAL-SEM": {
    sku: "WM-ORAL-SEM", name: "Glow Rx — Oral Semaglutide", program: "Weight Loss — Oral",
    type: "compounded",
    description: "Sublingual Semaglutide Tablets · 28ct · No needles",
    bestFor: "Needle-free GLP-1 weight loss",
    slug: "semaglutide",
    prices: { 1: 129, 3: 119, 6: 109 }, onetimePrice: 149,
  },

  "WM-ORAL-TIR": {
    sku: "WM-ORAL-TIR", name: "Glow Rx — Oral Tirzepatide", program: "Weight Loss — Oral",
    type: "compounded",
    description: "Sublingual Tirzepatide Tablets · No needles",
    bestFor: "Most effective GLP-1 without injections",
    slug: "tirzepatide",
    prices: { 1: 129, 3: 119, 6: 109 },
  },

  "WM-ORAL-METCOMBO": { sku: "WM-ORAL-METCOMBO", name: "Metformin + Topiramate Combo", program: "Weight Loss — Oral", type: "compounded", description: "Compounded capsules", bestFor: "PCOS, pre-diabetes, insulin resistance", prices: { 1: 79 } },
  "WM-ORAL-LDN": { sku: "WM-ORAL-LDN", name: "Low-Dose Naltrexone", program: "Weight Loss — Oral", type: "compounded", description: "LDN 4.5mg capsules", bestFor: "Cravings & emotional eating", prices: { 1: 49 } },

  "WM-BRAND-MGMT": { sku: "WM-BRAND-MGMT", name: "Branded Rx Management", program: "Weight Loss — Branded Rx", type: "pharmacy_only", description: "Wegovy or Zepbound Rx to your pharmacy", bestFor: "Patients wanting brand-name medication", slug: "wegovy", pharmacyFee: 55, ongoingFee: 45 },

  "WM-ADDON-ZOFRAN": { sku: "WM-ADDON-ZOFRAN", name: "Ondansetron (Anti-Nausea)", program: "Weight Loss — Add-On", type: "both", description: "Dissolving tablets for GLP-1 nausea", bestFor: "GLP-1 nausea relief", slug: "ondansetron", prices: { 1: 29 }, pharmacyFee: 25 },

  "INS-ELIG": { sku: "INS-ELIG", name: "Insurance Eligibility Check", program: "Weight Loss — Insurance", type: "service", description: "Verify your insurance GLP-1 coverage", bestFor: "Patients with insurance", servicePrice: 25, serviceLabel: "One-time check" },
  "INS-ONGOING": { sku: "INS-ONGOING", name: "Insurance Ongoing Management", program: "Weight Loss — Insurance", type: "service", description: "Monthly support and refill coordination", bestFor: "Approved patients needing management", servicePrice: 75, serviceLabel: "Monthly management" },

  // ── WELLNESS INJECTIONS ──
  "WI-B12": { sku: "WI-B12", name: "Vitamin B12 Injection", program: "Wellness Injections", type: "compounded", description: "Cyanocobalamin 1000mcg/mL · 10mL", bestFor: "Energy & fatigue", prices: { 1: 49 } },
  "WI-LSB": { sku: "WI-LSB", name: "Lipotropic Super B", program: "Wellness Injections", type: "compounded", description: "11-ingredient energy + fat-burning shot", bestFor: "Energy, metabolism, fat burning", prices: { 1: 99, 3: 89 } },
  "WI-GLUT": { sku: "WI-GLUT", name: "Glutathione Injection", program: "Wellness Injections", type: "compounded", description: "200mg/mL · 30mL · Master antioxidant", bestFor: "Detox, skin, cellular health", prices: { 1: 149 } },
  "WI-NAD": { sku: "WI-NAD", name: "NAD+ Injection", program: "Wellness Injections", type: "compounded", description: "100mg/mL · 10mL", bestFor: "Anti-aging, brain, longevity", prices: { 1: 199 } },
  "WI-SERM": { sku: "WI-SERM", name: "Sermorelin Injection", program: "Wellness Injections", type: "compounded", description: "3mg/mL · 6mL · GH peptide", bestFor: "Muscle, sleep, recovery", prices: { 1: 179 } },

  // ── HAIR LOSS ──
  "HL-M-FIN": { sku: "HL-M-FIN", name: "Finasteride 1mg", program: "Hair Loss", type: "both", description: "Oral capsules · 30ct · DHT blocker", bestFor: "Pattern hair loss & receding", slug: "finasteride", prices: { 1: 35 }, pharmacyFee: 25 },
  "HL-M-COMBO": { sku: "HL-M-COMBO", name: "Hair Restore Combo Spray", program: "Hair Loss", type: "both", description: "Minoxidil 7% + Finasteride + Arginine + Biotin · 30mL", bestFor: "Comprehensive topical restoration", slug: "minoxidil", prices: { 1: 59 }, pharmacyFee: 25 },
  "HL-M-MAX": { sku: "HL-M-MAX", name: "Hair Restore Max 7-Ingredient", program: "Hair Loss", type: "compounded", description: "7 active ingredients · Most powerful formula", bestFor: "Aggressive/advanced hair loss", prices: { 1: 79 } },
  "HL-W-MINOX": { sku: "HL-W-MINOX", name: "Minoxidil Topical (Women)", program: "Hair Loss", type: "both", description: "Minoxidil + Tretinoin + Vit E + Melatonin · 30mL", bestFor: "Thinning hair", slug: "minoxidil", prices: { 1: 59 }, pharmacyFee: 25 },

  // ── SKINCARE ──
  "SK-BRIGHT": { sku: "SK-BRIGHT", name: "Bright Cream", program: "Skincare", type: "both", description: "Hydroquinone 8% + 4 actives · 30g", bestFor: "Melasma, dark spots, hyperpigmentation", slug: "hydroquinone", prices: { 1: 89 }, pharmacyFee: 25 },
  "SK-GLOW": { sku: "SK-GLOW", name: "Glow Cream", program: "Skincare", type: "both", description: "Azelaic + Tretinoin + Niacinamide · 30g", bestFor: "Anti-aging, acne, uneven tone", slug: "tretinoin", prices: { 1: 69 }, pharmacyFee: 25 },

  // ── FEMININE HEALTH ──
  "FH-UTI": { sku: "FH-UTI", name: "UTI Treatment", program: "Feminine Health", type: "pharmacy_only", description: "Rx to your pharmacy", bestFor: "Active UTI symptoms", slug: "nitrofurantoin", pharmacyFee: 35, isAcute: true },
  "FH-SCREAM1": { sku: "FH-SCREAM1", name: "Intimate Wellness Cream", program: "Feminine Health", type: "compounded", description: "Sildenafil + Arginine + Papaverine · 30g", bestFor: "Arousal & sensitivity", prices: { 1: 65 } },

  // ── MENTAL HEALTH ──
  "MW-ANXIETY": { sku: "MW-ANXIETY", name: "Calm Rx (Buspirone)", program: "Mental Health", type: "pharmacy_only", description: "Rx: Buspirone to pharmacy", bestFor: "Generalized anxiety", slug: "buspirone", pharmacyFee: 49, ongoingFee: 25 },
  "MW-SELANK": { sku: "MW-SELANK", name: "Selank Nasal Spray", program: "Mental Health", type: "compounded", description: "Peptide anti-anxiety · 6mL", bestFor: "Fast anxiety relief without pills", prices: { 1: 129 } },
};

// ─── ICONS ──
const Chk = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>;
const Trk = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14l1 8H4L5 8z"/><circle cx="8" cy="20" r="1.5"/><circle cx="16" cy="20" r="1.5"/><path d="M2 4h3l2 4"/></svg>;
const Phm = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M9 8h6M9 12h6M9 16h6M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>;
const Shd = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Ext = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>;

function StepDot({ num, done, active }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      background: done ? T.green : active ? T.red : "#EEE", color: done || active ? "#fff" : "#BBB",
      fontSize: 11, fontWeight: 700, fontFamily: "Poppins,sans-serif", flexShrink: 0, transition: "all 0.3s",
    }}>{done ? <Chk /> : num}</div>
  );
}

// ── DOSE PILL ──
function DosePill({ dose, active, onClick, tierLabel }) {
  const isMaint = dose.tier === "maintenance";
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 10, border: `2px solid ${active ? T.red : T.border}`,
      background: active ? T.pink : T.white, cursor: "pointer", transition: "all 0.15s",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 72,
    }}>
      <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 14, color: active ? T.red : T.heading }}>{dose.label}</span>
      {dose.tag && <span style={{ fontSize: 9, fontWeight: 600, color: isMaint ? T.blue : T.green, background: isMaint ? T.blueLight : T.greenLight, padding: "1px 6px", borderRadius: 50 }}>{dose.tag}</span>}
      {tierLabel && <span style={{ fontSize: 9, color: T.body }}>{tierLabel}</span>}
    </button>
  );
}

// ── MONTH DOSE SELECTOR ROW ──
function MonthDoseRow({ monthNum, doses, selected, onChange, tierPricing, durKey }) {
  const selectedDose = doses.find(d => d.mg === selected);
  const tierPrice = selectedDose ? tierPricing[selectedDose.tier]?.[durKey] || tierPricing[selectedDose.tier]?.[1] : null;

  return (
    <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 12, color: T.heading }}>
          Month {monthNum}
        </span>
        {tierPrice && (
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Poppins,sans-serif", color: selectedDose?.tier === "maintenance" ? T.blue : T.green }}>
            ${tierPrice}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {doses.map(d => (
          <DosePill key={d.mg} dose={d} active={selected === d.mg} onClick={() => onChange(d.mg)}
            tierLabel={d.tier !== "flat" ? (d.tier === "starter" ? "Starter" : "Maint.") : null} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function RecommendationV4() {
  const [demoSku, setDemoSku] = useState("WM-TIR-INJ");
  const product = ALL_PRODUCTS[demoSku];

  const [fulfillment, setFulfillment] = useState(null);
  const [duration, setDuration] = useState(null);
  // For dose products: array of selected doses per month
  // e.g., ["5mg", "7.5mg", "10mg"] for a 3-month plan
  const [monthDoses, setMonthDoses] = useState([]);
  const [bounce, setBounce] = useState(false);

  const hasDoses = product && !!product.doses;
  const isService = product?.type === "service";
  const isPharmOnly = product?.type === "pharmacy_only";

  // Reset on product change
  useEffect(() => { setFulfillment(null); setDuration(null); setMonthDoses([]); }, [demoSku]);

  // Auto-select fulfillment
  useEffect(() => {
    if (!product) return;
    if (product.type === "compounded") setFulfillment("ship");
    else if (isPharmOnly || isService) setFulfillment("pharmacy");
    else setFulfillment(null);
  }, [product]);

  // Auto duration for pharmacy/service or single-price no-dose products
  useEffect(() => {
    if (!product) return;
    if (fulfillment === "pharmacy" || isService) { setDuration(1); return; }
    if (fulfillment === "ship" && !hasDoses) {
      const p = product.prices || {};
      const keys = Object.keys(p).map(Number);
      if (keys.length === 1) setDuration(keys[0]);
      else setDuration(null);
    }
  }, [fulfillment, product]);

  // Reset monthDoses when duration changes
  useEffect(() => {
    if (hasDoses && duration) {
      setMonthDoses(Array(duration).fill(null));
    } else {
      setMonthDoses([]);
    }
  }, [duration, hasDoses]);

  // Bounce
  useEffect(() => { setBounce(true); const t = setTimeout(() => setBounce(false), 250); return () => clearTimeout(t); }, [fulfillment, duration, JSON.stringify(monthDoses)]);

  // ── PRICE CALC ──
  const calcPrice = () => {
    if (!product) return { price: "—" };
    if (isService) return { price: product.servicePrice, sub: product.serviceLabel };
    if (!fulfillment) return { price: "—", note: "Select a delivery option" };
    if (fulfillment === "pharmacy") {
      const fee = product.pharmacyFee || 25;
      return { price: fee, sub: product.isAcute ? "One-time consult" : "Doctor review + e-Rx", note: product.ongoingFee ? `+ $${product.ongoingFee}/mo ongoing` : null, extra: "+ meds at pharmacy (insurance may cover)" };
    }

    // Ship path — no doses
    if (!hasDoses) {
      if (!duration) return { price: "—", note: "Choose shipping frequency" };
      const prices = product.prices;
      const total = prices[duration] || prices[1] * duration;
      const monthly = duration > 1 ? Math.round(total / duration) : total;
      return { price: monthly, sub: duration > 1 ? "per month" : null, note: duration > 1 ? `Total: $${total}` : "Meds + doctor + free shipping" };
    }

    // Ship path — has doses
    if (!duration) return { price: "—", note: "Choose shipping frequency" };
    if (monthDoses.some(d => !d)) return { price: "—", note: `Select dose for ${monthDoses.filter(d => !d).length === duration ? "each" : "remaining"} month${monthDoses.filter(d => !d).length > 1 ? "s" : ""}` };

    // All doses selected — calculate total
    const tp = product.tierPricing;
    let total = 0;
    const breakdown = monthDoses.map(mg => {
      const dose = product.doses.find(d => d.mg === mg);
      const tierKey = dose.tier;
      const price = tp[tierKey]?.[duration] || tp[tierKey]?.[1];
      total += price;
      return { mg, tier: tierKey, price };
    });

    const monthly = Math.round(total / duration);
    const allSameTier = new Set(breakdown.map(b => b.tier)).size === 1;
    const tierLabel = allSameTier ? (breakdown[0].tier === "starter" ? "Starter pricing" : breakdown[0].tier === "maintenance" ? "Maintenance pricing" : "") : "Mixed tiers";

    return {
      price: duration === 1 ? total : monthly,
      sub: duration > 1 ? "per month" : null,
      note: duration > 1 ? `Total: $${total} · ${tierLabel}` : tierLabel,
      breakdown,
    };
  };
  const pd = calcPrice();

  // Duration options
  const durOpts = hasDoses
    ? [1, 3, 6]
    : (product?.prices ? Object.keys(product.prices).map(Number).sort((a, b) => a - b) : []);
  const hasDurChoice = fulfillment === "ship" && durOpts.length > 1;

  // All doses filled?
  const dosesComplete = !hasDoses || (monthDoses.length > 0 && monthDoses.every(Boolean));
  const canSubmit = fulfillment && duration && (fulfillment === "pharmacy" || dosesComplete);

  // Programs for demo
  const programs = {};
  Object.values(ALL_PRODUCTS).forEach(p => { if (!programs[p.program]) programs[p.program] = []; programs[p.program].push(p); });

  if (!product) return null;

  return (
    <div style={{ fontFamily: "Manrope,sans-serif", background: T.white, minHeight: "100vh" }}>
      <div style={{ background: T.heading, color: "#fff", textAlign: "center", padding: "9px 20px", fontSize: 12, fontWeight: 500 }}>
        Board-Certified Doctors &bull; Licensed in 20 States &bull; Free Shipping
      </div>
      <nav style={{ display: "flex", justifyContent: "center", padding: "14px 24px", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 20, color: T.heading }}>body<span style={{ color: T.red }}>good</span></span>
      </nav>

      {/* DEMO SWITCHER */}
      <div style={{ background: "#FFF9DB", borderBottom: "2px solid #FDE68A", padding: "10px 20px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "Poppins,sans-serif", color: "#92400E", marginBottom: 4, textTransform: "uppercase" }}>Demo — Select product to simulate quiz</div>
          <select value={demoSku} onChange={e => setDemoSku(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #FDE68A", fontFamily: "Manrope,sans-serif", fontSize: 12, background: "#fff" }}>
            {Object.entries(programs).map(([prog, items]) => (
              <optgroup key={prog} label={prog}>
                {items.map(p => <option key={p.sku} value={p.sku}>{p.name} {p.doses ? `— ${p.doses.length} DOSES` : ""} — {p.type}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "28px 20px 0", maxWidth: 580, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.greenLight, color: T.green, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 50, marginBottom: 10 }}><Chk /> Based on Your Quiz Results</div>
        <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 21, color: T.heading, lineHeight: 1.3, margin: "0 0 5px" }}>{product.name}</h1>
        <p style={{ fontSize: 13, color: T.body, margin: "0 0 5px" }}>{product.description}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: T.green }}><Shd /> Best for: {product.bestFor}</div>
      </div>

      {/* CONFIGURATOR */}
      <div style={{ maxWidth: 820, margin: "22px auto 0", padding: "0 16px 40px", display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 440px", minWidth: 300 }}>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>

            {/* ── STEP 1: FULFILLMENT ── */}
            {!isService && (
              <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <StepDot num={1} done={!!fulfillment} active={!fulfillment} />
                  <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, color: T.heading }}>How do you want to get your meds?</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(product.type === "compounded" || product.type === "both") && (
                    <button onClick={() => { setFulfillment("ship"); setDuration(null); setMonthDoses([]); }} style={{
                      padding: "10px 16px", borderRadius: 50, border: `2px solid ${fulfillment === "ship" ? T.red : T.border}`,
                      background: fulfillment === "ship" ? T.pink : T.white, color: fulfillment === "ship" ? T.red : T.heading,
                      fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Trk /> Ship to me — meds included
                      {product.type === "both" && <span style={{ background: T.green, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 50 }}>BEST VALUE</span>}
                    </button>
                  )}
                  {(isPharmOnly || product.type === "both") && (
                    <button onClick={() => { setFulfillment("pharmacy"); setDuration(1); setMonthDoses([]); }} style={{
                      padding: "10px 16px", borderRadius: 50, border: `2px solid ${fulfillment === "pharmacy" ? T.red : T.border}`,
                      background: fulfillment === "pharmacy" ? T.pink : T.white, color: fulfillment === "pharmacy" ? T.red : T.heading,
                      fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Phm /> Pick up at pharmacy — ${product.pharmacyFee || 25}
                    </button>
                  )}
                </div>
                {fulfillment === "ship" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 10, padding: "8px 12px", background: T.pink, borderRadius: 10, fontSize: 11, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}><Trk /> Free shipping</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}><Chk /> Medication included</span>
                  </div>
                )}
                {fulfillment === "pharmacy" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 10, padding: "8px 12px", background: T.blueLight, borderRadius: 10, fontSize: 11, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}><Phm /> {product.isAcute ? "Ready in hours" : "Same-day pickup"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}><Shd /> Insurance accepted</span>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: SHIPPING FREQUENCY ── */}
            {fulfillment === "ship" && hasDurChoice && (
              <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <StepDot num={2} done={!!duration} active={!duration && !!fulfillment} />
                  <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, color: T.heading }}>Shipping frequency</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {durOpts.map(d => (
                    <button key={d} onClick={() => setDuration(d)} style={{
                      padding: "10px 16px", borderRadius: 50, border: `2px solid ${duration === d ? T.red : T.border}`,
                      background: duration === d ? T.pink : T.white, color: duration === d ? T.red : T.heading,
                      fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", position: "relative",
                    }}>
                      {d === 1 ? "Every month" : `Every ${d} months`}
                      {d === Math.max(...durOpts) && <span style={{ position: "absolute", top: -8, right: -4, background: T.green, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 50 }}>SAVE</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: DOSE SELECTION (per month) ── */}
            {hasDoses && fulfillment === "ship" && duration && (
              <div style={{ padding: "18px 18px 8px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <StepDot num={hasDurChoice ? 3 : 2} done={dosesComplete} active={!dosesComplete && !!duration} />
                  <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13, color: T.heading }}>
                    {duration === 1 ? "What is your dose?" : `Select your dose for each month`}
                  </span>
                </div>

                {/* Tier legend */}
                {product.tierPricing && Object.keys(product.tierPricing).length > 1 && (
                  <div style={{ display: "flex", gap: 16, marginBottom: 8, padding: "6px 10px", background: T.gray50, borderRadius: 8, fontSize: 10 }}>
                    {Object.entries(product.tierPricing).map(([tier, prices]) => (
                      <span key={tier} style={{ color: tier === "maintenance" ? T.blue : T.green, fontWeight: 600 }}>
                        {tier === "starter" ? "Starter" : tier === "maintenance" ? "Maintenance" : "All doses"}: ${prices[duration] || prices[1]}/mo
                      </span>
                    ))}
                  </div>
                )}

                {monthDoses.map((sel, i) => (
                  <MonthDoseRow
                    key={i}
                    monthNum={i + 1}
                    doses={product.doses}
                    selected={sel}
                    onChange={(mg) => {
                      const next = [...monthDoses];
                      next[i] = mg;
                      setMonthDoses(next);
                    }}
                    tierPricing={product.tierPricing}
                    durKey={duration}
                  />
                ))}
              </div>
            )}

            {/* WHAT'S INCLUDED */}
            {canSubmit && (
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 10, color: T.body, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>What's included</div>
                {(fulfillment === "ship" ? [
                  "Board-certified doctor review",
                  "Medication included in price",
                  "Free discreet shipping to your door",
                  hasDoses ? "Doctor reviews and approves your exact dose" : "Supplies included",
                ] : isService ? [
                  "Board-certified doctor review", product.serviceLabel,
                ] : [
                  "Board-certified doctor review",
                  "E-prescription sent to your pharmacy",
                  product.isAcute ? "Pick up as soon as today" : "Same-day pickup",
                ]).map((txt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, fontSize: 12, color: T.body }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: T.greenLight, color: T.green, flexShrink: 0 }}><Chk /></div>
                    {txt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GOODRX */}
          {fulfillment === "pharmacy" && product.slug && (
            <div style={{ marginTop: 12, background: T.goldLight, border: "2px solid #FDE68A", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 12, color: T.heading, marginBottom: 2 }}>Check what you'll pay at the pharmacy</div>
              <p style={{ fontSize: 11, color: T.body, lineHeight: 1.5, margin: "0 0 8px" }}>
                The ${product.pharmacyFee || 25} covers your doctor visit. Meds are separate — insurance may cover them.
              </p>
              <a href={`https://www.goodrx.com/${product.slug}`} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 5, background: T.white, border: "1.5px solid #FDE68A",
                padding: "6px 12px", borderRadius: 50, fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 11, color: "#92400E", textDecoration: "none",
              }}>Check Prices on GoodRx <Ext /></a>
            </div>
          )}
        </div>

        {/* RIGHT: PRICE + CTA */}
        <div style={{ flex: "0 0 200px", position: "sticky", top: 20 }}>
          <div style={{ transform: bounce ? "scale(1.03)" : "scale(1)", transition: "transform 0.2s" }}>
            <div style={{ background: T.gray50, borderRadius: 14, padding: "24px 16px", textAlign: "center", border: `1px solid ${T.border}` }}>
              {pd.price === "—" ? (
                <span style={{ fontSize: 44, fontWeight: 700, fontFamily: "Poppins,sans-serif", color: "#D1D1D1" }}>—</span>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "Poppins,sans-serif", color: T.heading }}>$</span>
                  <span style={{ fontSize: 48, fontWeight: 700, fontFamily: "Poppins,sans-serif", color: T.heading, lineHeight: 1 }}>{pd.price}</span>
                </div>
              )}
              {pd.sub && <div style={{ fontSize: 14, color: T.body, fontWeight: 500, marginTop: 3 }}>{pd.sub}</div>}
              {pd.note && <div style={{ fontSize: 11, color: T.body, marginTop: 6, background: T.white, borderRadius: 8, padding: "5px 8px", border: `1px solid ${T.border}` }}>{pd.note}</div>}
              {pd.extra && <div style={{ marginTop: 8, fontSize: 10, color: T.blue, fontWeight: 600, background: T.blueLight, padding: "5px 8px", borderRadius: 8 }}>{pd.extra}</div>}

              {/* Per-month breakdown for multi-month dose products */}
              {pd.breakdown && pd.breakdown.length > 1 && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: T.body, marginBottom: 4 }}>Monthly breakdown</div>
                  {pd.breakdown.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.body, padding: "2px 0" }}>
                      <span>Mo {i + 1}: {b.mg}</span>
                      <span style={{ fontWeight: 600, color: b.tier === "maintenance" ? T.blue : T.green }}>${b.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button disabled={!canSubmit} onClick={() => {
            const lines = [`Product: ${product.name}`, `Fulfillment: ${fulfillment}`, `Duration: ${duration} month(s)`, `Price: $${pd.price}${pd.sub ? "/mo" : ""}`];
            if (monthDoses.filter(Boolean).length) lines.push(`Doses: ${monthDoses.join(" → ")}`);
            if (pd.breakdown) lines.push(`Total: $${pd.breakdown.reduce((s, b) => s + b.price, 0)}`);
            alert("Added to cart!\n\n" + lines.join("\n"));
          }} style={{
            width: "100%", marginTop: 10, padding: "13px 16px", borderRadius: 50, border: "none",
            background: canSubmit ? T.red : "#D1D1D1", color: "#fff",
            fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 14,
            cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
          }}>
            Get Started <span style={{ fontSize: 16 }}>&rarr;</span>
          </button>

          {!canSubmit && <p style={{ textAlign: "center", fontSize: 10, color: T.body, marginTop: 5 }}>{pd.note || "Complete all selections above"}</p>}

          <div style={{ marginTop: 16 }}>
            {["HIPAA Compliant", "Board-Certified MDs", "Cancel Anytime"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 10, color: T.body }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.pink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                </div>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px 32px", fontSize: 10, color: "#AAA", lineHeight: 1.5 }}>
        &dagger;All plans subject to healthcare provider approval. Your selected dose(s) are reviewed and approved by your medical provider before any medication is dispensed. Prices reflect the tier for each dose selected.
      </div>
    </div>
  );
}
