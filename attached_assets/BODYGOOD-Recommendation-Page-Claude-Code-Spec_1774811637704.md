# Body Good — Recommendation Page Build Spec
## Claude Code Implementation Document

**Owner:** Dr. Linda Moleon | **Dev:** Ayush | **Date:** March 29, 2026
**Route:** `/quiz/recommendation` | **Framework:** Next.js (React) | **Stack:** Next.js + PostgreSQL + PayPal

---

## WHAT THIS PAGE DOES

After any quiz (weight loss, hair, skin, feminine health, mental health, wellness injections), the customer lands on this ONE universal recommendation page. The quiz has already narrowed down to exactly ONE product (identified by SKU). This page lets the customer configure HOW they get it and — for dose-based products — select their EXACT dose per month. The price updates in real time.

---

## PAGE LAYOUT

Two columns on desktop. Single column stacked on mobile.

```
┌─────────────────────────────────────────────────────────────┐
│  Top bar: "Board-Certified Doctors · Licensed in 20 States" │
│  Nav: bodygood logo (centered)                              │
├─────────────────────────────────────────────────────────────┤
│  Hero: Green "Based on Your Quiz Results" badge             │
│  Product name (h1) + description + "Best for:" line        │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│  Step 1: Fulfillment toggle      │   PRICE DISPLAY          │
│  ──────────────────────────      │   (sticky on scroll)     │
│  Step 2: Shipping frequency      │                          │
│  ──────────────────────────      │   $ amount               │
│  Step 3: Dose selection          │   per month / total      │
│  (only for dose products)        │   breakdown per month    │
│  ──────────────────────────      │                          │
│  What's included checklist       │   [Get Started →]        │
│                                  │   Trust signals          │
│  ─── GoodRx Banner ───          │                          │
│  (pharmacy pickup only)          │                          │
│                                  │                          │
├──────────────────────────────────┴──────────────────────────┤
│  Footer disclaimer                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## THE 3-STEP CONFIGURATOR

### Step 1: How do you want to get your meds?

Pill-shaped toggle buttons. Which options appear depends on the product's `type` field:

| Product `type` | What the customer sees | Auto-select behavior |
|---|---|---|
| `compounded` | Only "Ship to me — meds included" appears | Auto-selected. Skip to Step 2. |
| `pharmacy_only` | Only "Pick up at pharmacy — $XX" appears | Auto-selected. Skip to What's Included. |
| `both` | BOTH options appear side by side | Customer must choose one. |
| `service` | No fulfillment step shown at all | Skip entire step. Show service price. |

**When "Ship to me" is selected:** Show pink info bar: "Free shipping" + "Medication included"
**When "Pharmacy pickup" is selected:** Show blue info bar: "Same-day pickup" + "Insurance accepted"

### Step 2: Shipping frequency

Only appears when fulfillment = "ship" AND the product has multiple price tiers (1-mo, 3-mo, 6-mo).

Three pill toggles:
- "Every month"
- "Every 3 months" 
- "Every 6 months" (with green SAVE badge)

If the product only has a single price (e.g., `prices: { 1: 49 }`), auto-select "Every month" and skip this step.

### Step 3: What is your dose?

**ONLY appears for products that have a `doses` array in their data.** This is the critical step for GLP-1 injectables.

The number of dose selection rows = the `duration` selected in Step 2.

- **1-month plan:** 1 row → "What is your dose?" → pick one dose
- **3-month plan:** 3 rows → "Month 1", "Month 2", "Month 3" → pick dose for each month
- **6-month plan:** 6 rows → "Month 1" through "Month 6" → pick dose for each month

Each row shows ALL available doses as pill buttons. Each dose button shows:
- The mg amount (bold, large)
- "Starter" or "Maint." label underneath (if the product has tiered pricing)
- A tag like "Starting dose" or "Max dose" for the first/last options

Above the dose rows, show a tier legend:
```
Starter: $279/mo  |  Maintenance: $329/mo
```
(prices change based on the duration selected in Step 2)

Each row also shows the per-month price on the right side, which updates as the customer picks that month's dose.

**WHY THIS MATTERS:** The exact dose per month is what gets sent to the medical doctor for review and approval. The doctor signs off on the specific dose — this is not optional data. It also determines the vial size FCC ships.

---

## REAL-TIME PRICING ENGINE

The price display on the right updates live as the customer makes selections. Here is the exact calculation logic:

### For products WITHOUT doses (hair, skin, feminine, mental, wellness):

```typescript
if (fulfillment === "pharmacy") {
  price = product.pharmacyFee  // e.g., $25 or $35 or $49
} else {
  price = product.prices[duration]  // e.g., prices[3] = $119
  if (duration > 1) {
    displayPrice = Math.round(price / duration)  // show per-month
    displayTotal = price                          // show "Total: $357"
  }
}
```

### For products WITH doses (Tirzepatide, Semaglutide injectables):

```typescript
// Each month's dose maps to a tier (starter or maintenance)
// Each tier has its own price at each duration level

