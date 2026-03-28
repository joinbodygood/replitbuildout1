# Body Good Studio — Wellness Injection System
## Claude Code Implementation Guide | March 28, 2026

---

## Overview

Three components to build:

1. **Homepage Card** — "Wellness Injections" card on joinbodygood.com homepage
2. **Wellness Injection Quiz** — 5-question guided quiz to recommend the right injection(s)
3. **Wellness Injection Recommendation Page** — Full product catalog with personalized sort based on quiz results

**All products are SHIPPING ONLY. No local pharmacy delivery.**

---

## PART 1: Homepage Card

Add a new card to the homepage product grid/category section.

### Card Content

```
Title: "Wellness Injections"
Subtitle: "Boost your results from the inside out"
Description: "Medical-grade injections for energy, fat-burning, detox, longevity, and recovery — shipped to your door."
CTA Button: "Find Your Injection →"
CTA Link: /wellness-quiz
Badge: "NEW" (top-right corner, red #ed1b1b background, white text)
Icon/Image: Syringe or injection vial icon (keep it clean and medical, not scary)
```

### Design Specs (Body Good Brand)

- Card radius: 12px
- Button: pill shape, 50px border-radius, red #ed1b1b background
- Fonts: Poppins (headings) / Manrope (body)
- Colors: Red #ed1b1b, Soft Pink #fde7e7
- No emojis — use professional icons only
- Match the existing homepage card layout exactly

---

## PART 2: Wellness Injection Quiz

**Route:** `/wellness-quiz`

### Purpose

Guide patients to the right wellness injection(s) based on their goals, current situation, and preferences. The quiz produces a personalized recommendation that routes them to the product page with results pre-sorted.

### Quiz Flow

**Page Header:**
```
Title: "Which wellness injection is right for you?"
Subtitle: "Answer 5 quick questions. We'll recommend the perfect add-on for your goals."
Note: "All injections ship directly to your door with supplies included."
```

---

#### Question 1: Primary Goal

```
"What's your #1 goal right now?"

Options (select ONE):
- "More energy & less brain fog" → tags: [energy, metabolism]
- "Burn more fat & boost metabolism" → tags: [fat-burning, metabolism]
- "Better skin & detox" → tags: [detox, skin, antioxidant]
- "Anti-aging & longevity" → tags: [longevity, anti-aging, cellular-health]
- "Better sleep & recovery" → tags: [recovery, sleep, peptide]
- "All of the above — I want the works" → tags: [all]
```

#### Question 2: Current Program

```
"Are you currently on a GLP-1 weight loss program?"

Options (select ONE):
- "Yes — I'm on tirzepatide or semaglutide" → weight: 1.2x for [fat-burning, energy, detox]
- "No — I'm here just for wellness" → weight: 1.2x for [longevity, anti-aging, energy]
- "I'm thinking about starting one" → weight: 1.0x (neutral)
```

#### Question 3: Exercise Level

```
"How active are you right now?"

Options (select ONE):
- "Very active — I work out 4+ times/week" → boost: [l-carnitine, sermorelin]
- "Moderately active — 2-3 times/week" → boost: [lipotropic-super-b, l-carnitine]
- "Light activity — walks, stretching" → boost: [vitamin-b12, lipotropic-super-b]
- "Not very active right now" → boost: [vitamin-b12, glutathione]
```

#### Question 4: Top Concern

```
"What bothers you the most lately?"

Options (select UP TO TWO):
- "I'm exhausted all the time" → boost: [vitamin-b12, lipotropic-super-b, nad-plus]
- "I feel like I'm aging faster than I should" → boost: [nad-plus, sermorelin, glutathione]
- "My skin looks dull or tired" → boost: [glutathione]
- "I'm losing muscle along with the fat" → boost: [sermorelin, l-carnitine]
- "I just feel 'blah' — no motivation" → boost: [lipotropic-super-b, vitamin-b12, nad-plus]
- "I want to optimize everything" → boost: [nad-plus, sermorelin, glutathione]
```

#### Question 5: Budget Comfort

