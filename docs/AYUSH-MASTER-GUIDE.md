# Body Good Studio — Master Developer Guide for Ayush

**Date:** 2026-04-03
**From:** Dr. Linda + Claude (Architecture)
**Purpose:** Everything you need to understand the full system, what lives where, and how to work across all repos.

---

## System Overview

Body Good Studio is a telehealth weight loss practice. The tech platform has 4 main systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                     BODY GOOD PLATFORM                          │
├──────────────────┬──────────────────┬───────────────────────────┤
│                  │                  │                           │
│  STOREFRONT      │  ADMIN DASHBOARD │  REFILL SYSTEM            │
│  (customer-      │  (staff portal)  │  (subscription mgmt)      │
│   facing site)   │                  │                           │
│                  │  ┌────────────┐  │  ┌───────────────────┐    │
│  Quiz → Checkout │  │ Orders     │  │  │ Refill API        │    │
│  Insurance Check │  │ Patients   │  │  │ (Express backend) │    │
│  Products        │  │ PA Module ←┤──┤──│                   │    │
│  Blog/Content    │  │ Content    │  │  │ Refill UI         │    │
│                  │  │ Marketing  │  │  │ (Next.js frontend)│    │
│                  │  └────────────┘  │  └───────────────────┘    │
│                  │                  │                           │
│  replitbuildout1 │  replitbuildout1 │  bodygood-refill-api      │
│                  │  (same repo)     │  bodygood-refill-ui       │
└──────────────────┴──────────────────┴───────────────────────────┘
```

---

## GitHub Repos — What's What

### The 4 repos you need to care about:

| # | Repo | What It Is | Stack | Branch | Status |
|---|------|-----------|-------|--------|--------|
| 1 | **`joinbodygood/replitbuildout1`** | Main platform — storefront + admin dashboard + PA module | Next.js 16, TypeScript, Prisma 5, PostgreSQL, PayPal | `main` (storefront) + `feat/pa-module` (PA backend) | Storefront: complete. Admin: functional. **PA module: backend complete, frontend stubs only — YOUR JOB** |
| 2 | **`joinbodygood/bodygood-refill-api`** | Refill system backend — tokenized no-login refill flow | Express.js 4, TypeScript, Prisma 5, Gmail API, Twilio, PayPal | `main` | Scaffolded, plan complete. **YOUR JOB to finish** |
| 3 | **`joinbodygood/bodygood-refill-ui`** | Refill system frontend — patient check-in + admin queue | Next.js 16, React 19, TypeScript, Tailwind, PayPal SDK | `main` | Scaffolded. **YOUR JOB to finish** |
| 4 | **`joinbodygood/bodygood-storefront`** | Original storefront (Medusa-based, may be superseded by replitbuildout1) | Next.js 16, React 19, TypeScript, Tailwind | `main` | 22 commits. Check with Dr. Linda if this is still active or replaced |

### Repos you do NOT need to touch:

| Repo | What It Is | Why You Skip It |
|------|-----------|-----------------|
| `joinbodygood/body-good-ad-intelligence` | AI marketing intelligence (ad spy, competitor intel) | Marketing team tool, not part of the platform |
| `joinbodygood/body-good-agents` | AI agent templates | Stub only, future project |
| `bodygood-theme` (local only) | Old Shopify theme assets | Shopify is being replaced by the Replit build |

---

## Repo 1: `replitbuildout1` — The Main Platform

**Clone:** `git clone https://github.com/joinbodygood/replitbuildout1.git`
**Deploy target:** Replit (dev server on port 5000)

### What's already built (DO NOT MODIFY unless fixing bugs):

**Customer-facing storefront** (`src/app/[locale]/`)
- Homepage, programs, quiz engine (4 outcomes), product catalog (11 products)
- PayPal checkout (sandbox working)
- Insurance check ("What Are My Odds?" probability tool)
- Insurance eligibility intake ($25 purchase)
- Blog, FAQ, legal pages
- Bilingual (EN/ES) via next-intl
- Patient-facing insurance status page (`/insurance-status`)

**Admin dashboard** (`src/app/admin/`)
- Auth system (custom session-based, bcrypt, 8hr cookies)
- RBAC (6 roles: super_admin, clinical_admin, provider, support, marketing, developer)
- Working pages: Dashboard (KPIs + charts), Orders, Products, Patients, Discounts, Referrals, Content/Reviews, Legal Pages, Settings, Import tools
- Sidebar with 22+ nav items
- Chatwoot helpdesk integration

**Insurance pipeline** (`src/lib/insurance/`)
- Stedi 270/271 eligibility check
- Confidence engine (5-source coverage scoring)
- Probability database (carrier × state × medication matrix)
- Web search for formulary data
- Cloudflare Worker relay

