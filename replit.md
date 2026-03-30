# Body Good Studio — E-Commerce Platform

## What This Is

A custom telehealth e-commerce platform for Body Good Studio, a physician-led weight loss practice founded by **Dr. Linda Moleon, MD**. This platform **replaces Shopify** as the storefront while keeping Zoho One for CRM/clinical operations and n8n for automation.

**This is a commerce-only platform — no PHI (Protected Health Information) is stored in the local database.** All clinical intake data is forwarded via n8n webhook to Zoho One / GLOW portal. After checkout, GLP-1 patients complete their medical intake directly on this platform, which then fires to n8n — never stored locally.

## Why Custom (Not Shopify, Not Medusa.js)

- Shopify can't handle quiz funnels, insurance logic, or bilingual UX natively
- Medusa.js required too many custom modules
- Clean-sheet Next.js gives full control over the funnel UX — the core competitive asset
- Built with Claude Code on Replit for rapid iteration

## Key Components

| Component | Path | Purpose |
|---|---|---|
| `RecommendationConfigurator` | `src/components/quiz/RecommendationConfigurator.tsx` | Universal post-quiz configurator for all 4 product types (compounded/pharmacy_only/both/service). 3-step flow: fulfillment toggle → shipping frequency → per-month dose selection. Real-time tier-aware pricing. Pharmacy modal + GoodRx banner. |
| `BGS_PRODUCTS` | `src/lib/bgs-products.ts` | Complete product catalog — all 48 products across all programs with fulfillment types, prices, dose arrays, tier pricing, pharmacy fees |
| `GoodRxPriceCheck` | `src/components/product/GoodRxPriceCheck.tsx` | GoodRx deep-link widget for product pages |
| `SplitRecommendationPage` | `src/components/quiz/SplitRecommendationPage.tsx` | Legacy two-card layout (kept, not used by hair quiz) |

## Competitive Advantages

1. **Bilingual (EN/ES) from day one** — no competitor in telehealth weight loss offers Spanish
2. **Transparent all-inclusive pricing** — opposite of Hims/Found who hide costs behind quizzes
3. **Free insurance probability checker** — unique lead magnet
4. **One smart quiz with 4 outcomes** — not separate funnels, one branching flow
5. **$45 branded Rx program** — Wegovy/Zepbound prescription, undercuts Ro ($145/mo) and Walgreens ($49/visit)
6. **Wellness Injection catalog** — 7 compounded injectables with guided quiz and personalized recommendation engine

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Database | PostgreSQL (Replit-managed) |
| ORM | Prisma 5 |
| Payments | PayPal Commerce Platform (sandbox configured) |
| i18n | next-intl (EN/ES, locale-aware routing) |
| Styling | Tailwind CSS 4 with Body Good design tokens |
| Analytics | GA4 + Meta Pixel (env vars, production only) |
| Webhooks | n8n (fire-and-forget, silent when URL not set) |
| Auth | Stytch SMS OTP (not yet integrated — placeholder for checkout) |

## Admin Dashboard

**Route:** `/admin/*` (separate from patient-facing storefront)

### Access
- **Team Login link:** Footer → "Team Login" (discreet, low-opacity)
- **Login URL:** `/admin/login`
- **Initial credentials:** See `prisma/seed-admin.ts` — run to create/reset users
- **Session:** httpOnly cookie, 8-hour expiry
- **Re-seed:** `npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-admin.ts`

### Seeded Users
| Name | Email | Role | Default Password |
|------|-------|------|-----------------|
| Dr. Linda Moleon, MD | linda@bodygoodstudio.com | super_admin | ChangeMe2024! |
| Ayush | ayush@bodygoodstudio.com | developer | ChangeMe2024! |

### Built Modules
| Module | Route | Status |
|--------|-------|--------|
| Login | `/admin/login` | ✅ Full |
| Dashboard | `/admin` | ✅ KPIs + Revenue chart + Recent orders |
| Orders | `/admin/orders` | ✅ List + Detail + Status edit |
| Patients | `/admin/patients` | ✅ List with LTV + Order data |
| Products | `/admin/products` | ✅ Full catalog — 74 products, 125 variants, category filters, Active/Featured toggles, expandable detail rows |
| Discounts | `/admin/discounts` | ✅ List + Create codes |
| Team | `/admin/settings/team` | ✅ Member list |
| Subscriptions | `/admin/subscriptions` | 🔄 Stub — awaiting PayPal recurring |
| Analytics | `/admin/analytics` | 🔄 Stub — next phase |
| Content | `/admin/content` | 🔄 Stub — next phase |
| Messaging | `/admin/messaging` | 🔄 Stub — awaiting Chatwoot config |
| Marketing | `/admin/marketing` | 🔄 Stub — awaiting Mailgun/Twilio |

