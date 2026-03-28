# Body Good Studio — E-Commerce Platform

## What This Is

A custom telehealth e-commerce platform for Body Good Studio, a physician-led weight loss practice founded by Dr. Linda Moleon, MD. This platform **replaces Shopify** as the storefront while keeping Zoho One for CRM/clinical operations and n8n for automation.

**This is a commerce-only platform — no PHI (Protected Health Information) is stored here.** All clinical data (medical intake, provider review, prescriptions) lives in Zoho One / GLOW portal. After checkout, patients are redirected to Zoho to complete their medical intake.

## Why Custom (Not Shopify, Not Medusa.js)

- Shopify can't handle quiz funnels, insurance logic, or bilingual UX natively
- Medusa.js was evaluated but required so many custom modules it negated the framework advantage
- Clean-sheet Next.js gives full control over the funnel UX, which is the core competitive asset
- Built with Claude Code on Replit for rapid iteration

## Competitive Advantages Built Into This Platform

1. **Bilingual (EN/ES) from day one** — no competitor in the telehealth weight loss space offers Spanish
2. **Transparent all-inclusive pricing** — opposite of Hims/Found who hide costs behind quizzes
3. **Free insurance probability checker** — unique lead magnet, nobody else offers this
4. **One smart quiz with 4 outcomes** — not separate funnels, one branching flow
5. **$45 branded Rx program** — Wegovy/Zepbound prescription at a flat fee, undercuts Ro ($145/mo) and Walgreens ($49/visit)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Database | SQLite (dev) / PostgreSQL (production via Replit or AWS) |
| ORM | Prisma 5 |
| Payments | PayPal Commerce Platform (sandbox keys configured) |
| i18n | next-intl (EN/ES, locale-aware routing) |
| Styling | Tailwind CSS 4 with Body Good design tokens |
| Analytics | GA4 + Meta Pixel (env vars, production only) |
| Webhooks | n8n (fire-and-forget utility, silent when URL not set) |
| Auth | Stytch SMS OTP (not yet integrated — placeholder for checkout) |

## Design System

| Token | Value |
|-------|-------|
| Primary Red | `#ED1B1B` (`bg-brand-red`) |
| Soft Pink | `#FDE7E7` (`bg-brand-pink`) |
| Heading Font | Poppins (`font-heading`) |
| Body Font | Manrope (`font-body`) |
| Button Radius | 50px (`rounded-pill`) |
| Card Radius | 12px (`rounded-card`) |

## Database Schema (Prisma)

- **Product** + ProductTranslation + ProductVariant + ProductImage — 11 products seeded with full EN/ES translations and pricing matrix
- **InsuranceProbability** — 251 entries across 10 carriers, 10 states, 4 medications
- **QuizLead** — captures email, phone, BMI, quiz outcome, UTM params
- **FaqItem** + FaqTranslation — 7 bilingual FAQ entries
- **Order** + OrderItem — full order system with status workflow
- **DiscountCode** — 3 codes seeded (WELCOME25, SAVE10, FRIEND25)
- **Referral** — unique codes, credit tracking, completion status
- **Review** — 6 seeded testimonials with verified badges and moderation queue
- **BlogPost** + BlogPostTranslation — 3 bilingual blog posts

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

### Plan 1: Foundation
- [x] Next.js project with TypeScript, Tailwind CSS 4
- [x] Body Good design tokens (colors, fonts, radius, shadows, animations)
- [x] Bilingual i18n with next-intl (EN/ES routing at /en/... and /es/...)
- [x] UI component library (Button, Card, Container, Badge, Accordion)
- [x] Header with nav, mobile hamburger menu, cart badge, language toggle
- [x] Footer with link columns
- [x] Homepage (Hero, 3 CTAs, StatsBar, TrustBar)
- [x] About, How It Works, FAQ pages
- [x] 5 legal pages (Privacy, Terms, Telehealth Consent, HIPAA Notice, Refund Policy)
- [x] GA4 + Meta Pixel (production-only, env-driven)
- [x] Sitemap + robots.txt

### Plan 2: Product Catalog
- [x] Prisma schema with products, variants, translations, images
- [x] 11 products seeded with full EN/ES translations and pricing
- [x] Dynamic product pages (/products/[slug]) with tier pricing
- [x] Product listing page (/products)
- [x] Pricing comparison table (/pricing) grouped by category
- [x] Bridge page (/programs) — 4 cards for informed visitors

### Plan 3: Quiz Engine
- [x] Single smart quiz with branching logic and 4 outcome paths
- [x] 3 interstitial trust cards (stats, Dr. Linda, semaglutide vs tirzepatide)
- [x] BMI calculator with visual indicator
- [x] Email + phone capture (mid-quiz)
- [x] Medical disqualifier screens
- [x] Insurance detail collection with probability check
- [x] 4 recommendation pages (compounded, insurance, oral, branded)
- [x] Free insurance probability checker page (/insurance-check)
- [x] 251 insurance probability entries seeded for 10 carriers
- [x] Quiz lead API saves to database
- [x] Insurance probability API with carrier/plan/state lookup
- [x] localStorage quiz state persistence

