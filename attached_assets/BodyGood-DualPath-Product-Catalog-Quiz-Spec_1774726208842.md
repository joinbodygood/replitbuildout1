# Body Good Studio — Dual-Path Product Catalog & Quiz Spec
## "Order From Us" vs "Prescribe to My Pharmacy" — Complete Build Document

**Date:** March 28, 2026
**Pharmacy Partner (Path A):** Formulation Compounding Center (FCC)
**Path B:** Patient's local pharmacy (CVS, Walgreens, etc.) — patient uses their insurance

---

# THE DUAL-PATH MODEL

Every product page and every quiz result screen presents TWO options:

### Path A: "Ship It To Me" (Body Good Direct)
- Compounded medication from FCC, shipped to patient's door
- Body Good controls the product, the margin, and the experience
- Discreet packaging, free shipping (built into price)
- Patient pays Body Good directly via PayPal
- Requires Body Good medical consultation (included in product price)

### Path B: "Send to My Pharmacy"
- Body Good provider writes a prescription
- Sent electronically to patient's pharmacy of choice via DoseSpot
- Patient picks up and pays their pharmacy (insurance or cash price)
- Body Good charges a **consultation + prescription management fee**
- Patient still gets provider access, check-ins, and portal messaging

### Path B Fee Structure
| Service | Fee | Notes |
|---------|-----|-------|
| Initial Consultation + Rx | $49 | Covers intake review, Rx written, sent to pharmacy |
| Ongoing Management (monthly) | $25/mo | Check-ins, dose adjustments, refill management, messaging access |
| One-Time Acute Rx (UTI, Yeast, BV) | $35 | Single Rx, no ongoing management needed |

**Why this works:** The consultation fee is pure revenue with zero COGS. Even if a patient chooses Path B for every product, Body Good earns $49 upfront + $25/mo recurring. And many will convert to Path A once they experience the convenience.

---

# HOW IT LOOKS IN THE UI

On every product page and quiz result, the patient sees:

```
┌─────────────────────────────────────────┐
│  HAIR RESTORE COMBO SPRAY               │
│  Minoxidil + Finasteride + Biotin        │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │  SHIP TO ME  │  │ SEND TO MY       │  │
│  │              │  │ PHARMACY         │  │
│  │  $59/mo      │  │                  │  │
│  │              │  │ $49 consult      │  │
│  │ Compounded   │  │ + $25/mo mgmt   │  │
│  │ formula      │  │                  │  │
│  │ shipped free │  │ Use your         │  │
│  │ to your door │  │ insurance        │  │
│  │              │  │ at your pharmacy │  │
│  │ [Get Started]│  │ [Get Started]    │  │
│  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
```

---

# COMPLETE PRODUCT CATALOG WITH DUAL-PATH PRICING

## HAIR LOSS — WOMEN

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path A Margin | Path B (Rx to Pharmacy) |
|---|----------------------|---------------|---------|-------------|--------------|----------------------|
| W-H1 | Hair Restore Starter (Women) | Oral Minoxidil 2.5mg, 30ct | $12.00 | $39/mo | 67% | $49 consult + $25/mo mgmt. Rx: Minoxidil 2.5mg oral to pharmacy. |
| W-H2 | Hair Restore Topical (Women) | Minoxidil/Tretinoin/Fluocinolone/VitE/Melatonin 30mL | $34.00 | $59/mo | 42% | $49 consult + $25/mo mgmt. Rx: Minoxidil 2% topical to pharmacy (OTC alternative available). |
| W-H3 | Hair Restore Plus (Women) | Oral Minoxidil 2.5mg 30ct + GHK-Cu/Biotin Topical 30mL | $12 + $37 = $49 | $79/mo | 38% | $49 consult + $25/mo mgmt. Rx: Minoxidil oral + spironolactone to pharmacy. |
| W-H4 | Hair Restore Max (Women — Postmeno) | Minoxidil/Finasteride/Latanoprost/Arginine/Melatonin 30mL | $50.00 | $79/mo | 37% | $49 consult + $25/mo mgmt. Rx: Finasteride + minoxidil to pharmacy. |
| W-H5 | Scalp Peptide Serum | GHK-Cu/Biotin 0.5%/1% Topical Foam 30mL | $56.00 | $79/mo | 30% | Not available at pharmacy (compounded only). |
| W-H6 | Biotin Boost (Add-On) | GHK-Cu/Biotin Sublingual Tablet 30ct | $35.00 | $49/mo | 29% | $49 consult. Rx: Biotin supplement (OTC, no Rx needed). |