### What's on `feat/pa-module` (YOUR WORK):

**PA Module backend** (`src/lib/pa/` + `src/app/api/pa/`)
- 9 service files, 11 API routes — **COMPLETE, DO NOT MODIFY**
- 4 Prisma models (need migration on Replit)
- Scorched Earth letter engine (5 rounds)
- Payment triggers (PayPal → case stage advancement)
- See `docs/AYUSH-PA-HANDOFF.md` for full API reference

**What you build:**
- 3 admin frontend pages: Work Queue, Case List, Case Detail
- See `docs/pa-module-mockup.html` for visual reference
- See `docs/AYUSH-PA-HANDOFF.md` for complete instructions

### Setup

```bash
git clone https://github.com/joinbodygood/replitbuildout1.git
cd replitbuildout1
git checkout feat/pa-module
npm install
cp .env.example .env                          # Fill in values
npx prisma migrate dev --name add_pa_module   # Creates PA tables
npx prisma generate
npm run dev                                    # Port 5000
```

### Key files to understand:

| File | Why |
|------|-----|
| `CLAUDE.md` | Project conventions, stack details, path aliases |
| `docs/AYUSH-PA-HANDOFF.md` | PA module API reference + what to build |
| `docs/pa-module-mockup.html` | Interactive UI mockup (open in browser) |
| `docs/superpowers/specs/2026-04-03-pa-module-design.md` | Full design spec |
| `src/lib/admin-auth.ts` | Auth helper + RBAC — use `getAdminUser()` in all admin routes |
| `src/lib/db.ts` | Prisma singleton — import as `import { db as prisma } from "@/lib/db"` |
| `src/components/admin/AdminSidebar.tsx` | Sidebar nav — your new pages are already linked |
| `src/lib/pa/types.ts` | All TypeScript interfaces for PA module |
| `src/lib/pa/constants.ts` | ICD-10 codes, stages, drugs, denial reasons |
| `.env.example` | All environment variables documented |

---

## Repo 2: `bodygood-refill-api` — Refill Backend

**Clone:** `git clone https://github.com/joinbodygood/bodygood-refill-api.git`
**Deploy target:** Replit (separate deployment)

### What it does:

Tokenized no-login refill system. Patients get email/SMS with a magic link → complete check-in → payment captured → Rx refill processed. No login required.

### Architecture:

```
Patient gets SMS/email with token link
  → GET /api/refill/validate-token
  → POST /api/refill/checkin (health questions)
  → PayPal auto-captures subscription payment
  → Pharmacy notified for refill
  → Admin queue shows pending refills for Kira
```

### Current state:

- Scaffolded (project init, dependencies, tsconfig)
- Full implementation plan at: `C:\Users\admin\Desktop\body-good-output\docs\superpowers\plans\2026-04-03-refill-backend-microservices.md`
- Copy this plan into the repo for reference

### Key services to build:

| Service | Purpose |
|---------|---------|
| `token` | Generate/validate secure refill tokens (SHA-256 hashed, 72hr expiry) |
| `checkin` | Patient check-in form submission + clinical flag detection |
| `notification` | Gmail API emails + Twilio SMS (7 templates) |
| `payment` | PayPal subscription capture + webhook handling |
| `subscription` | Skip, pause, cancel, change plan |
| `upsell` | Smart product recommendations based on patient profile |
| `pharmacy` | Pharmacy search (NCPDP/NPI) |
| `admin` | Refill queue for Kira (approve, flag, escalate) |
| `cron` | 7 scheduled jobs (reminders, nudges, escalations, billing) |

### Setup:

```bash
git clone https://github.com/joinbodygood/bodygood-refill-api.git
cd bodygood-refill-api
npm install
cp .env.example .env    # Fill in values
npx prisma migrate dev
npm run dev
```

---

## Repo 3: `bodygood-refill-ui` — Refill Frontend

**Clone:** `git clone https://github.com/joinbodygood/bodygood-refill-ui.git`
**Deploy target:** Replit (separate deployment, or subdomain of main site)

### What it does:

Mobile-first frontend for the refill system. Two interfaces:
1. **Patient refill flow** — token-based, no login, mobile-first check-in + payment
2. **Admin refill queue** — Kira's workspace for managing refills

### Current state:

Scaffolded (Next.js 16 project init). Needs full implementation.

### Calls:

All API calls go to the `bodygood-refill-api` backend.

---

## How The Systems Connect