```
"What monthly investment feels comfortable for a wellness add-on?"

Options (select ONE):
- "Under $75/mo — keep it simple" → filter: [vitamin-b12]
- "$75–$150/mo — mid-range" → filter: [lipo-c, l-carnitine, lipotropic-super-b]
- "$150–$200/mo — I want the good stuff" → filter: [glutathione, sermorelin, nad-plus]
- "I'll invest whatever it takes for results" → filter: [all]
```

---

### Scoring Algorithm

```typescript
interface QuizScore {
  handle: string;
  score: number;
  matchReasons: string[];
}

// Each product starts at score 0
// Q1 primary goal: +3 points for matching tags
// Q2 current program: multiply relevant scores by weight
// Q3 exercise level: +2 points for boosted products
// Q4 top concern: +2 points per matching concern (max 2 concerns selected)
// Q5 budget: products outside budget range get score = 0 (filtered out)
//   Exception: "invest whatever it takes" keeps all products

// Final output: sorted array of QuizScore objects, highest to lowest
// Top 1-2 products become "Recommended For You"
// Remaining products show as "Other Options"
```

### Quiz Results → Redirect

On submit, encode quiz results as URL params and redirect:

```
/wellness-injections?rec=lipotropic-super-b,nad-plus&from=quiz
```

The recommendation page reads these params to:
1. Show a "Your Personalized Recommendations" banner
2. Sort products with recommended items first
3. Show match reason badges (e.g., "Matches your energy goal", "Great for active lifestyles")

---

## PART 3: Wellness Injection Recommendation Page

**Route:** `/wellness-injections`

### Page Layout

**Header Section:**
```
Title: "Wellness Injections"
Subtitle: "Medical-grade injections to complement your health journey. All options ship directly to your door."
Note: "Every injection includes supplies (needles, syringes, alcohol swabs) and comes with provider oversight."
```

**If `?from=quiz` is present:**
```
Banner: "Based on your quiz results, here's what we recommend for you:"
[Recommended products highlighted at top with "Recommended For You" badge]
```

**If no quiz params:**
```
Banner: "Not sure which one is right for you?"
CTA: "Take the 2-minute quiz →" (links to /wellness-quiz)
```

---

### Product Card Layout

Each product displays as a card:

```
┌──────────────────────────────────────────┐
│  [Badge: "Recommended For You" or        │
│   "Most Popular" or "Premium"]           │
│                                          │
│  Product Name                            │
│  Short description (1-2 lines)           │
│                                          │
│  $XX/mo                                  │
│  [If 3-month option: "or $XX/mo          │
│   with 3-month supply"]                  │
│                                          │
│  ● Benefit tag 1                         │
│  ● Benefit tag 2                         │
│  ● Benefit tag 3                         │
│                                          │
│  [ Learn More ]  [ Add to Program → ]    │
│                                          │
│  Shipping: All injections ship via UPS   │
│  Overnight with supplies included.       │
└──────────────────────────────────────────┘
```

### Product Display Order (Default, No Quiz)

1. **Lipotropic Super B** — `is_featured: true`, highest value proposition
2. **NAD+** — `is_featured: true`, premium longevity play
3. **Sermorelin** — `is_featured: true`, peptide/anti-aging
4. **Glutathione** — `is_featured: true`, detox/skin
5. **L-Carnitine** — solid add-on for active patients
6. **Lipo-C** — budget fat-burning option
7. **Vitamin B12** — entry-level, lowest price

### "Learn More" Expandable Section

When "Learn More" is clicked, expand card (or open modal) showing:

```
- description_long (full clinical description)
- What's included: "10mL/30mL vial, injection supplies, provider oversight"
- How it works: 1-2 sentence mechanism of action
- How to use: "Self-administered sub-Q injection, [frequency]. Injection guide included."
- Pairs well with: [cross-sell suggestions]
- Shipping: "Ships via UPS Standard Overnight from our pharmacy partner. 
  $24 shipping per order (or $15 for TX/OK locations)."
```

### Cross-Sell Pairings