## HAIR LOSS — MEN

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path A Margin | Path B (Rx to Pharmacy) |
|---|----------------------|---------------|---------|-------------|--------------|----------------------|
| M-H1 | Hair Restore Rx (Men) | Oral Finasteride 1mg, 30ct | $15.00 | $35/mo | 57% | $49 consult + $25/mo mgmt. Rx: Finasteride 1mg to pharmacy. |
| M-H2 | Hair Restore Rx (Men — 3mo) | Oral Finasteride 1mg, 90ct | $17.00 | $89/3mo ($30/mo) | 81% | Same Path B as above. |
| M-H3 | Hair Restore Combo Spray (Men) | Minoxidil/Finasteride/Arginine/Biotin 30mL | $33.00 | $59/mo | 44% | $49 consult + $25/mo mgmt. Rx: Finasteride oral + minoxidil 5% topical (OTC) to pharmacy. |
| M-H4 | Hair Restore Max (Men) | Minoxidil/Finasteride/Latanoprost/Caffeine/Azelaic/Spironolactone/Melatonin 30mL | $50.00 | $79/mo | 37% | $49 consult + $25/mo mgmt. Rx: Finasteride + dutasteride to pharmacy. |
| M-H5 | Hair Restore Combo Spray (Men — 3mo) | Minoxidil/Finasteride/Arginine/Biotin 90mL | $90.00 | $149/3mo ($50/mo) | 40% | Same Path B. |
| M-H6 | Dutasteride Rx (Men — Advanced) | Oral Dutasteride 2.5mg, 30ct | $38.00 | $59/mo | 36% | $49 consult + $25/mo mgmt. Rx: Dutasteride to pharmacy. |

## SKINCARE

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path A Margin | Path B (Rx to Pharmacy) |
|---|----------------------|---------------|---------|-------------|--------------|----------------------|
| SK1 | Glow Cream (Anti-Aging/Acne) | Azelaic Acid 8% + Tretinoin 0.1% + Niacinamide 15% cream 30g | $45.00 | $69/mo | 35% | $49 consult + $25/mo mgmt. Rx: Tretinoin 0.025%/0.05%/0.1% to pharmacy. |
| SK2 | Glow Cream Gentle | Azelaic Acid 15% + Niacinamide 10% cream 30g (no tretinoin) | $60.00 | $79/mo | 24% | $49 consult. Rx: Azelaic acid 15% gel to pharmacy. |
| SK3 | Bright Cream (Hyperpigmentation) | Hydroquinone 8% + Tretinoin 0.1% + Azelaic Acid 15% + Kojic Acid 0.25% + Hydrocortisone 1% cream 30g | $68.00 | $89/mo | 24% | $49 consult + $25/mo mgmt. Rx: Tretinoin + hydroquinone 4% to pharmacy. |
| SK4 | Even Tone Cream | Hydroquinone 6% + Kojic Acid 3% + Tranexamic Acid 5% + Vitamin E 1% cream 30g | $62.00 | $85/mo | 27% | $49 consult + $25/mo mgmt. Rx: Hydroquinone 4% to pharmacy. |
| SK5 | Clear Skin Combo (Hormonal Acne) | Azelaic/Tretinoin/Niacinamide cream 30g + Spironolactone Rx to pharmacy | $45.00 (cream only) | $69/mo (cream) + Path B for spironolactone | 35% on cream | $49 consult. Rx: Spironolactone 50-100mg to pharmacy (insurance covers). |
| SK6 | Rosacea Calm Cream | Niacinamide 4% + Metronidazole 1% cream 30g | $35.00 | $55/mo | 36% | $49 consult. Rx: Metronidazole gel to pharmacy. |
| SK7 | Age-Defying Cream (Premium) | Estriol/Tretinoin/Alpha Lipoic Acid/HA/Vitamin C cream 30g | $55.00 | $79/mo | 30% | Not available at pharmacy (compounded only). |
| SK8 | Anti-Aging Peptide Cream | DMAE/Estriol/GHK-Cu/Ascorbic Acid/Sodium Hyaluronate 30g | $68.00 | $95/mo | 28% | Not available at pharmacy (compounded only). |