let total = 0
for (let i = 0; i < duration; i++) {
  const dose = product.doses.find(d => d.mg === monthDoses[i])
  const tier = dose.tier  // "starter" or "maintenance" or "flat"
  const monthPrice = product.tierPricing[tier][duration]
  total += monthPrice
}

displayPrice = Math.round(total / duration)  // average per month
displayTotal = total

// Show breakdown:
// Mo 1: 5mg — $279 (Starter)
// Mo 2: 7.5mg — $279 (Starter)  
// Mo 3: 10mg — $329 (Maintenance)
// Total: $887
```

### Price display states:

| State | Shows |
|---|---|
| Nothing selected yet | "—" with helper text |
| Fulfillment selected, no duration yet | "—" + "Choose shipping frequency" |
| Ship + duration, but doses not all selected | "—" + "Select dose for each month" |
| All selections complete | Big price number + sub + total + breakdown |
| Pharmacy selected | Flat fee + "meds paid at pharmacy" badge |

---

## COMPLETE PRODUCT DATABASE

This is the exact data structure. Every product the quiz can return lives here. Copy this into the codebase as the source of truth.

```typescript
// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

interface Dose {
  mg: string;       // "2.5mg", "5mg", "10mg", etc.
  tier: string;     // "starter" | "maintenance" | "flat"
  label: string;    // Display label
  tag?: string;     // "Starting dose", "Max dose", "Starter max"
}

interface TierPricing {
  [tierName: string]: {
    [duration: number]: number;  // { 1: 299, 3: 279, 6: 259 }
  }
}

interface Product {
  sku: string;
  name: string;
  program: string;
  type: "compounded" | "pharmacy_only" | "both" | "service";
  description: string;
  bestFor: string;
  slug?: string;              // GoodRx drug slug for pharmacy lookup link
  
  // For non-dose products:
  prices?: Record<number, number>;   // { 1: 69, 3: 59, 6: 49 }
  
  // For dose products:
  doses?: Dose[];
  tierPricing?: TierPricing;
  
  // For pharmacy path:
  pharmacyFee?: number;       // One-time consult fee
  ongoingFee?: number;        // Monthly management fee (mental health)
  
  // For service products:
  servicePrice?: number;
  serviceLabel?: string;
  
  // Flags:
  onetimePrice?: number;      // One-time purchase option price
  isAcute?: boolean;          // UTI/yeast/BV — one-time treatment
}
```

### WEIGHT LOSS — SELF PAY INJECTABLES

```typescript
// ── TIRZEPATIDE — HAS DOSE TIERS ──
{
  sku: "WM-TIR-INJ",
  name: "Tirzepatide Injection",
  program: "Weight Loss — Self Pay",
  type: "compounded",
  description: "Compounded Tirzepatide / B6 (Pyridoxine) Injectable",
  bestFor: "Most effective GLP-1 — dual action (GLP-1 + GIP)",
  slug: "tirzepatide",
  onetimePrice: 315,
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
}