```typescript
const CROSS_SELL_MAP: Record<string, string[]> = {
  'glutathione': ['lipotropic-super-b', 'nad-plus'],
  'lipotropic-super-b': ['glutathione', 'l-carnitine'],
  'lipo-c': ['l-carnitine', 'vitamin-b12'],
  'l-carnitine': ['lipotropic-super-b', 'sermorelin'],
  'vitamin-b12': ['lipotropic-super-b', 'glutathione'],
  'nad-plus': ['sermorelin', 'glutathione'],
  'sermorelin': ['nad-plus', 'l-carnitine'],
};
```

### "Add to Program" Flow

When clicked:
1. If patient is logged in → add to their cart/program as an add-on subscription
2. If not logged in → redirect to signup/intake flow with the selected product pre-selected
3. All wellness injections require provider approval (Jena/Rhea reviews)

---

## PART 4: Suggested Bundles (Show on Recommendation Page)

Display below individual products as a "Save with a Bundle" section:

| Bundle Name | Products | Bundle Price | Savings |
|-------------|----------|-------------|---------|
| **Body Good Glow** | Glutathione + B12 | $179/mo | Save $29 |
| **Fat Burner Stack** | Lipo-C + L-Carnitine | $169/mo | Save $29 |
| **Ultimate Wellness** | Glutathione + Super B + NAD+ | $399/mo | Save $78 |
| **Performance Pack** | Sermorelin + L-Carnitine + B12 | $299/mo | Save $38 |

Bundle cards use a slightly different design — show all included products with a "Bundle & Save" badge.

---

## PART 5: Upsell Engine Config Update

Replace the existing `UPSELL_CONFIG` in `src/lib/upsells.ts`:

```typescript
const UPSELL_CONFIG: Record<string, { clinicalNote: string; preChecked: boolean }> = {
  ondansetron: {
    clinicalNote: 'Clinically recommended — most GLP-1 patients experience nausea in the first 4 weeks.',
    preChecked: true,
  },
  'vitamin-b12': {
    clinicalNote: 'Supports energy, metabolism, and nerve function. Popular with GLP-1 programs.',
    preChecked: false,
  },
  'nad-plus': {
    clinicalNote: 'Boosts cellular energy and supports metabolic health. Our premium longevity injection.',
    preChecked: false,
  },
  'lipo-c': {
    clinicalNote: 'Fat-burning injection blend — MIC + L-Carnitine. Designed to complement GLP-1 therapy.',
    preChecked: false,
  },
  'lipotropic-super-b': {
    clinicalNote: '11-ingredient energy + fat-burning injection — our most popular wellness add-on.',
    preChecked: false,
  },
  glutathione: {
    clinicalNote: 'Master antioxidant — supports detox during weight loss and promotes skin radiance.',
    preChecked: false,
  },
  'l-carnitine': {
    clinicalNote: 'Shuttles fat into cells for energy — supports fat burning and muscle preservation.',
    preChecked: false,
  },
  sermorelin: {
    clinicalNote: 'Growth hormone peptide — combats muscle loss during weight loss, improves sleep and recovery.',
    preChecked: false,
  },
};

// REMOVED: bioboost-plus (replaced by lipotropic-super-b)
```

---

## Shipping Reminder (Display on All Wellness Injection Pages)

```
All wellness injections ship via UPS Standard Overnight from our pharmacy partner.
Shipping: $24 per order (standard) | $15 for TX/OK locations
Injectable supplies (needles, syringes, alcohol swabs) included with every order.
```

---

## Technical Notes for Ayush

1. **Product data:** Import from `wellness-injections-catalog.json` — this follows the same schema as `bodygood-product-catalog.json`
2. **Handles that already exist:** `vitamin-b12`, `nad-plus`, `lipo-c` — UPDATE these, don't create duplicates
3. **Handle to deactivate:** `bioboost-plus` → replaced by `lipotropic-super-b`
4. **Quiz state:** Store quiz answers in session/localStorage, encode results in URL params for the recommendation page
5. **No pharmacy path:** All wellness injections are `fulfillment_type: "direct_ship"` — no dual-path UI needed
6. **Subscription:** All products are `subscription_eligible: true` — show monthly subscription as default with one-time purchase as secondary option
7. **Spanish:** All product content has `_es` translations ready — use the existing locale switcher