**Note on Bright Cream and Even Tone:** These are HUGE for WOC dealing with melasma and hyperpigmentation. The FCC formulas are significantly more potent than what Nurx offers (8% hydroquinone vs. their 4%). The pharmacy path gives patients a budget option with standard 4% hydroquinone that insurance may cover.

## FEMININE HEALTH

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path A Margin | Path B (Rx to Pharmacy) |
|---|----------------------|---------------|---------|-------------|--------------|----------------------|
| FH1 | UTI Rx | NOT in FCC catalog | N/A | N/A | N/A | **Path B ONLY:** $35 acute consult. Rx: Nitrofurantoin or TMP-SMX to pharmacy. Patient uses insurance. |
| FH2 | Yeast Infection Rx | NOT in FCC catalog | N/A | N/A | N/A | **Path B ONLY:** $35 acute consult. Rx: Fluconazole 150mg to pharmacy. Patient uses insurance. |
| FH3 | BV Rx | NOT in FCC catalog | N/A | N/A | N/A | **Path B ONLY:** $35 acute consult. Rx: Metronidazole 500mg to pharmacy. Patient uses insurance. |
| FH4 | Vaginal Dryness Rx (Estradiol Gel) | Estradiol (E2) Vaginal Gel 30g | $40.00 | $65/mo | 38% | $49 consult + $25/mo mgmt. Rx: Estradiol vaginal cream to pharmacy (insurance often covers). |
| FH5 | Vaginal Dryness Rx (Estriol Gel) | Estriol (E3) Vaginal Gel 30g | $40.00 | $65/mo | 38% | $49 consult. Rx: Estradiol to pharmacy (estriol not available commercially, so Path A is the only compounded option). |
| FH6 | Intimate Wellness Cream | Scream Cream 1: Sildenafil/Arginine/Papaverine 30g | $39.00 | $65/mo | 40% | **Path A ONLY** (compounded — not available at pharmacy). |
| FH7 | Intimate Wellness Cream Plus | Scream Cream 2: Sildenafil/Arginine/Papaverine/Testosterone 30g | $45.00 | $75/mo | 40% | **Path A ONLY** (compounded). |
| FH8 | Infection Prevention Bundle | Probiotic + D-Mannose + Boric Acid (OTC sourced, not FCC) | ~$15 estimated | $29/mo | ~48% | Not applicable — OTC products, no Rx needed. Sell direct as supplement bundle. |
| FH9 | Oxytocin Nasal Spray (Intimacy) | Oxytocin 25 IU/0.1mL Nasal Spray 15mL | $50.00 | $79/mo | 37% | **Path A ONLY** (compounded). |

**Key insight for feminine health:** UTI, yeast, and BV are **Path B only** — pure consultation revenue. These are acute conditions where the patient needs medicine TODAY, and their local pharmacy + insurance is the fastest path. You charge $35, write the Rx in minutes, they pick it up same day. Zero COGS, pure margin. This is how Wisp makes money on these conditions too.

## MENTAL WELLNESS

**All mental health medications are Path B only** (not in FCC catalog). This category is 100% consultation revenue.

| # | Body Good Product Name | Medication (Rx to Pharmacy) | Path A | Path B Price | Notes |
|---|----------------------|---------------------------|--------|-------------|-------|
| MW1 | Calm Rx (Generalized Anxiety) | Buspirone 5-15mg | N/A — Path B only | $49 consult + $25/mo mgmt | Non-addictive. Takes 2-4 weeks to work. Insurance typically covers. |
| MW2 | Stage Ready (Performance Anxiety) | Propranolol 10-20mg (5-10 pills/mo) | N/A — Path B only | $49 consult + $25/mo mgmt | As-needed use. 30-60 min before events. Insurance covers. Huge demand. |
| MW3 | Sleep Rx (Insomnia — Option A) | Trazodone 25-50mg | N/A — Path B only | $49 consult + $25/mo mgmt | Non-controlled. Widely prescribed for insomnia. Insurance covers. |
| MW4 | Sleep Rx (Insomnia — Option B) | Hydroxyzine 25mg | N/A — Path B only | $49 consult + $25/mo mgmt | Antihistamine with anti-anxiety properties. Non-controlled. |
| MW5 | Lift Rx (Depression — SSRI) | Sertraline, Escitalopram, or Fluoxetine | N/A — Path B only | $49 consult + $25/mo mgmt | Provider selects based on patient profile. All generic, all covered by insurance. |
| MW6 | Lift Rx Plus (Depression — SNRI) | Venlafaxine or Duloxetine | N/A — Path B only | $49 consult + $25/mo mgmt | For patients who didn't respond to SSRIs or need dual action. |
| MW7 | Momentum Rx (Low Motivation) | Bupropion XL 150mg | N/A — Path B only | $49 consult + $25/mo mgmt | Also helps with smoking cessation and can support weight loss. Good cross-sell with weight management patients. |
| MW8 | Mental Wellness Consult (Assessment) | Provider evaluation — custom plan | N/A | $49 one-time | For patients unsure what they need. Provider recommends treatment plan. |