// ── SEMAGLUTIDE — FLAT PRICING ACROSS ALL DOSES ──
{
  sku: "WM-SEM-INJ",
  name: "Semaglutide Injection",
  program: "Weight Loss — Self Pay",
  type: "compounded",
  description: "Compounded Semaglutide / B6 (Pyridoxine) Injectable",
  bestFor: "Proven GLP-1 for steady, sustainable weight loss",
  slug: "semaglutide",
  onetimePrice: 179,
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
}
```

### WEIGHT LOSS — ORAL

```typescript
{
  sku: "WM-ORAL-SEM",
  name: "Glow Rx — Oral Semaglutide",
  program: "Weight Loss — Oral",
  type: "compounded",
  description: "Sublingual Semaglutide Tablets · 28ct · No needles",
  bestFor: "Needle-free GLP-1 weight loss",
  slug: "semaglutide",
  onetimePrice: 149,
  prices: { 1: 129, 3: 119, 6: 109 },
}

{
  sku: "WM-ORAL-TIR",
  name: "Glow Rx — Oral Tirzepatide",
  program: "Weight Loss — Oral",
  type: "compounded",
  description: "Sublingual Tirzepatide Tablets · No needles",
  bestFor: "Most effective GLP-1 without injections",
  slug: "tirzepatide",
  prices: { 1: 129, 3: 119, 6: 109 },
}

{
  sku: "WM-ORAL-METCOMBO",
  name: "Metformin + Topiramate Combo",
  program: "Weight Loss — Oral",
  type: "compounded",
  description: "Compounded capsules — insulin resistance + appetite control",
  bestFor: "PCOS, pre-diabetes, or insulin resistance",
  prices: { 1: 79 },
}