### Key Files
- `src/lib/admin-auth.ts` — session auth, RBAC permissions
- `src/app/admin/(dashboard)/layout.tsx` — protected admin layout (sidebar + topbar)
- `src/app/admin/login/page.tsx` — public login page
- `src/components/admin/AdminSidebar.tsx` — sidebar navigation
- `prisma/seed-admin.ts` — seeder for admin users
- `src/app/api/admin/*` — all admin API routes

### Adding Team Members
Edit `prisma/seed-admin.ts` and add a new entry, then run:
```
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-admin.ts
```

## Design System

| Token | Value |
|-------|-------|
| Primary Red | `#ED1B1B` (`bg-brand-red`) |
| Soft Pink | `#FDE7E7` (`bg-brand-pink`) |
| Heading Font | Poppins (`font-heading`) |
| Body Font | Manrope (`font-body`) |
| Button Radius | 50px (`rounded-pill`) |
| Card Radius | 12px (`rounded-card`) |

## Customer Funnel

```
Marketing (Ads, Social, SEO)
    |
Homepage (joinbodygood.com)
    |--- "Which option is right for me?" ---> Quiz
    |--- "Explore programs" ----------------> Bridge Page (4 cards)
    |--- "Check insurance coverage" --------> Free Insurance Checker
    |
Quiz (one quiz, 4 outcomes)
    |--- Interstitial: "You're Not Alone" (stats)
    |--- BMI Calculator
    |--- Interstitial: "Meet Dr. Linda" (trust)
    |--- Email/Phone Capture
    |--- Medical Disqualifiers
    |--- Insurance / Needle / Cost Preference Questions
    |--- Interstitial: Semaglutide vs Tirzepatide (education)
    |
    |---> Outcome A: Compounded GLP-1 (from $139/mo)
    |---> Outcome B: Insurance Program (from $25)
    |---> Outcome C: Oral GLP-1 (from $109/mo)
    |---> Outcome D: Branded Rx - $45 prescription (Wegovy/Zepbound)
    |
Add to Cart → /cart/upsell (add-ons: Ongoing Care $55/mo, Insurance Check $25)
    → Cart → Checkout (PayPal) → Confirmation
    |
Redirect to Zoho/GLOW for medical intake
```

## Pricing Matrix (Locked v2)

| Program | 1-Month | 3-Month | 6-Month |
|---------|---------|---------|---------|
| Tirzepatide (One-Time) | $315 | — | — |
| Tirzepatide Starter (2.25-9mg) | $299/mo | $279/mo | $259/mo |
| Tirzepatide Maintenance (11.25mg+) | $349/mo | $329/mo | $319/mo |
| Semaglutide | $179/mo | $149/mo | $139/mo |
| Oral GLP-1 | $149 one-time / $129/mo | $119/mo | $109/mo |
| Branded GLP-1 Rx | $45 one-time | — | — |
| Branded Rx Mgmt | $55/mo | $45/mo | $25/mo |
| Insurance Eligibility | $25 one-time | — | — |
| Insurance Prior Auth | $50 one-time | — | — |
| Insurance Approval | $85 one-time | — | — |
| Insurance Ongoing | $75/mo | — | — |

## What's Built (Complete)

### Foundation
- Next.js with TypeScript, Tailwind CSS 4, Body Good design tokens
- Bilingual i18n with next-intl (EN/ES routing at /en/... and /es/...)
- UI component library (Button, Card, Container, Badge, Accordion)
- Header (nav, mobile hamburger, cart badge, language toggle), Footer
- Homepage (Hero, TrustMarquee, WhatBringsYou, PainPoints, HowItWorks, Testimonials, Providers, BottomCTA) — modeled after joinbodygood.com
- About, How It Works, FAQ pages
- 5 legal pages (Privacy, Terms, Telehealth Consent, HIPAA Notice, Refund Policy)
- GA4 + Meta Pixel (production-only, env-driven), Sitemap + robots.txt

### Product Catalog
- 11 products seeded with full EN/ES translations and pricing (22 variants)
- Dynamic product pages (/products/[slug]) with tier pricing
- Product listing page (/products), Pricing comparison table (/pricing)
- Programs page (/programs) — 6 category cards (Anti-Aging "Coming Soon"); each category links to its quiz