**Mental wellness is a pure-margin revenue stream.** Zero product cost. $49 per new patient + $25/mo recurring management fee. If you get 50 mental wellness patients at $25/mo ongoing management, that's $1,250/mo recurring with $0 COGS.

## SEXUAL HEALTH — WOMEN (Cross-category with Feminine Health)

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path B |
|---|----------------------|---------------|---------|-------------|--------|
| SH-W1 | Desire Rx (Arousal Cream) | Scream Cream 1: Sildenafil/Arginine/Papaverine 30g | $39.00 | $65/mo | Path A only (compounded) |
| SH-W2 | Desire Rx Plus (with Testosterone) | Scream Cream 2: + Testosterone 30g | $45.00 | $75/mo | Path A only (compounded) |
| SH-W3 | Connection Rx (Oxytocin Spray) | Oxytocin 25 IU Nasal Spray 15mL | $50.00 | $79/mo | Path A only (compounded) |
| SH-W4 | Libido Support (PT-141) | PT-141 Bremelanotide Injectable 10mL | $95.00 | $149/mo | Path A only (compounded) |

## WEIGHT MANAGEMENT — ADD-ONS (Using FCC Products)

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Notes |
|---|----------------------|---------------|---------|-------------|-------|
| WM-A1 | Anti-Nausea Rx | Ondansetron 4mg, 10 tablets | $10.00 | $25 one-time | GLP-1 side effect support. Incredible margin. |
| WM-A2 | Metabolic Support (LDN) | Low-Dose Naltrexone 4.5mg, 30ct | $27.50 | $49/mo | Inflammation, cravings, autoimmune support. |
| WM-A3 | Appetite + Mood Support | Bupropion/Naltrexone/Chromium 30ct | $37.00 | $69/mo | Similar to Contrave but compounded. |
| WM-A4 | Metabolic Boost Cream | Metformin/Resveratrol cream 30g | $22.00 | $45/mo | Topical metabolic support. |

## HORMONE THERAPY (Available Through FCC — Future Phase But Catalog Ready)

| # | Body Good Product Name | FCC Medication | FCC COG | Path A Price | Path B |
|---|----------------------|---------------|---------|-------------|--------|
| HT1 | Estrogen Cream (Bi-est) | Bi-est 80/20 Cream 30g | $27.00 | $55/mo | $49 consult + $25/mo. Rx: Estradiol patch/pill to pharmacy. |
| HT2 | Progesterone | Progesterone Capsule 100mg, 30ct | $24.00 | $49/mo | $49 consult + $25/mo. Rx: Prometrium to pharmacy. |
| HT3 | Testosterone (Women — Low Dose) | Testosterone Cream 10mg/mL 30g | $24.00 | $49/mo | Path A only for women's testosterone (not commercially available at pharmacy in low dose). |
| HT4 | DHEA | DHEA 25mg Capsule, 30ct | $32.00 | $55/mo | OTC DHEA available, but compounded is higher quality. |
| HT5 | Complete HRT Bundle | Bi-est + Progesterone + Testosterone | ~$75 combined | $129/mo | $49 consult + $25/mo for pharmacy-sourced HRT alternatives. |

---

# REVENUE MODEL ANALYSIS

## Path A Revenue (Body Good Direct — FCC Products)
Average margin: 30-60% depending on product
Revenue per patient: $49-$149/mo product + potential add-ons
Body Good handles everything: consult, Rx, fulfillment, support

