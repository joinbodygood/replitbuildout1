# Insurance Coverage Probability Checker — Design Spec

**Project:** Body Good Studio — Free GLP-1 Coverage Probability Tool
**Owner:** Dr. Linda Moleon
**Date:** 2026-03-28
**Status:** Approved — ready for implementation planning

---

## Purpose

A free, no-PII lead magnet tool that estimates insurance coverage probability for GLP-1 weight loss medications (Wegovy, Zepbound, Mounjaro, Ozempic). Lives at `/pages/check-my-odds` on joinbodygood.com, linked from site-wide CTAs and paid ad campaigns.

This is the **top of funnel** — it feeds the $25 verified coverage check (Stedi API) and self-pay programs.

## User Flow

```
Ad / CTA button → Landing hero → 6-step quiz → Email capture → Animated calc → Results
                                                                                  ↓
                                                         ≥75% → $25 confirmation CTA (primary)
                                                         30-74% → "Worth exploring" + $25 CTA
                                                         <30% → Self-pay redirect + alternatives
                                                         Always → inline disclaimers
```

## What This Tool Is NOT

- It does NOT verify actual insurance benefits (that's the $25 check via Stedi)
- It does NOT collect member IDs, DOB, or insurance card info
- It does NOT guarantee coverage at any point
- It does NOT constitute medical advice

---

## Architecture

### Frontend
- **React component** (single JSX file with embedded styles)
- Hosted as a standalone page on joinbodygood.com (`/pages/check-my-odds`)
- Also usable as an embedded component on landing pages
- No external CSS dependencies — self-contained with inline styles
- Fonts: Poppins (headings), Manrope (body) via Google Fonts

### Probability Engine
- **Client-side only** — no API calls, no backend for the free checker
- Uses the full `glp1-probability-database.json` logic embedded in the component
- Calculates per-medication probability based on: carrier, state, plan type, employer size, diagnoses, BMI range
- Applies carrier-specific state data, employer size modifiers, diagnosis boosts, mandate state bonuses, restricted state penalties

### Data Flow
```
User answers 6 questions
  → Email/phone captured (sent to Zoho CRM or email service)
  → Client-side probability engine runs
  → Results rendered with per-medication scores
  → If ≥75%: CTA links to Shopify $25 eligibility check product
  → If <30%: CTA links to self-pay Shopify products
```

---

## Quiz Steps

### Step 1: Insurance Company (search/typeahead)
- 60+ insurers in searchable dropdown
- Includes all carriers from probability database + additional regional BCBS plans
- "Other" option with free-text input
- Auto-advances on selection

### Step 2: How do you get your insurance? (single select)
- Through my employer
- ACA Marketplace (Healthcare.gov)
- Medicaid
- Medicare
- TRICARE (military)
- VA Health
- BCBS Federal Employee Program
- Determines plan type modifiers, catches instant disqualifiers

### Step 3: Employer size (single select, CONDITIONAL)
- Only shows if Step 2 = "Through my employer"
- Large (5,000+ employees)
- Mid-size (500-4,999)
- Small (under 500)
- Government / Federal
- Self-employed
- Not sure
- Maps to `employer_size_modifiers` in probability database

### Step 4: State (grid selector, 50 states + DC)
- Drives mandate state bonuses, restricted state penalties, carrier-specific state data
- Shows subtle inline note if mandate state selected: "Your state requires fully-insured plans to cover weight loss medication"
- Shows warning if restricted state: "Some insurers in your state have recently limited coverage"

### Step 5: Health conditions (multi-select)
- Type 2 Diabetes
- Prediabetes / Insulin Resistance
- Obesity (BMI 30+)
- Sleep Apnea (OSA)
- Heart Disease / Cardiovascular
- Metabolic Syndrome
- PCOS
- MASH / Fatty Liver Disease
- None / Not sure
- "None" clears other selections (mutual exclusion)
- Each diagnosis maps to `diagnosis_boosts` and unlocks indication pathways

### Step 6: BMI Range (single select)
- Under 27
- 27-29.9
- 30-34.9
- 35-39.9
- 40+
- Not sure
- Affects base eligibility, Medicare GENEROUS bridge qualification, Blue Shield CA threshold

### Email Capture (gate before results)
- First name (required)
- Email (required)
- Phone (optional, labeled "for text updates")
- "Show My Results" button
- Subtext: "We'll send your results + coverage tips. No spam, ever. Unsubscribe anytime."

### Calculating Screen (2.5s animation)
- Spinner with "Analyzing your profile..."
- Subtext: "Cross-referencing your insurer, state, and health profile against coverage data"

---

## Probability Engine Logic

### Carrier Resolution
Map user's selected insurer to a carrier key in the database:
- Direct matches: "Cigna" → `cigna`, "Florida Blue" → `bcbs_fl`, etc.
- BCBS variants: match by state (e.g., BCBS + MA → `bcbs_ma`)
- Medicaid variants: match by state (e.g., Medicaid + FL → `medicaid_fl`, Medicaid + NY → `medicaid_ny`)
- TRICARE variants: all map to `tricare`
- Unknown carriers: use generic defaults based on plan type + state

### Per-Medication Scoring

For each of the 4 medications (Wegovy, Zepbound, Mounjaro, Ozempic):

1. **Find best indication** based on patient diagnoses:
   - Wegovy: CVD → CV Risk Reduction (55-70%) | MASH → MASH (45-55%) | default → Weight Management
   - Zepbound: OSA → Sleep Apnea (45-60%) | default → Weight Management
   - Mounjaro: T2D → Type 2 Diabetes (85-95%) | Prediabetes → Metabolic (50-65%) | default → Weight Management (low)
   - Ozempic: T2D → Type 2 Diabetes (85-95%) | default → Not approved for weight loss (0-5%)

2. **Look up base probability** from carrier → state → indication key in JSON database
   - If carrier+state combo exists, use it
   - If not, fall back to carrier's `_default` state
   - If carrier not in DB, use generic defaults from `pathway_matrix`

3. **Apply employer size modifier** (multiply base prob by modifier):
   - Large 5000+: x1.15
   - Medium 500-4999: x1.0
   - Small <500: x0.7
   - Government federal: x1.2
   - Government state: x0.9
   - Self-employed: x0.6
   - Marketplace/ACA: x0.5

4. **Apply diagnosis boosts** (add percentage, scaled by 0.3 to avoid double-counting primary indication):
   - T2D: +30% (shifts indication entirely)
   - CVD: +15%
   - OSA: +15%
   - Prediabetes: +10%
   - MASH: +10%
   - Metabolic: +8%
   - Obesity: +5%
   - PCOS: +3%

5. **Apply state-level adjustments**:
   - Mandate states (CT, DE, MD, NJ, VT, WV): if plan type is employer (not self-funded), boost by +8%
   - Restricted states (MA, MI, CA, PA): if Medicaid, flag as restricted with appropriate warning

6. **Apply BMI adjustments**:
   - BMI under 27: penalty -15% (most plans require 27+ with comorbidity or 30+)
   - BMI 27-29.9: no change if comorbidity present, -10% if none
   - BMI 40+: bonus +5% (meets even restrictive thresholds like Blue Shield CA)

7. **Cap at 95%** — never show 100%, it implies guarantee

### Overall Rating
- Best medication probability >= 60%: GREEN ("Good odds!")
- Best medication probability 30-59%: YELLOW ("Worth exploring")
- Best medication probability < 30%: RED ("Coverage unlikely")

---

## Results Page

### Overall Score Hero
- Large probability number for best medication (e.g., "78%")
- Color-coded background (green/amber/red gradient)
- Personalized: "{firstName}, based on your {insurer} plan in {stateName}..."
- Best medication name highlighted

### Inline Disclaimer Banner
Positioned between score hero and medication cards. Visible, not dismissible.

> "These estimates are based on published formulary data and carrier policies as of March 2026. **This is not a guarantee of coverage.** Body Good does not determine your insurance coverage at any point. Your actual coverage depends on your specific plan details, which can only be verified by checking your real benefits."

### Per-Medication Cards (4 cards)
Each card displays:
- Medication name (Wegovy, Zepbound, Mounjaro, Ozempic) + generic name + manufacturer
- Probability percentage with color-coded progress bar
- Rating label: "Good odds" / "Worth exploring" / "Low odds" / "Not covered"
- Recommended indication pathway
- One-line diagnosis insight (if applicable)
- Cards at 0% show "Not covered for weight loss" with explanation

### $25 Upsell Block — Three Variants

**Variant A: Best medication >= 75% (Green — strong push)**
- Green-tinted card
- Headline: "Great news — your odds look strong"
- Body: "Want to know for sure? For $25, we verify your actual insurance benefits in real-time and tell you exactly what's covered, what needs prior authorization, and your exact next steps."
- Button: "Confirm My Coverage — $25 ->"
- Links to Shopify $25 eligibility check product
- Sub-disclaimer: "This is a one-time, non-refundable eligibility verification fee. We check your actual benefits — not an estimate."

**Variant B: Best medication 30-74% (Amber — moderate push)**
- Amber-tinted card
- Headline: "Coverage is possible — let's find out"
- Body: "Your odds depend on your specific plan details. For $25, we'll check your actual benefits and find the strongest pathway for your situation."
- Button: "Check My Real Coverage — $25 ->"

**Variant C: Best medication < 30% (No $25 push — honest redirect)**
- No $25 CTA (avoids chargebacks on cases unlikely to result in coverage)
- Headline: "Insurance coverage is unlikely for weight loss"
- Body: Explains why (state restrictions, plan type, no comorbidity pathway, etc.)
- Shows alternative pathways clearly
- Primary CTA: "Start Self-Pay — from $169/mo ->" (links to self-pay Shopify products)
- Secondary: "Have a diagnosis we didn't capture? Retake the quiz ->"

### Self-Pay Fallback (always visible below upsell)
- "Don't want to deal with insurance? Start self-pay from $169/mo ->"
- Links to self-pay compounded semaglutide product

### Footer Disclaimer
- "Probability estimates based on published carrier formularies, state mandates, and Body Good clinical data as of March 2026. This tool provides estimates only — not guarantees. Body Good does not determine insurance coverage at any point. Insurance policies change frequently. Individual results depend on specific plan details. Created by Dr. Linda Moleon, DO — double board-certified in obesity medicine and anesthesiology."

---

## Brand Compliance

Per Body Good brand guide:
- **Colors:** 70% white, 20% soft pink #fde7e7, 10% brand red #ed1b1b. Green #28A745, Yellow #FFC107, Error #DC3545
- **Typography:** Poppins for headings (600/700/800), Manrope for body (400/500/600). H1: 48px desktop/32px mobile. Body: 18px/16px. Never <14px.
- **Buttons:** Pill shape (border-radius: 50px). Primary CTA includes -> arrow. Shadow: 0 4px 12px rgba(237,27,27,0.2). Mobile full-width below 768px. Min 44px touch target.
- **Cards:** White bg, border-radius 12px, shadow 0 4px 12px rgba(0,0,0,0.08). Hover: scale(1.02).
- **Voice:** Medical authority + empathetic friend. Use "medical weight loss", "start your medical review". Avoid "diet pills", "overnight results".
- **Compliance:** Never guarantee coverage. "Results may vary" on all claims. Non-refundable language on $25 checkout.

---

## Disclaimers (Required — Non-Negotiable)

1. **Landing page:** "This tool provides estimated probabilities only. It does not verify your actual insurance benefits or guarantee coverage."
2. **Inline results banner:** Full disclaimer (see Results Page section above)
3. **Each medication card:** Probability labeled as "est. approval probability"
4. **$25 upsell:** "This is a one-time, non-refundable eligibility verification fee."
5. **Footer:** Full legal disclaimer with date, source attribution, and physician credentials
6. **Throughout:** Never use language like "you're covered", "guaranteed", or "we determine coverage"

---

## Technical Notes

- **No backend needed** for the free checker — all probability logic runs client-side
- **Email capture** should POST to whatever email service Body Good uses (Klaviyo, Zoho, etc.) — implementation detail for the plan
- **$25 CTA** links to existing Shopify product URL for the eligibility check
- **Self-pay CTA** links to existing Shopify self-pay product URLs
- **Mobile-first** — majority of Body Good traffic is mobile
- **No tracking pixels on PII pages** — HIPAA compliance (email/phone capture page should be clean)
- **Performance:** No external API calls = instant results after the 2.5s animation

---

## Success Metrics

- Quiz completion rate (landing -> results)
- Email capture rate
- $25 conversion rate from results page
- Self-pay conversion rate from <30% results
- Ad click-through to quiz start rate