{
  sku: "WM-ORAL-LDN",
  name: "Low-Dose Naltrexone",
  program: "Weight Loss — Oral",
  type: "compounded",
  description: "LDN 4.5mg capsules — cravings & inflammation",
  bestFor: "Emotional eating and food cravings",
  prices: { 1: 49 },
}
```

### WEIGHT LOSS — INSURANCE (SERVICE)

```typescript
{ sku: "INS-ELIG", name: "Insurance Eligibility Check", program: "Weight Loss — Insurance", type: "service", description: "Verify your insurance GLP-1 coverage", bestFor: "Patients with insurance", servicePrice: 25, serviceLabel: "One-time eligibility check" }
{ sku: "INS-PA", name: "Prior Authorization Processing", program: "Weight Loss — Insurance", type: "service", description: "PA submission + one appeal", bestFor: "Patients needing prior auth", servicePrice: 50, serviceLabel: "One-time PA processing" }
{ sku: "INS-APPROVE", name: "Insurance Approval Activation", program: "Weight Loss — Insurance", type: "service", description: "Activation upon approval", bestFor: "Newly approved patients", servicePrice: 85, serviceLabel: "One-time activation" }
{ sku: "INS-ONGOING", name: "Insurance Ongoing Management", program: "Weight Loss — Insurance", type: "service", description: "Monthly support, refills, appeals", bestFor: "Approved patients needing management", servicePrice: 75, serviceLabel: "Monthly management" }
```

### WEIGHT LOSS — BRANDED RX

```typescript
{
  sku: "WM-BRAND-MGMT",
  name: "Branded Rx Management (Wegovy/Zepbound)",
  program: "Weight Loss — Branded Rx",
  type: "pharmacy_only",
  description: "Prescription for Wegovy or Zepbound sent to your pharmacy",
  bestFor: "Patients who want brand-name medication",
  slug: "wegovy",
  pharmacyFee: 55,   // one-time
  ongoingFee: 45,    // monthly subscription
  // sixMonthFee: 25  // 6-month rate
}
```

### WEIGHT LOSS — ADD-ONS

```typescript
{ sku: "WM-ADDON-ZOFRAN", name: "Ondansetron 4mg (Anti-Nausea)", program: "Weight Loss — Add-On", type: "both", description: "Dissolving tablets — stops GLP-1 nausea", bestFor: "GLP-1 nausea relief", slug: "ondansetron", prices: { 1: 29 }, pharmacyFee: 25 }
{ sku: "WM-ADDON-BUPNAL", name: "Bupropion + Naltrexone + Chromium", program: "Weight Loss — Add-On", type: "compounded", description: "Appetite + cravings combo capsules", bestFor: "Weight loss plateaus", prices: { 1: 69 } }
```

### WELLNESS INJECTIONS (ALL SHIP ONLY)

```typescript
{ sku: "WI-B12",   name: "Vitamin B12 Injection",   prices: { 1: 49 },       bestFor: "Energy, fatigue, GLP-1 support" }
{ sku: "WI-LIPOC", name: "Lipo-C Injection",        prices: { 1: 99 },       bestFor: "Fat metabolism and energy" }
{ sku: "WI-LSB",   name: "Lipotropic Super B",      prices: { 1: 99, 3: 89 }, bestFor: "Energy, fat-burning, metabolism" }
{ sku: "WI-LCAR",  name: "L-Carnitine Injection",   prices: { 1: 99 },       bestFor: "Fat burning, muscle preservation" }
{ sku: "WI-GLUT",  name: "Glutathione Injection",   prices: { 1: 149 },      bestFor: "Detox, skin, cellular health" }
{ sku: "WI-NAD",   name: "NAD+ Injection",          prices: { 1: 199 },      bestFor: "Anti-aging, brain, longevity" }
{ sku: "WI-SERM",  name: "Sermorelin Injection",    prices: { 1: 179 },      bestFor: "Muscle, sleep, recovery" }
// All wellness injections: type: "compounded", program: "Wellness Injections"
```

### HAIR LOSS

```typescript
{ sku: "HL-W-MINOX",   name: "Minoxidil Topical (Women)",      type: "both",       prices: { 1: 59 },  pharmacyFee: 25, slug: "minoxidil" }
{ sku: "HL-W-PEPTIDE",  name: "Scalp Peptide Serum (Women)",   type: "compounded", prices: { 1: 79 } }
{ sku: "HL-M-FIN",      name: "Finasteride 1mg",               type: "both",       prices: { 1: 35 },  pharmacyFee: 25, slug: "finasteride" }
{ sku: "HL-M-COMBO",    name: "Hair Restore Combo Spray",      type: "both",       prices: { 1: 59 },  pharmacyFee: 25, slug: "minoxidil" }
{ sku: "HL-M-MAX",      name: "Hair Restore Max 7-Ingredient", type: "compounded", prices: { 1: 79 } }
{ sku: "HL-ORAL-MINOX", name: "Oral Minoxidil 2.5mg",          type: "both",       prices: { 1: 35 },  pharmacyFee: 25, slug: "minoxidil" }
{ sku: "HL-DUTAST",     name: "Dutasteride 0.5mg",             type: "both",       prices: { 1: 49 },  pharmacyFee: 25, slug: "dutasteride" }
// All: program: "Hair Loss"
```

### SKINCARE

```typescript
{ sku: "SK-GLOW",    name: "Glow Cream",             type: "both",       prices: { 1: 69 },  pharmacyFee: 25, slug: "tretinoin" }
{ sku: "SK-BRIGHT",  name: "Bright Cream",           type: "both",       prices: { 1: 89 },  pharmacyFee: 25, slug: "hydroquinone" }
{ sku: "SK-EVEN",    name: "Even Tone Cream",        type: "both",       prices: { 1: 85 },  pharmacyFee: 25, slug: "hydroquinone" }
{ sku: "SK-CLEAR",   name: "Clear Skin Combo",       type: "both",       prices: { 1: 69 },  pharmacyFee: 25, slug: "spironolactone" }
{ sku: "SK-ROSACEA", name: "Rosacea Calm Cream",     type: "both",       prices: { 1: 55 },  pharmacyFee: 25, slug: "metronidazole" }
{ sku: "SK-ANTIAGE", name: "Age-Defying Cream",      type: "compounded", prices: { 1: 79 } }
// All: program: "Skincare"
```

### FEMININE HEALTH

```typescript
{ sku: "FH-UTI",      name: "UTI Treatment",             type: "pharmacy_only", pharmacyFee: 35, isAcute: true, slug: "nitrofurantoin" }
{ sku: "FH-YEAST",    name: "Yeast Infection Treatment",  type: "pharmacy_only", pharmacyFee: 35, isAcute: true, slug: "fluconazole" }
{ sku: "FH-BV",       name: "BV Treatment",              type: "pharmacy_only", pharmacyFee: 35, isAcute: true, slug: "metronidazole" }
{ sku: "FH-VAGDRY",   name: "Vaginal Dryness Rx",        type: "both",       prices: { 1: 65 },  pharmacyFee: 25, slug: "estradiol" }
{ sku: "FH-SCREAM1",  name: "Intimate Wellness Cream",   type: "compounded", prices: { 1: 65 } }
{ sku: "FH-SCREAM2",  name: "Intimate Wellness Plus",    type: "compounded", prices: { 1: 75 } }
{ sku: "FH-OXYTOCIN", name: "Connection Rx (Oxytocin)",  type: "compounded", prices: { 1: 79 } }
// All: program: "Feminine Health"
```

### MENTAL HEALTH

```typescript
{ sku: "MW-ANXIETY",   name: "Calm Rx (Buspirone)",       type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "buspirone" }
{ sku: "MW-STAGE",     name: "Stage Ready (Propranolol)", type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "propranolol" }
{ sku: "MW-SLEEP",     name: "Sleep Rx",                  type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "trazodone" }
{ sku: "MW-LIFT-SSRI", name: "Lift Rx (SSRI)",            type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "sertraline" }
{ sku: "MW-LIFT-SNRI", name: "Lift Rx Plus (SNRI)",       type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "venlafaxine" }
{ sku: "MW-MOMENTUM",  name: "Momentum Rx (Bupropion)",   type: "pharmacy_only", pharmacyFee: 49, ongoingFee: 25, slug: "bupropion" }
{ sku: "MW-SELANK",    name: "Selank Nasal Spray",        type: "compounded",    prices: { 1: 129 } }
// All: program: "Mental Health"
```

---

## CART DATA — WHAT GETS SENT ON "GET STARTED"

```typescript
interface CartItem {
  sku: string;                          // "WM-TIR-INJ"
  fulfillment_type: "ship_to_me" | "pharmacy_pickup" | "service";
  product_name: string;                 // "Tirzepatide Injection"
  duration_months: number;              // 1, 3, or 6
  