## Path B Revenue (Prescribe to Pharmacy)
Revenue per patient: $49 consult + $25/mo ongoing management
100% margin (zero COGS)
Patient uses their insurance for the actual medication
Body Good provides the clinical relationship and ongoing care

## Blended Model Example (100 new patients/month across all categories):
- 40 choose Path A (avg $65/mo product revenue) = $2,600/mo product revenue
- 60 choose Path B ($49 consult + $25/mo ongoing) = $2,940 consult + $1,500/mo ongoing
- Total month 1: $7,040
- Recurring from month 2+: $4,100/mo from just those 100 patients
- Plus cross-sells, upgrades, and weight management conversions

---

# UPDATED QUIZ ROUTING WITH DUAL-PATH

## How Quiz Results Change

Every quiz result now shows the recommendation with BOTH paths. Here's the updated pattern:

### Hair Loss Quiz — Example Result Screen (Women, Moderate Thinning)

```
Based on your answers, we recommend:

HAIR RESTORE PLUS
Oral Minoxidil + GHK-Cu Peptide Scalp Serum
Clinically proven to slow hair loss and promote regrowth in 3-6 months.

Choose how you'd like to get started:

┌─────────────────────────┐  ┌─────────────────────────┐
│  💊 SHIP TO MY DOOR     │  │  📋 SEND TO MY PHARMACY │
│                         │  │                         │
│  $79/month              │  │  $49 initial consult    │
│                         │  │  + $25/month ongoing    │
│  • Custom compounded    │  │                         │
│    formula              │  │  • Rx sent to your      │
│  • Shipped free in      │  │    pharmacy of choice   │
│    discreet packaging   │  │  • Use your insurance   │
│  • Provider included    │  │  • Provider included    │
│  • Auto-refill          │  │  • Dose adjustments     │
│                         │  │    included              │
│  [GET STARTED →]        │  │  [GET STARTED →]        │
└─────────────────────────┘  └─────────────────────────┘

  Both options include a licensed provider review,
  personalized treatment plan, and ongoing support.
```

### Feminine Health Quiz — UTI Result Screen

```
Based on your symptoms, you likely have a UTI.
Let's get you treated today.

┌─────────────────────────────────────────┐
│  📋 PRESCRIPTION TO YOUR PHARMACY       │
│                                         │
│  $35 — one-time consultation fee        │
│                                         │
│  • Provider reviews your info now       │
│  • Antibiotic Rx sent to your pharmacy  │
│  • Pick up same day, use your insurance │
│  • Follow-up included if needed         │
│                                         │
│  [GET TREATED NOW →]                    │
└─────────────────────────────────────────┘

Want to prevent future UTIs?

┌─────────────────────────┐
│  Infection Prevention   │
│  Bundle — $29/month     │
│  Probiotics + D-Mannose │
│  + Boric Acid           │
│  [ADD TO PLAN →]        │
└─────────────────────────┘
```

### Mental Wellness Quiz — Anxiety Result Screen

```
Based on your answers, your provider may recommend
Buspirone — a non-addictive medication for generalized anxiety.

┌─────────────────────────────────────────┐
│  📋 PRESCRIPTION TO YOUR PHARMACY       │
│                                         │
│  $49 — initial consultation             │
│  $25/month — ongoing care               │
│                                         │
│  • Provider creates your treatment plan │
│  • Rx sent to your pharmacy             │
│  • Use your insurance for medication    │
│  • Monthly check-ins included           │
│  • Dose adjustments anytime             │
│  • Messaging access with your provider  │
│                                         │
│  [GET STARTED →]                        │
└─────────────────────────────────────────┘

  Body Good does not prescribe controlled substances
  (no Xanax, no Adderall, no Ambien).
  We use evidence-based, non-addictive medications.
```

### Skincare Quiz — Hyperpigmentation Result (This is the WOC play)

