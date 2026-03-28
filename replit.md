# BodyGood E-Commerce

A Next.js 16 e-commerce application for GLP-1/weight-loss medications with internationalization (English + Spanish), PayPal payments, and a Prisma-backed PostgreSQL database.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Replit-managed), accessed via Prisma ORM
- **Payments**: PayPal (@paypal/react-paypal-js)
- **i18n**: next-intl (en / es locales)
- **Package manager**: npm

## Architecture

- `src/app/` — Next.js App Router pages (locale-scoped under `[locale]/`)
- `src/app/api/` — API routes: discount, insurance-probability, orders, quiz-lead, referrals, reviews
- `src/components/` — Shared React components
- `src/context/` — React context providers
- `src/i18nlib/` — i18n utilities
- `src/middleware.ts` — Next.js middleware (locale routing)
- `prisma/schema.prisma` — Database schema (PostgreSQL)
- `prisma/seed.ts` — Database seeder

## Environment Variables / Secrets

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Replit-managed) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (public) |
| `PAYPAL_CLIENT_SECRET` | PayPal secret key |
| `PAYPAL_SANDBOX` | `"true"` for sandbox mode |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID |

## Running Locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev       # starts on port 5000
```

## Replit Migration Notes

- Dev/start scripts bind to `0.0.0.0:5000` for Replit preview compatibility
- SQLite provider changed to PostgreSQL to use the Replit-managed database
- Prisma schema pushed to the Replit PostgreSQL instance