### Quiz Engine — Weight Loss (GLP-1)
- Single smart quiz with branching logic and 4 outcome paths
- 3 interstitial trust cards (stats, Dr. Linda, semaglutide vs tirzepatide)
- BMI calculator, email + phone capture (mid-quiz), medical disqualifier screens
- Insurance detail collection with probability check
- 4 recommendation pages (compounded, insurance, oral, branded) — **fully rebuilt with product comparison + Add to Cart:**
  - Compounded: MedicationChoiceCard side-by-side (Semaglutide vs Tirzepatide) + plan selectors with variant pricing from DB
  - Insurance: 3-step accordion (Eligibility/Prior Auth/Approval) each with Add to Cart
  - Oral: Single product with inline variant plan selector (MedicationChoiceCardInline)
  - Branded: $45 Rx + optional management plan (MedicationChoiceCardInline); med comparison grid
- Free insurance probability checker (/insurance-check)
- 251 insurance probability entries seeded for 10 carriers
- Quiz lead API + insurance probability API
- QuizLead schema extended with 9 patient-context fields

### Quiz Engine — Category Quizzes (4 Categories)
- **Shared infrastructure:** `CategoryQuizEngine.tsx` (declarative, reusable), `DualPathCard.tsx` (Ship-to-Door vs Pharmacy Rx dual-path result card)
- **Hair Restoration** (`/quiz/hair`) — 4 questions, 6 outcomes (women-mild/moderate/max, men-basic/combo/max); all result pages have cartData on both paths (Ship-to-Door + Pharmacy consult); uses synthetic productIds (DB not yet seeded for hair products)
- **Skincare & Glow** (`/quiz/skin`) — 4 outcomes (anti-aging, hyperpigmentation, hormonal-acne, rosacea); all result pages have cartData; synthetic productIds
- **Feminine Health** (`/quiz/feminine-health`) — 4 outcomes (acute-infection, vaginal-dryness, intimacy, prevention); acute-infection is pharmacy-only ($35); others are dual-path; all have cartData
- **Mental Wellness** (`/quiz/mental-wellness`) — 6 outcomes (anxiety, performance, sleep, depression, motivation, assessment); all pharmacy-only ($49 consult); all have cartData; includes 988 crisis safety banner
- All 4 category quizzes: `DualPathCard` shows ✓ benefits + ✗ tradeoffs; `AddToCartButton` triggers when cartData present; `redirectToUpsell=true` sends to `/cart/upsell`
- WhatBringsYou homepage section links each card directly to its category quiz (no more "Coming Soon")

### Checkout & Payments
- Cart context with localStorage persistence, cart page, AddToCartButton
- **Upsell page** (`/cart/upsell`) — shown after Add to Cart; offers Ongoing Care Plan (+$55/mo) and Insurance Coverage Check (+$25); proceed to checkout CTA with cart summary
- **MedicationChoiceCard** + **MedicationChoiceCardInline** — price-tier selector cards with plan variant picker, Add to Cart, badges, and X/✓ tradeoffs
- Multi-step checkout (Info → Shipping → Payment → Confirmation)
- Real PayPal SDK integration (sandbox) — **NOTE: server-side verification not yet built**
- Order API (creates order in DB), discount code system
- 3 discount codes seeded (WELCOME25, SAVE10, FRIEND25)
- Confirmation page with "Complete Medical Intake" CTA — routes to correct intake form per SKU via `resolveIntakeRoute()`