```
Based on your concerns about dark spots and uneven skin tone,
we recommend:

BRIGHT CREAM
Hydroquinone + Tretinoin + Azelaic Acid + Kojic Acid
Our most powerful formula for melasma, dark spots, and discoloration.

Choose how you'd like to get started:

┌─────────────────────────┐  ┌─────────────────────────┐
│  💊 SHIP TO MY DOOR     │  │  📋 SEND TO MY PHARMACY │
│                         │  │                         │
│  $89/month              │  │  $49 initial consult    │
│                         │  │  + $25/month ongoing    │
│  • Medical-grade 8%     │  │                         │
│    hydroquinone formula │  │  • Rx: Hydroquinone 4%  │
│  • 5 active ingredients │  │    + Tretinoin sent to  │
│  • Compounded for YOUR  │  │    your pharmacy        │
│    skin                 │  │  • Use your insurance   │
│  • Shipped free         │  │  • Standard pharmacy    │
│  • Provider monitoring  │  │    strength available   │
│    of 8-week cycles     │  │                         │
│                         │  │                         │
│  [GET STARTED →]        │  │  [GET STARTED →]        │
└─────────────────────────┘  └─────────────────────────┘

  Our compounded formula contains 8% hydroquinone —
  double the standard pharmacy strength — plus 4
  additional brightening ingredients. Both options
  include provider monitoring.
```

---

# PRODUCTS I'M ADDING BASED ON FCC CATALOG REVIEW

After going through the full 53-page catalog, here are additional products from FCC that weren't in my original recommendation but should be in the Body Good catalog:

## High-Priority Additions

### 1. Selank Nasal Spray (Anxiety — Path A)
- **FCC:** Selank Acetate (TP-7) Nasal Spray 6mL, 7500mcg/ml — $89
- **What it is:** A peptide-based anti-anxiety nasal spray. Non-controlled, non-addictive, works within minutes.
- **Why add it:** This is a premium Path A alternative for anxiety patients who want fast relief without pills. No pharmacy equivalent exists. Competitors don't offer this.
- **Body Good Price:** $129/mo
- **Margin:** 31%

### 2. Low-Dose Naltrexone (Inflammation/Autoimmune/Cravings)
- **FCC:** LDN 4.5mg, 30ct — $27.50 | 90ct — $70
- **What it is:** Used off-label for autoimmune conditions, chronic inflammation, and appetite/craving reduction
- **Why add it:** Perfect cross-sell for weight management patients AND feminine health patients with chronic conditions
- **Body Good Price:** $49/mo (30ct) or $55/mo (3mo plan at $18.33/mo COG)

### 3. NAD+ (Energy/Anti-Aging/Brain Health)
- **FCC:** NAD+ 25mg Troche, 30ct — $40 | Nasal Spray 50mg/mL 30mL — $55
- **What it is:** Cellular energy and longevity molecule. Extremely trendy in the wellness/biohacking space.
- **Why add it:** Premium add-on for the "glow up" positioning. Your 35+ audience is the target market for NAD+.
- **Body Good Price:** $69/mo (troches) or $89/mo (nasal spray)

### 4. Methylene Blue (Cognitive Support/Energy)
- **FCC:** 15mg capsules, 30ct — $55
- **What it is:** Mitochondrial support, cognitive enhancement, energy. Growing wellness trend.
- **Body Good Price:** $79/mo

### 5. Scream Cream / Intimate Wellness (Sexual Health)
- Already included above, but want to emphasize: this is a Wisp "OMG Cream" competitor at $39 COG vs. $65 retail. 40% margin and it's a category Wisp has proven demand for.

### 6. Retatrutide (Next-Gen GLP-1)
- **FCC:** Retatrutide/B6 at multiple concentrations — $195-$720
- **What it is:** Triple agonist (GLP-1/GIP/Glucagon). Being called "the next ozempic." Not yet FDA approved but available compounded.
- **Why flag it:** This could be Body Good's next weight loss differentiator. Monitor regulatory status. Don't launch yet but plan for it.

---

# PRICING SUMMARY — ALL PRODUCTS AT A GLANCE

## Path A Products (Ship Direct from FCC)

| Category | Products Available | Price Range | Avg COG | Avg Margin |
|----------|-------------------|-------------|---------|------------|
| Hair Loss (Women) | 6 products | $39-$79/mo | $12-$56 | 30-67% |
| Hair Loss (Men) | 6 products | $35-$79/mo | $15-$50 | 36-57% |
| Skincare | 8 products | $55-$95/mo | $35-$68 | 24-36% |
| Feminine Health (Compounded) | 5 products | $65-$149/mo | $39-$95 | 30-40% |
| Sexual Health (Women) | 4 products | $65-$149/mo | $39-$95 | 37-40% |
| Weight Management Add-ons | 4 products | $25-$69/mo | $10-$37 | 46-60% |
| Anti-Aging/Wellness | 4 products | $49-$129/mo | $27.50-$89 | 28-44% |
| Hormone Therapy | 5 products | $49-$129/mo | $24-$75 | 42-51% |