  // For non-dose products:
  price: number;                        // total for the cycle
  per_month_price: number | null;       // only if duration > 1
  
  // For dose products:
  monthly_doses: string[] | null;       // ["5mg", "7.5mg", "10mg"] or null
  monthly_prices: number[] | null;      // [279, 279, 329] or null
  total_price: number;                  // sum of monthly_prices
  
  // Routing:
  includes_medication: boolean;         // true for ship, false for pharmacy
  requires_pharmacy_selection: boolean; // true for pharmacy path
  goodrx_drug_slug: string | null;      // for GoodRx link
  quiz_session_id: string;              // links back to quiz answers
}
```

### PHARMACY SELECTION (next screen after cart, pharmacy_pickup only)

```typescript
interface PharmacySelection {
  pharmacy_name: string;
  pharmacy_zip: string;
  pharmacy_phone?: string;
}
// This data feeds into DoseSpot for e-prescription routing
```

---

## CONDITIONAL DISPLAY RULES (SUMMARY)

```
IF product.type === "compounded":
  → Auto-select "Ship to me"
  → Show Step 2 (frequency) if multiple price tiers
  → Show Step 3 (dose) if product.doses exists
  → Never show GoodRx banner
  → Never show pharmacy option

IF product.type === "pharmacy_only":
  → Auto-select "Pick up at pharmacy"
  → Skip Step 2 and Step 3 entirely
  → Show GoodRx banner if product.slug exists
  → Show price = pharmacyFee
  → If ongoingFee exists, show "+ $XX/mo ongoing management"

