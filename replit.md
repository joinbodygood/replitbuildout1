# Body Good Studio — E-Commerce Platform

## What This Is

A custom telehealth e-commerce platform for Body Good Studio, a physician-led weight loss practice founded by **Dr. Linda Moleon, MD**. This platform **replaces Shopify** as the storefront while keeping Zoho One for CRM/clinical operations and n8n for automation.

**This is a commerce-only platform — no PHI (Protected Health Information) is stored here.** All clinical data (medical intake, provider review, prescriptions) lives in Zoho One / GLOW portal. After checkout, patients are redirected to Zoho to complete their medical intake.

## Why Custom (Not Shopify, Not Medusa.js)

- Shopify can't handle quiz funnels, insurance logic, or bilingual UX natively
- Medusa.js required too many custom modules
- Clean-sheet Next.js gives full control over the funnel UX — the core competitive asset
- Built with Claude Code on Replit for rapid iteration

## Competitive Advantages

1. **Bilingual (EN/ES) from day one** — no competitor in telehealth weight loss offers Spanish
2. **Transparent all-inclusive pricing** — opposite of Hims/Found who hide costs behind quizzes
3. **Free insurance probability checker** — unique lead magnet
4. **One smart quiz with 4 outcomes** — not separate funnels, one branching flow
5. **$45 branded Rx program** — Wegovy/Zepbound prescription, undercuts Ro ($145/mo) and Walgreens ($49/visit)

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
| Products | `/admin/products` | ✅ List with pricing |
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
Add to Cart --> Cart --> Checkout (PayPal) --> Confirmation
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
- 4 recommendation pages (compounded, insurance, oral, branded) with DualPathCard
- Free insurance probability checker (/insurance-check)
- 251 insurance probability entries seeded for 10 carriers
- Quiz lead API + insurance probability API
- QuizLead schema extended with 9 patient-context fields

### Quiz Engine — Category Quizzes (4 Categories)
- **Shared infrastructure:** `CategoryQuizEngine.tsx` (declarative, reusable), `DualPathCard.tsx` (Ship-to-Door vs Pharmacy Rx dual-path result card)
- **Hair Restoration** (`/quiz/hair`) — 4 questions, 6 outcomes: women-mild, women-moderate, women-postpartum, men-mild, men-moderate, men-advanced
- **Skincare & Glow** (`/quiz/skin`) — 4 questions, 4 outcomes: anti-aging, brightening, hormonal-acne, rosacea
- **Feminine Health** (`/quiz/feminine-health`) — 4 questions, 4 outcomes: acute-infection (pharmacy-only), vaginal-dryness, intimate-wellness, hormonal-support
- **Mental Wellness** (`/quiz/mental-wellness`) — 4 questions, 6 outcomes: anxiety, sleep, depression, adhd-focus, mood-swings, energy-fatigue; includes 988 crisis safety banner
- WhatBringsYou homepage section links each card directly to its category quiz (no more "Coming Soon")

### Checkout & Payments
- Cart context with localStorage persistence, cart page, AddToCartButton
- Multi-step checkout (Info → Shipping → Payment → Confirmation)
- Real PayPal SDK integration (sandbox) — **NOTE: server-side verification not yet built**
- Order API (creates order in DB), discount code system
- 3 discount codes seeded (WELCOME25, SAVE10, FRIEND25)
- Confirmation page with "Complete Medical Intake" CTA → Zoho

### Growth Systems
- Referral program (unique links, share buttons, stats tracking)
- Review system (collection, moderation queue, display), 6 seeded testimonials
- Blog CMS with markdown rendering, 3 bilingual posts, listing + detail pages
- Admin dashboard (stats grid + recent orders — read-only)
- n8n webhook utility wired into all API routes

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