## Path B Products (Rx to Local Pharmacy)

| Category | Consultation Fee | Ongoing Mgmt | Products Covered |
|----------|-----------------|-------------|-----------------|
| Hair Loss (generic Rx) | $49 | $25/mo | Finasteride, minoxidil, spironolactone, dutasteride |
| Skincare (generic Rx) | $49 | $25/mo | Tretinoin, hydroquinone, spironolactone, azelaic acid gel |
| Feminine Health (Acute) | $35 | None needed | UTI antibiotics, fluconazole, BV antibiotics |
| Feminine Health (Ongoing) | $49 | $25/mo | Estradiol, vaginal estrogen |
| Mental Wellness (All) | $49 | $25/mo | Buspirone, SSRIs, SNRIs, propranolol, trazodone, hydroxyzine, bupropion |
| Hormone Therapy (generic) | $49 | $25/mo | Estradiol, progesterone, DHEA |

---

# IMPLEMENTATION NOTES FOR CLAUDE CODE

1. **Every product in the database needs a `fulfillment_type` field:** `direct_ship`, `pharmacy_rx`, or `dual_path` (both options available)

2. **Quiz result components must render the dual-card layout** shown above. Products with `dual_path` show both cards. Products with `pharmacy_rx` only show the pharmacy card. Products with `direct_ship` only (compounded exclusives like Scream Cream, Selank, peptide serums) show only the ship card.

3. **Path B checkout flow is different from Path A:**
   - Path A: Standard e-commerce checkout → PayPal → medical intake → provider review → FCC ships
   - Path B: Consultation purchase ($35 or $49) → medical intake → provider review → Rx sent via DoseSpot → patient picks up at pharmacy → ongoing management subscription ($25/mo) begins

4. **Path B requires pharmacy selection step:** After intake, patient enters their preferred pharmacy (name + address OR pharmacy search by zip code). DoseSpot handles the electronic prescribing.

5. **Ongoing management subscription for Path B** includes: monthly check-in form, messaging access with provider, dose adjustments, refill management. This is the recurring revenue that makes Path B sustainable.

6. **Cross-path upsells:** A Path B patient picking up generic tretinoin at CVS should see an upsell for the Body Good Bright Cream (Path A). "Want something stronger? Our medical-grade formula has 4 additional active ingredients."

7. **Insurance note in UI:** Path B cards should say "Use your insurance" prominently. This is the trust signal for price-sensitive patients. Never say "cheap" or "budget option" — frame it as "the convenience of using your existing coverage."

8. **Path A branding:** All FCC products ship under the Body Good brand name. The patient never sees "Formulation Compounding Center." Labels should say "Body Good Rx" or similar.

---

# QUIZ FLOW UPDATES

All four quizzes (Hair, Skin, Feminine Health, Mental Wellness) follow the same updated structure:

1. Questions 1-7: Same as previously defined
2. Question 8 (NEW): "How would you like to receive your treatment?"
   - [ ] Ship medication directly to my door (convenient, no pharmacy visit)
   - [ ] Send a prescription to my pharmacy (I want to use my insurance)
   - [ ] I'm not sure yet — show me both options
3. Question 9: Email capture
4. Results: Show appropriate Path A, Path B, or both based on Q8 answer + product availability

This pre-qualifies the patient's intent before showing pricing, which improves conversion because they see the option they already selected as primary.

---

# WHAT THIS MEANS STRATEGICALLY

Linda, this dual-path model changes Body Good's competitive position fundamentally:

**For WOC and price-sensitive patients:** "Use your insurance" is the trust signal that Hims, Hers, and most telehealth competitors can't offer. They're all self-pay only. Body Good saying "we'll write the Rx, you use your insurance" is an immediate differentiator.

**For convenience-seeking patients:** Path A (ship to door) is the premium experience. Custom compounded formulas that aren't available at any pharmacy. No lines, no waiting.

**For Body Good's revenue:** You make money either way. Path A = product margin + consultation built in. Path B = pure consultation margin with zero COGS. And Path B patients are future Path A conversion opportunities.

**The key messaging on the site:** "Your treatment. Your way. Get it shipped to your door, or use your insurance at your local pharmacy. Either way, you get a real doctor who listens."