### Medical Intake Forms (PHI → n8n webhook only, never stored locally)
- **GLP-1 Injectable** (`/intake/glp1-injectable?med=tirz|sema`) — 4-step wizard; contraindications, e-signature; WM-TIR-INJ, WM-SEM-INJ
- **GLP-1 Oral** (`/intake/glp1-oral?med=sema|tirz`) — 4-step wizard; WM-ORAL-SEM, WM-ORAL-TIR, WM-ORAL-METCOMBO, WM-ORAL-LDN
- **Specialty** (`/intake/specialty?program=hair|feminine|mental`) — fulfillment toggle (ship/pharm), NPI pharmacy search, program-specific Step 3 screening (Hair: loss patterns/thyroid/liver/prostate; Feminine: concerns/menstrual/hormone cancers; Mental: concerns/seizures/bipolar/glaucoma); HL-*, FH-*, MW-* SKUs
- **Branded Rx** (`/intake/branded-rx`) — NPI pharmacy search, GLP-1 contraindication screening, branded med preference, transfer details; WM-BRAND-MGMT
- **Insurance Navigation** (`/intake/insurance`) — insurance details (provider/plan/member ID), BMI auto-calculator, comorbidities checklist for PA strengthening, prior denials, NPI pharmacy; INS-PA/INS-APPROVE/INS-ONGOING SKUs
- **Insurance Eligibility Check** (`/intake/insurance-eligibility`) — 4-step post-purchase wizard gated at 75%+ probability score; Step 1: insurance details + 3 drag-drop file uploads (card front/back/photo ID, stored as base64 in webhook); Step 2: ICD-10 condition grid (12 conditions), biometrics/BMI calculator, prior attempt checklist, medications textarea; Step 3: medication preference (tirzepatide/semaglutide/either) + prior GLP-1 history yes/no; Step 4: read-only summary + verbatim legal disclaimer (amber box) + custom acknowledge card (red→green states); submit button green only when acknowledged; INS-ELIG SKU
- **Wellness Injections** (`/intake/wellness`) — injection-specific screening (B-vitamin allergy, Leber's disease, kidney/cancer/clotting/pregnancy/diabetes), self-injection comfort; WI-* SKUs
- All forms POST to `/api/intake/submit` → `fireWebhook("intake.submitted", data)` → n8n

### Growth Systems
- Referral program (unique links, share buttons, stats tracking)
- Review system (collection, moderation queue, display), 6 seeded testimonials
- Blog CMS with markdown rendering, 3 bilingual posts, listing + detail pages
- Admin dashboard (stats grid + recent orders — read-only)
- n8n webhook utility wired into all API routes

## Coverage Check Engine (Instant Results System)

Patients who purchase the $25 Insurance Eligibility Check ($SKU: INS-ELIG) complete the intake form and immediately receive AI-powered coverage probability results.

### Architecture — 3 Active Data Sources

| Source | Weight | File |
|--------|--------|------|
| Probability DB (73 carriers, state/indication matrix) | 40% | `src/lib/insurance/glp1-probability-database.json` |
| Body Good historical outcomes | 30% | `src/lib/insurance/confidence-engine.ts` |
| Claude API web search (real-time formulary) | 30% | `src/lib/insurance/web-search.ts` |

**Real-time eligibility (future upgrade):**
- **Eligible.com** — ~$0.20/check, no monthly minimum. Same 270/271 transactions as Stedi. Add `ELIGIBLE_API_KEY` secret + implement in `src/lib/insurance/stedi.ts`.
- Stedi ($500/mo) was evaluated and removed. The stub file remains with upgrade instructions.

### Flow

1. Patient pays $25 → checkout → `/intake/insurance-eligibility`
2. 4-step form: insurance info (+ state, employer size) → medical history (ICD-10 conditions) → medication pref → review/acknowledge
3. On submit: `POST /api/coverage-check` + `POST /api/intake/submit` fired in parallel
4. Loading screen cycles through data-source status messages
5. Results screen shows per-medication cards (Wegovy, Zepbound, Mounjaro, Ozempic) with:
   - Status badge: Likely Covered / PA Required / Not Covered / Needs Review
   - Probability range (e.g., "55–70%")
   - Confidence meter (% + X/N sources agree)
   - Recommended coverage pathway + PA badge
   - Diagnosis-specific note (T2D, OSA, CVD, MASH pathways)
   - Required documentation checklist (collapsible)
   - Next step CTA button
6. Overall bucket banner: Green (high confidence) / Yellow (mixed signals) / Red (coverage unlikely)
7. `coverage_check.completed` webhook fires to n8n with summary results

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/insurance/glp1-probability-database.json` | Carrier/state/medication/indication probability matrix (14 carriers, 50 states) |
| `src/lib/insurance/confidence-engine.ts` | Core scoring engine — orchestrates all 5 sources, calculates combined scores |
| `src/lib/insurance/stedi.ts` | Stedi 270/271 real-time eligibility API (graceful skip if `STEDI_API_KEY` not set) |
| `src/lib/insurance/web-search.ts` | Claude API with web_search tool for real-time formulary lookups |
| `src/app/api/coverage-check/route.ts` | POST endpoint — orchestrates all sources, fires webhook |
| `src/components/insurance/CoverageResults.tsx` | Results display component (medication cards, legend, PBM info, disclaimer) |

### Environment Variables Required

| Variable | Required | Notes |
|----------|----------|-------|
| `ANTHROPIC_API_KEY` | Yes (already set) | Claude API for web search source |
| `STEDI_API_KEY` | Optional | If missing, Stedi source gracefully skipped |
| `PROVIDER_NPI` | Optional | Defaults to `1558788851` (Dr. Linda) |

### Condition ID → Engine Diagnosis Mapping

Form `conditions` array IDs → engine diagnosis IDs (mapped in `/api/coverage-check/route.ts`):
`obesity→obesity`, `type2_diabetes→t2d`, `sleep_apnea→osa`, `cardiovascular→cvd`, `nafld→mash`, `overweight_comorbid→overweight`, `prediabetes→prediabetes`, `pcos→pcos`

## What's NOT Built Yet

- [ ] **PayPal server-side verification** — currently client-side only, `PAYPAL_CLIENT_SECRET` unused (security gap)
- [ ] Stytch SMS OTP authentication (no auth gate on checkout)
- [ ] Real PayPal production keys (sandbox only)
- [ ] AddToCartButton wired into product detail pages (component exists, not imported)
- [ ] Upsell engine UI on product/checkout pages
- [ ] Admin CRUD for products, discounts, reviews, blog posts (dashboard is read-only)
- [ ] Shopify 301 redirect map
- [ ] Email templates for transactional emails (n8n handles sending)
- [ ] Dr. Linda's real photo in quiz interstitial (placeholder "DL" initials)
- [ ] Contact page
- [ ] Before/after photo gallery
- [ ] Testimonial carousel on homepage

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/quiz-lead | POST | Save quiz lead + fire webhook |
| /api/insurance-probability | GET | Lookup coverage probability by carrier/plan/state |
| /api/orders | POST | Create order with line items + fire webhook |
| /api/discount | GET | Validate discount code |
| /api/referrals | POST | Generate referral code for email |
| /api/referrals | GET | Get referral stats for email |
| /api/reviews | GET | Get reviews (optionally filtered by product) |
| /api/reviews | POST | Submit review (pending admin approval) + fire webhook |

## Database Schema (Prisma — PostgreSQL)

- **Product** + ProductTranslation + ProductVariant + ProductImage
- **InsuranceProbability** — 251 entries across 10 carriers, 10 states, 4 medications
- **QuizLead** — email, firstName, phone, state, weightGoal, story, needleComfort, insuranceInterest, insuranceType, priority, timeline, quizOutcome, UTM params
- **FaqItem** + FaqTranslation — 7 bilingual FAQ entries
- **Order** + OrderItem — full order system with status workflow
- **DiscountCode** — 3 codes seeded (WELCOME25, SAVE10, FRIEND25)
- **Referral** — unique codes, credit tracking, completion status
- **Review** — 6 seeded testimonials, moderation queue
- **BlogPost** + BlogPostTranslation — 3 bilingual posts

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed data (products, FAQs, reviews, blog, discounts, insurance) |
| `src/components/quiz/QuizEngine.tsx` | Main quiz with branching logic |
| `src/components/checkout/PayPalButton.tsx` | PayPal SDK integration (client-side) |
| `src/lib/webhooks.ts` | n8n webhook fire utility |
| `src/lib/db.ts` | Prisma client singleton |
| `src/context/CartContext.tsx` | Cart state management |
| `src/i18n/` | i18n config |
| `messages/en.json`, `messages/es.json` | Translation strings |

## Environment Variables / Secrets

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL — Replit-managed secret |
| `ANTHROPIC_API_KEY` | Claude API — Replit project secret |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (public) |
| `PAYPAL_CLIENT_SECRET` | PayPal secret — currently unused (server-side not built) |
| `PAYPAL_SANDBOX` | `"true"` for sandbox mode |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel |
| `N8N_WEBHOOK_URL` | Optional — silently skipped if unset |

## Team & Access

| Role | Person | Access |
|------|--------|--------|
| Super Admin | Dr. Linda Moleon | Full |
| Support | Kira | Orders, patients, refunds |
| Marketing | Cassey | Campaigns, discounts, blog, analytics |
| Developer | Ayush | System settings, API, logs |
| Clinical (Zoho only) | Dr. Sharmaine, Jena PA, Rhea PA | Not on this platform |

## Replit-Specific Notes

- Dev/start scripts bind to `0.0.0.0:5000` — do not change
- `next.config.ts` includes `allowedDevOrigins` from `REPLIT_DEV_DOMAIN`
- Database provider is `postgresql` — do not revert to sqlite
- Prisma migrations use `db push` in dev; run `npx prisma db seed` after schema changes
- Secrets managed via Replit Secrets tab (not .env files)
