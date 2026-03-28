@AGENTS.md

# BodyGood E-Commerce — Project Guide for Claude Code

## What this project is
A Next.js 16 e-commerce application for GLP-1/weight-loss medications. It is bilingual (English + Spanish), uses Prisma ORM with PostgreSQL, and integrates PayPal for payments. It is hosted on Replit.

## Running the project
```bash
npm run dev       # starts on http://localhost:5000
npm run build
npm run start
```
Dev server binds to `0.0.0.0:5000` — required for Replit's preview iframe.

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Prisma ORM (`src/lib/db.ts` exports the singleton client)
- **Payments**: PayPal (`@paypal/react-paypal-js`)
- **i18n**: `next-intl` — locale is in the URL path (`/en/...` and `/es/...`)
- **Package manager**: npm

## Project structure
```
src/
  app/
    [locale]/          # all user-facing pages scoped to locale
      page.tsx         # homepage
      products/        # product listing + detail
      quiz/            # quiz funnel + result
      checkout/        # PayPal checkout
      cart/            # cart page
      blog/            # blog listing + article
      admin/           # admin dashboard (stats + orders)
      about/ faq/ pricing/ reviews/ referrals/
      hipaa-notice/ privacy/ terms/ refund-policy/
      telehealth-consent/ how-it-works/ programs/
      insurance-check/
    api/               # API routes (server-side only)
      orders/          # POST create order
      discount/        # POST validate discount code
      quiz-lead/       # POST capture quiz lead
      reviews/         # GET/POST reviews
      referrals/       # POST create referral
      insurance-probability/ # GET insurance coverage data
    layout.tsx         # root layout (analytics, fonts)
    globals.css
  components/
    layout/            # Header, Footer, LanguageToggle
    sections/          # Hero, HomeCTAs, StatsBar, TrustBar
    ui/                # Button, Card, Badge, Accordion, Container
    quiz/              # QuizEngine, QuizStep, BMICalculator, EmailCapture, InsuranceQuestions, InterstitialCard
    checkout/          # PayPalButton
    product/           # AddToCartButton
    reviews/           # ReviewList
    analytics/         # Analytics (GA4 + Meta Pixel)
  context/
    CartContext.tsx     # cart state (React context)
  i18n/
    request.ts         # next-intl server config
    routing.ts         # locale routing config (locales: ["en","es"], defaultLocale: "en")
  lib/
    db.ts              # Prisma client singleton
    webhooks.ts        # fires events to N8N_WEBHOOK_URL (fire-and-forget, safe if unset)
  middleware.ts        # locale detection + routing
messages/
  en.json              # English translations
  es.json              # Spanish translations
prisma/
  schema.prisma        # PostgreSQL schema (provider: postgresql)
  seed.ts              # seed script — run with: npx prisma db seed
```

## Database
- Provider: **PostgreSQL** (Replit-managed, connection via `DATABASE_URL` secret)
- ORM: Prisma 5
- Key models: `Product`, `ProductVariant`, `ProductTranslation`, `ProductImage`, `Order`, `OrderItem`, `DiscountCode`, `QuizLead`, `Referral`, `Review`, `BlogPost`, `BlogPostTranslation`, `FaqItem`, `FaqTranslation`, `InsuranceProbability`
- After schema changes: `npx prisma db push` (dev) or `npx prisma migrate dev`
- After schema changes always run: `npx prisma generate`

## Environment variables / secrets
| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL — set as Replit secret |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (public) |
| `PAYPAL_CLIENT_SECRET` | PayPal secret |
| `PAYPAL_SANDBOX` | `"true"` for sandbox mode |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel |
| `N8N_WEBHOOK_URL` | Optional — webhook events are silently skipped if unset |

## i18n conventions
- All user-facing pages live under `src/app/[locale]/`
- Use `useTranslations` (client) and `getTranslations` (server) from `next-intl`
- Translation keys live in `messages/en.json` and `messages/es.json`
- Never hardcode user-visible strings in components — always use the translation system
- The `locale` param comes from the route and is passed to Prisma queries where relevant

## API routes conventions
- All routes in `src/app/api/` are server-only
- Import Prisma via `import { db } from "@/lib/db"`
- Fire webhooks via `import { fireWebhook } from "@/lib/webhooks"` — always fire after successful DB writes, never before
- Return `NextResponse.json(...)` with appropriate HTTP status codes
- Validate inputs and return `400` for bad requests, `500` for server errors

## Key conventions
- Path alias `@/` maps to `src/`
- Prices are stored in **cents** (integers) throughout — always convert for display
- Product availability is controlled by `isActive` and `isAvailable` flags
- Reviews require `isApproved: true` before they appear publicly
- Orders start with status `"pending_intake"`

## Replit-specific notes
- Dev server must use port 5000 with `0.0.0.0` binding — do not change this
- `next.config.ts` includes `allowedDevOrigins` set dynamically from `REPLIT_DEV_DOMAIN`
- Database provider is `postgresql` (not sqlite) — do not revert this
- Do not commit `.env` files — secrets are managed by Replit