IF product.type === "both":
  → Show BOTH fulfillment options
  → If customer picks "Ship to me":
    → Show Step 2 (frequency)
    → Show Step 3 (dose) if product.doses exists
    → Hide GoodRx
  → If customer picks "Pharmacy pickup":
    → Skip Step 2 and Step 3
    → Show GoodRx banner
    → Price = pharmacyFee

IF product.type === "service":
  → Skip all steps
  → Show servicePrice + serviceLabel directly
  → No fulfillment toggle, no frequency, no doses
```

---

## GOODRX INTEGRATION

When the customer selects "Pharmacy pickup" AND the product has a `slug` field:

Show an amber/gold banner below the configurator card with:
- Headline: "Check what you'll pay at the pharmacy"
- Body: "The $XX covers your doctor visit. Meds are separate — your insurance may cover them."
- Button: "Check Prices on GoodRx →" links to `https://www.goodrx.com/{product.slug}` in a new tab

**Phase 1 (NOW):** Dynamic link to goodrx.com/{slug}. Free, no API key needed.
**Phase 2 (LATER):** Apply for API key at goodrx.com/developer/apply to embed search widget.
**Phase 3 (FUTURE):** V2 Price Compare API for inline pharmacy prices.

---

## DESIGN SYSTEM

### Colors

| Token | Hex | Usage |
|---|---|---|
| Red (Primary) | `#ED1B1B` | CTA buttons, active selections, recommended badge border |
| Soft Pink | `#FDE7E7` | Selected pill background, ship info bar, trust icons |
| Heading | `#0C0D0F` | All heading text, dark elements |
| Body Text | `#55575A` | Paragraph text, descriptions |
| Border | `#E5E5E5` | Card borders, dividers, unselected pills |
| Green | `#1B8A4A` | Check icons, completed steps, starter tier label, savings text |
| Green Light | `#E8F5EE` | Check icon backgrounds, starter badges |
| Blue | `#1A6EED` | Pharmacy badges, maintenance tier label, info icons |
| Blue Light | `#EBF2FF` | Pharmacy info bar, maintenance badges |
| Gold | `#F59E0B` | GoodRx banner accent |
| Gold Light | `#FFFBEB` | GoodRx banner background |

### Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Page title (h1) | Poppins | 700 | 21-24px |
| Step labels | Poppins | 600 | 13px |
| Pill buttons | Poppins | 600-700 | 13-14px |
| Price number | Poppins | 700 | 48px |
| Body text | Manrope | 400-500 | 11-14px |
| CTA button | Poppins | 600 | 14px |
| Dose pills - mg | Poppins | 700 | 14px |
| Dose pills - tier | Manrope | 400 | 9px |
| Tier legend | Poppins | 600 | 10px |
| Month breakdown | Manrope | 400-600 | 11px |

### Components

- **Pill toggle buttons:** `border-radius: 50px`, `2px solid border`, red border + pink bg when selected
- **Dose pills:** `border-radius: 10px`, smaller, centered text with mg + tier label stacked
- **CTA button:** `border-radius: 50px`, full width, red bg, white text, `→` arrow, disabled = gray `#D1D1D1`
- **Cards/panels:** `border-radius: 14px`, `1px solid border`
- **Step number circles:** 24px, green when done (with checkmark), red when active, gray when upcoming
- **Price card:** Centered, `$` small + number large, subtle gray bg, rounded corners
- **No emojis anywhere** — use SVG icons only
- **Mobile:** Single column. Price card + CTA moves below the configurator (not sticky on mobile).

### Fonts to load

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## COMPONENTS TO BUILD

| Component | Description | Dynamic? |
|---|---|---|
| `<RecommendationPage>` | Parent. Receives SKU from quiz, looks up product, renders everything | Yes — quiz data |
| `<FulfillmentStep>` | "Ship to me" / "Pharmacy" pill toggles + info bars | Yes — product type |
| `<FrequencyStep>` | 1/3/6 month pill toggles | Yes — available tiers |
| `<DoseStep>` | Per-month dose selection rows with tier-aware pricing | Yes — doses, duration |
| `<MonthDoseRow>` | Single month's dose picker row with all dose pills + price | Yes — month num, selection |
| `<DosePill>` | Individual dose button (mg + tier label + tag) | Yes — dose data |
| `<PriceDisplay>` | Sticky price card with live updates, breakdown, total | Yes — all selections |
| `<IncludesChecklist>` | "What's included" green-check list | Yes — fulfillment type |
| `<GoodRxBanner>` | Gold banner with GoodRx link | Yes — slug, pharmacyFee |
| `<StepIndicator>` | Step number circle (done/active/upcoming) | Yes — state |