```
CUSTOMER JOURNEY:

Free Quiz ──→ Score >65% ──→ Pay $25 Eligibility ──→ Team Reviews
                                                         │
                                            ┌────────────┴────────────┐
                                            │                         │
                                        ELIGIBLE                NOT ELIGIBLE
                                            │                         │
                                    Pay $50 PA                   Self-pay or
                                            │                     leave
                                  Jena/Rhea run                      
                                  Scorched Earth                     
                                  (up to 5 rounds)                   
                                            │                        
                                  ┌─────────┴─────────┐             
                                  │                   │              
                              APPROVED             DENIED            
                                  │               (all rounds)       
                            Pay $85 activate          │              
                            Pay $75/mo ongoing    Self-pay offer     
                                  │                                  
                         ┌────────┴────────┐                         
                         │    HANDOFF      │                         
                         │  Jena/Rhea DONE │                         
                         │  Kira takes over│                         
                         └────────┬────────┘                         
                                  │                                  
                          3 weeks later:                              
                          Refill reminder                            
                          (email + SMS)                              
                                  │                                  
                          Patient clicks link                        
                          (no login needed)                          
                                  │                                  
                          Check-in + payment                         
                          auto-captured                              
                                  │                                  
                          Rx sent to pharmacy                        
                          ↓ repeat monthly                           
```

### System boundaries:

| What | Where | Who Owns |
|------|-------|----------|
| Free probability quiz | `replitbuildout1` — `/insurance-check` | Automatic |
| $25 eligibility check | `replitbuildout1` — `/api/coverage-check` + `/api/pa/eligibility-check` | Automatic → Jena/Rhea review |
| PA processing (5 rounds) | `replitbuildout1` — `/api/pa/*` + admin pages | Jena & Rhea |
| Activation + $75/mo subscription | `replitbuildout1` — PayPal flow | Automatic |
| Refill reminders + check-ins | `bodygood-refill-api` + `bodygood-refill-ui` | Kira |
| Customer support | Chatwoot (integrated in admin) | Kira |

### Integration point (future):

The PA module fires a `pa.approved` webhook event when a drug is approved. The refill system should listen for this to:
- Start the 3-week countdown to first refill reminder
- Know which medication was approved
- Link the patient for ongoing refill management

This webhook bridge is documented but **not built yet**. Build it once both systems are running.

---

## Team Roles (Who Uses What)

| Person | Role | Systems They Use |
|--------|------|-----------------|
| **Dr. Linda** | Owner, Prescribing Physician | Admin dashboard (all access) |
| **Jena** | PA Specialist | PA Work Queue, Case Detail (clinical_admin role) |
| **Rhea** | PA Specialist | PA Work Queue, Case Detail (clinical_admin role) |
| **Kira** | Customer Support | Refill queue, Chatwoot, order management (support role) |
| **Ayush** | Developer | All repos (developer role — wildcard access) |

---

## Build Priority

**Phase 1 (Now):**
1. PA Module frontend — 3 admin pages in `replitbuildout1` on `feat/pa-module`
2. Medical provider module rebuild (your existing work)
3. Patient portal rebuild (your existing work)

**Phase 2 (After PA is live):**
4. Refill API — complete `bodygood-refill-api` services
5. Refill UI — build `bodygood-refill-ui` patient + admin interfaces
6. Wire PA → Refill webhook bridge

**Phase 3 (Future):**
7. Production PayPal keys (currently sandbox)
8. Stytch SMS OTP for checkout
9. Admin CRUD for products, discounts, reviews, blog

---

## Environment Variables (All Repos)

### replitbuildout1

See `.env.example` in the repo. Key vars:
- `DATABASE_URL` — PostgreSQL
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
- `STEDI_API_KEY` — eligibility verification
- `S3_*` — insurance card storage
- `PA_STATUS_WEBHOOK_URL` — outbound PA events
- `N8N_WEBHOOK_URL` — automation webhooks
- `ANTHROPIC_API_KEY` — Claude API

### bodygood-refill-api

See `.env.example` in the repo. Key vars:
- `DATABASE_URL` — PostgreSQL (can be same or separate DB)
- `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` / `GMAIL_REFRESH_TOKEN`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE`
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
- `APP_URL` — refill UI base URL (for token links)

---

## Zoho Migration

Zoho CRM and Creator are being **fully replaced** by these systems. Migration script exists at `replitbuildout1/scripts/migrate-zoho.ts`.

**Steps:**
1. Export Zoho CRM `Eligibility_Check_Module` → CSV → JSON
2. Export Zoho Creator `Prior_Authorization_Module` → CSV → JSON
3. Place files in `scripts/data/` on Replit
4. Run `npx tsx scripts/migrate-zoho.ts`

**CRITICAL: Do NOT run Zoho exports through Claude Code — this is PHI. Handle in a HIPAA-safe environment only.**

---

## Questions? Contact

- **Dr. Linda** — product decisions, clinical requirements
- **Architecture questions** — reference this doc + the specs in `docs/superpowers/`
- **If something in the code doesn't match the docs** — the code is authoritative. Docs may lag.