### Plan 4: Checkout & Payments
- [x] Cart context with localStorage persistence
- [x] Cart page with quantity controls and order summary
- [x] AddToCartButton component
- [x] Cart badge in header
- [x] Multi-step checkout (Info -> Shipping -> Payment -> Confirmation)
- [x] Real PayPal SDK integration (sandbox)
- [x] Order API (creates order in database)
- [x] Discount code system (validate + apply at checkout)
- [x] 3 discount codes seeded (WELCOME25, SAVE10, FRIEND25)
- [x] Confirmation page with "Complete Medical Intake" CTA -> Zoho

### Plan 5: Growth Systems
- [x] Referral program (unique links, share buttons, stats)
- [x] Review system (collection, moderation queue, display)
- [x] 6 seeded testimonials with verified badges
- [x] ReviewList component for embedding on product pages
- [x] Blog CMS with markdown rendering
- [x] 3 bilingual blog posts seeded
- [x] Blog listing + detail pages with category badges
- [x] Admin dashboard (stats grid + recent orders table)
- [x] n8n webhook utility wired into all API routes

## What's NOT Built Yet

- [ ] Stytch SMS OTP authentication (checkout currently has no auth gate)
- [ ] Real PayPal production keys (sandbox is wired and working)
- [ ] AddToCartButton wired into product detail pages (component exists, not imported yet)
- [ ] Upsell engine UI on product/checkout pages (spec exists, not implemented)
- [ ] Admin CRUD for products, discounts, reviews, blog posts (dashboard is read-only)
- [ ] Shopify 301 redirect map
- [ ] Email templates for transactional emails (n8n handles sending)
- [ ] Dr. Linda's real photo in quiz interstitial card (placeholder "DL" initials)
- [ ] Contact page
- [ ] Before/after photo gallery
- [ ] Testimonial carousel on homepage (static trust badges exist)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/quiz-lead | POST | Save quiz lead to database + fire webhook |
| /api/insurance-probability | GET | Lookup coverage probability by carrier/plan/state |
| /api/orders | POST | Create order with line items + fire webhook |
| /api/discount | GET | Validate discount code |
| /api/referrals | POST | Generate referral code for email |
| /api/referrals | GET | Get referral stats for email |
| /api/reviews | GET | Get reviews (optionally filtered by product) |
| /api/reviews | POST | Submit review (pending admin approval) + fire webhook |

## Environment Variables

```
DATABASE_URL="file:./prisma/dev.db"          # SQLite for dev, PostgreSQL URL for prod
NEXT_PUBLIC_PAYPAL_CLIENT_ID=""               # PayPal client ID
PAYPAL_CLIENT_SECRET=""                       # PayPal secret
PAYPAL_SANDBOX="true"                         # "true" or "false"
NEXT_PUBLIC_GA4_ID=""                         # Google Analytics 4
NEXT_PUBLIC_META_PIXEL_ID=""                  # Meta/Facebook Pixel
N8N_WEBHOOK_URL=""                            # Optional — n8n webhook endpoint
```

## Team

| Role | Person | Platform Access |
|------|--------|----------------|
| Super Admin | Dr. Linda | Full |
| Support | Kira | Orders, patients, refunds |
| Marketing | Cassey | Campaigns, discounts, blog, analytics |
| Developer | Ayush | System settings, API, logs |
| Clinical (Zoho only) | Dr. Sharmaine, Jena PA, Rhea PA | Not on this platform |

## Key Files

- `prisma/schema.prisma` — database schema
- `prisma/seed.ts` — seed data for products, FAQs, reviews, blog posts, discount codes, insurance data
- `src/i18n/` — internationalization config
- `messages/en.json`, `messages/es.json` — translation strings
- `src/components/quiz/QuizEngine.tsx` — main quiz with branching logic
- `src/components/checkout/PayPalButton.tsx` — PayPal SDK integration
- `src/lib/webhooks.ts` — n8n webhook fire utility
- `src/lib/db.ts` — Prisma client singleton
- `src/context/CartContext.tsx` — cart state management

## Switching to PostgreSQL (Production)

1. Set `DATABASE_URL` to your PostgreSQL connection string
2. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
3. Add back `@db.Text` annotations on `ProductTranslation.descriptionLong`, `FaqTranslation.answer`, and `BlogPostTranslation.body`
4. Run `npx prisma migrate dev --name switch-to-postgres`
5. Run `npx prisma db seed`

## Reference Documents

- Full spec: `BODYGOOD-ECOMMERCE-SPEC.md` (in Desktop/body-good-output/)
- Competitor research: `COMPETITOR-ECOMMERCE-RESEARCH.md` (in Desktop/body-good-output/)