---

## PAGE FLOW: WHAT HAPPENS AFTER "GET STARTED"

```
Customer clicks "Get Started →"
  ↓
IF fulfillment === "ship_to_me":
  → Go to checkout with cart data
  → Shipping address collection
  → PayPal payment
  → Order submitted to admin dashboard
  → Doctor reviews (including exact dose per month)
  → If approved: FCC ships medication
  
IF fulfillment === "pharmacy_pickup":
  → Go to PHARMACY SELECTION screen first
  → Customer enters pharmacy name + zip + phone
  → Then checkout (PayPal for consult fee only)
  → Doctor reviews
  → If approved: e-prescription sent to chosen pharmacy via DoseSpot
  → Customer picks up at pharmacy and pays pharmacy directly
  
IF type === "service":
  → Go to checkout directly
  → PayPal payment for service fee
  → Service delivered (eligibility check, PA, etc.)
```

---

## EDGE CASES

| Scenario | Behavior |
|---|---|
| Customer hits `/quiz/recommendation` without quiz data | Redirect to quiz start page |
| Product has only 1 price tier (e.g., `{ 1: 49 }`) | Auto-select "Every month", hide frequency step |
| Product is `pharmacy_only` with `isAcute: true` | Show "One-time consult" label, no ongoing fee |
| Product is `pharmacy_only` with `ongoingFee` | Show "$49 consult" + "+ $25/mo ongoing management" |
| Semaglutide doses — flat pricing | Dose step still appears (doctor needs exact dose), but all months show same price |
| Customer changes frequency after selecting doses | Reset dose selections (monthDoses array resets to empty) |
| Customer changes fulfillment from ship to pharmacy | Hide dose step and frequency step entirely |
| Mobile viewport | Stack left/right columns. Price display above CTA at bottom. |

---

## ACCEPTANCE CRITERIA

- [ ] Page renders for ALL product types: compounded, pharmacy_only, both, service
- [ ] Fulfillment toggles show/hide correctly based on product type
- [ ] Frequency step shows only when ship + multiple price tiers
- [ ] Dose step shows only for products with `doses` array
- [ ] Dose step shows correct number of rows matching duration (1/3/6)
- [ ] Each dose row shows all available doses with tier labels
- [ ] Price updates in real time on EVERY selection change
- [ ] Mixed-tier pricing calculates correctly (starter months + maintenance months)
- [ ] Per-month breakdown shows in price card for multi-month dose products
- [ ] GoodRx banner only appears for pharmacy_pickup when slug exists
- [ ] GoodRx link opens correct drug page in new tab
- [ ] "Get Started" button disabled until ALL required selections are complete
- [ ] Cart data includes monthly_doses array with exact dose per month
- [ ] Pharmacy pickup triggers pharmacy selection screen before checkout
- [ ] Fully responsive — single column on mobile
- [ ] Body Good design system applied exactly (colors, fonts, spacing, no emojis)
- [ ] Direct URL without quiz data redirects to quiz
- [ ] Changing frequency resets dose selections
- [ ] Service products show simple single-price view

---

## REFERENCE FILES

| File | What It Is |
|---|---|
| `recommendation-configurator-v4-doses.jsx` | Working React mockup with demo switcher — test all products |
| `BodyGood-Master-Product-Catalog-By-Fulfillment.xlsx` | Master spreadsheet of all 48 products with FCC names, COGs, pricing |
| Brand guide Google Doc | ID: `1ir2v04UE2xPeWohp2MEFKHSi4k5WBKphJ3DS28sIjlY` |
| Pricing Matrix v2 | March 19, 2026 — single source of truth for all pricing |
