# CLAUDE.md — Body Good Studio Admin Dashboard

## Project Overview

You are building the **admin dashboard** for Body Good Studio, a physician-led telehealth weight management practice. The customer-facing e-commerce storefront (joinbodygood.com) has already been built in Next.js. Your job is to build the **backend admin panel** — the equivalent of Shopify Admin — that gives the team full control over products, orders, patients, subscriptions, discounts, content, messaging, analytics, and system settings.

**This is NOT a new project.** You are adding an admin dashboard to an existing Next.js + PostgreSQL codebase. Do not scaffold a new project. Work within the existing repo structure.

## Tech Stack (Already In Place)

- **Framework:** Next.js 14+ (React/TypeScript)
- **Database:** PostgreSQL (AWS RDS)
- **ORM:** [check existing codebase — likely Prisma or Drizzle]
- **Auth:** Stytch (SMS OTP for patients). Admin auth needs email + password + 2FA (TOTP).
- **Payments:** PayPal Commerce Platform (REST API + Webhooks)
- **File Storage:** AWS S3
- **Hosting:** AWS (ECS/Fargate)
- **Help Desk:** Chatwoot (self-hosted, REST API + WebSocket)
- **Email:** Mailgun (API)
- **SMS:** Twilio (API)
- **Automation:** n8n (webhooks + REST API)

## Design System

All admin UI must follow the Body Good design system:

- **Primary Red:** #ED1B1B
- **Soft Pink:** #FDE7E7
- **Heading Font:** Poppins (700/600 weight)
- **Body Font:** Manrope (400/500/600 weight)
- **Heading Text:** #0C0D0F
- **Body Text:** #55575A
- **Borders:** #E5E5E5
- **Color Ratio:** 70% white / 20% pink / 10% red
- **Buttons:** Pill shape, 50px border-radius, → arrow on primary CTAs
- **Cards:** 12px border-radius
- **Aesthetic:** Clean, modern, Hims/Hers/Ro style. No emojis — use professional icons (Lucide or similar).
- **Responsive:** Desktop-first for admin (but tablet-friendly for Dr. Linda's iPad use).

## Admin Route Structure

All admin pages live under `/admin/*`. The admin layout includes:
- **Sidebar navigation** (collapsible) with icon + label for each section
- **Top bar** with user avatar, role badge, notifications bell, and search
- **Breadcrumbs** on every page
- **Toast notifications** for success/error feedback

## Team & Roles

The admin supports role-based access control (RBAC). Every feature must check the user's role before rendering or allowing actions.

| Role | People | Access |
|------|--------|--------|
| Super Admin | Dr. Linda | Everything |
| Clinical Admin | Dr. Linda, Dr. Sharmaine | Patients, intakes, provider dashboard, clinical messaging, prescriptions |
| Provider | Jena PA, Rhea PA | Assigned intakes, clinical messaging, approve/deny prescriptions |
| Support Agent | Kira | Orders, patient messaging (non-clinical), refunds, Chatwoot |
| Marketing | Cassey | Campaigns, discounts, blog/content, analytics (read-only for orders) |
| Developer | Ayush | System settings, API access, logs, integrations, all features |

---

# MODULES TO BUILD

Build these in order. Each module should be a complete, functional section before moving to the next.

---

## Module 1: Admin Authentication & Layout Shell

### Auth
- Email + password login at `/admin/login`
- Mandatory 2FA (TOTP) setup on first login — show QR code for authenticator app
- Session management: 8-hour session, 30-min inactivity timeout
- Password reset via email (Mailgun)
- Login audit log (timestamp, IP, success/fail)

### Layout
- Sidebar with sections: Dashboard, Orders, Products, Patients, Subscriptions, Discounts, Content, Messaging, Marketing, Analytics, Settings
- Each section has sub-pages (defined in modules below)
- Sidebar collapses to icons on smaller screens
- Top bar: search (global), notifications dropdown, user menu (profile, logout)
- Dark mode toggle (optional but nice to have)

### RBAC Middleware
- Create a permissions matrix based on the roles table above
- Every API route and page component checks permissions
- Unauthorized access returns 403 and redirects to dashboard

---

## Module 2: Dashboard (Home)

**Route:** `/admin`

This is Dr. Linda's daily command center. It should load fast and show the most important numbers at a glance.

### KPI Cards (Top Row)
- Revenue today / this week / this month (from PayPal + orders DB)
- New orders today
- Active subscriptions count
- New patients this week
- Churn rate (30-day rolling)
- MRR (Monthly Recurring Revenue)

### Charts
- Revenue trend (line chart, last 30 days, with comparison to prior period)
- Orders by status (donut chart: pending, processing, shipped, delivered, cancelled)
- Subscription growth (line chart: new vs. churned, last 90 days)
- Top products by revenue (horizontal bar chart, last 30 days)

### Activity Feed
- Recent orders (last 10)
- Recent support messages (from Chatwoot API)
- Recent patient sign-ups (last 10)
- Pending clinical intakes needing review

### Quick Actions
- Create discount code
- Send broadcast email
- View intake queue
- Process refund

---

## Module 3: Order Management

**Route:** `/admin/orders`

### Order List
- Table with columns: Order #, Date, Patient Name, Products, Total, Payment Status, Fulfillment Status, Actions
- Filters: date range, status (pending/processing/shipped/delivered/cancelled/refunded), product, payment status
- Search by order number, patient name, or email
- Bulk actions: mark shipped, export CSV
- Sort by date, total, status

### Order Detail (`/admin/orders/[id]`)
- Order summary: items, quantities, pricing, discounts applied, total
- Patient info card: name, email, phone, link to patient profile
- Payment info: PayPal transaction ID, payment method, status, refund history
- Fulfillment info: shipping address, tracking number (editable), carrier, status timeline
- Medical intake status: linked intake form, provider approval status
- Prescription status: DoseSpot Rx status if applicable
- Internal notes: text field for team notes (persisted, timestamped, shows author)
- Actions: mark shipped (with tracking #), process refund (full/partial), cancel order, resend confirmation email, contact patient

### Refund Processing
- Full refund or partial (enter amount)
- Calls PayPal Refund API
- Reason field (required)
- Auto-sends refund confirmation email to patient
- Updates order status and patient portal

---

## Module 4: Product Management

**Route:** `/admin/products`

### Product List
- Table: Product Name, Type, Price Range, Status (active/draft/archived), Subscriptions Count, Actions
- Filters: status, product type, subscription-enabled
- Quick actions: duplicate, archive, edit

### Product Editor (`/admin/products/[id]` or `/admin/products/new`)
- **Basic Info:** Name, slug (auto-generated, editable), short description, long description (rich text editor)
- **Media:** Image gallery with drag-and-drop upload (S3), reorder, alt text
- **Pricing:** Base price, commitment tiers (1-mo, 3-mo, 6-mo pricing), one-time vs. subscription toggle
- **Variants:** Dose levels with independent pricing (e.g., Tirzepatide Starter 2.25mg, 4.5mg, 7.5mg, 9mg)
- **Subscription Settings:** Billing interval, auto-refill default, pause rules, cancellation policy text
- **Inventory:** Requires-prescription flag, active/draft/archived status
- **SEO:** Meta title, meta description, OG image, canonical URL
- **Category & Tags:** Assign category, add tags
- **Related Products:** Select products for cross-sell/upsell display
- **Preview button:** Opens storefront product page in new tab

### Bulk Operations
- CSV import/export (products + variants + pricing)
- Bulk status change (archive, activate)
- Bulk price adjustment (percentage or fixed amount)

---

## Module 5: Patient Management

**Route:** `/admin/patients`

### Patient Directory
- Table: Name, Email, Phone, Program, Subscription Status, LTV, Last Order, Joined Date, Actions
- Filters: program type, subscription status (active/paused/cancelled), date range, LTV range
- Search: by name, email, phone
- Export: CSV

### Patient Profile (`/admin/patients/[id]`)

**Header:** Patient name, photo (if uploaded), email, phone, status badge, joined date, LTV

**Tabs:**

1. **Overview** — Current program, subscription status, next billing date, provider assignment, key dates
2. **Orders** — Full order history (reuses order list component, filtered to this patient)
3. **Subscriptions** — Active/past subscriptions with status, billing history, actions (pause/resume/cancel/upgrade)
4. **Medical** — Intake form responses (read-only), clinical notes from providers, prescription history, health tracking data (weight log, check-ins)
5. **Messages** — Conversation history from Chatwoot (pulled via API), with ability to reply directly from admin
6. **Referrals** — Referral link, referred patients list, credits earned/applied
7. **Reviews** — Reviews submitted by this patient, moderation status
8. **Activity Log** — Timestamped log of all account activity (logins, orders, subscription changes, messages)

**Actions:** Add admin note, send email, send SMS, suspend account, merge with another account, reset auth

---

## Module 6: Subscription Management

**Route:** `/admin/subscriptions`

### Subscription List
- Table: Patient, Product, Status (active/paused/cancelled/past-due), Billing Interval, Next Billing Date, MRR Contribution, Actions
- Filters: status, product, billing interval, next billing date range
- Aggregate stats at top: total active, total MRR, churn this month

### Subscription Detail (`/admin/subscriptions/[id]`)
- Subscription info: product, plan, pricing, billing interval, start date, next billing, status
- Billing history: every charge attempt with status (paid/failed/refunded), PayPal transaction IDs
- Actions: pause (set resume date), resume, cancel (with or without retention offer), change plan/interval, apply credit, skip next billing, change billing date

### Dunning Management
- View all past-due subscriptions
- See retry schedule and attempt history
- Manual retry button
- Send dunning email manually
- Grace period configuration

---

## Module 7: Discount & Promotion Engine

**Route:** `/admin/discounts`

### Discount List
- Table: Code, Type, Value, Usage (used/limit), Status (active/expired/scheduled), Created Date, Actions
- Filters: type (percentage/fixed/free-shipping), status, date range

### Discount Builder (`/admin/discounts/new` or `/admin/discounts/[id]`)
- **Code:** Auto-generate or custom entry
- **Type:** Percentage off, fixed amount off, free shipping
- **Value:** Percentage or dollar amount
- **Applies To:** All products, specific products, specific categories
- **Requirements:** Minimum order value, minimum quantity, first-time patient only, specific subscription tier
- **Limits:** Total redemptions limit, per-patient limit, one-per-patient toggle
- **Scheduling:** Start date/time, end date/time, or no expiration
- **Stackable:** Can combine with other discounts (yes/no)
- **Referral Credits:** Toggle whether referral credits can stack with this discount

### Bulk Code Generation
- Generate X unique codes with a common prefix (e.g., SPRING25-XXXX)
- Set shared rules for the batch
- Export generated codes as CSV (for influencer distribution)

### Analytics
- Per-discount: total redemptions, revenue generated with discount, average discount amount
- Overall: total discounts given this month, revenue impact

---

## Module 8: Content Management (Pages & Blog)

**Route:** `/admin/content`

### Pages (`/admin/content/pages`)
- List all pages with title, slug, status (published/draft), last modified
- Page editor with block-based content builder:
  - Blocks: Hero, Text (rich text), Image, Video Embed, Testimonial Carousel, Pricing Table, FAQ Accordion, CTA Button, Form Embed, HTML/Code Embed, Before/After Gallery
  - Drag-and-drop reorder
  - Each block has its own settings panel
- SEO fields: meta title, meta description, OG image, canonical URL
- URL/slug management with 301 redirect creation for changed slugs
- Draft/publish toggle, scheduled publish, revision history
- Preview button (opens page in storefront)

### Blog (`/admin/content/blog`)
- Post list: title, author, category, status, published date
- Post editor: rich text with image upload, video embed, callout boxes
- Categories and tags management
- Author selection (defaults to Dr. Linda)
- Featured image
- Excerpt (auto-generated or custom)
- Related posts (auto-suggested or manual)
- Inline CTA blocks (embed quiz start button, product link)
- SEO fields per post
- RSS feed auto-generation

### Navigation (`/admin/content/navigation`)
- Visual menu builder for header and footer navigation
- Drag-and-drop menu items with nesting
- Link to pages, products, categories, external URLs, or custom routes

### Redirects (`/admin/content/redirects`)
- List all 301 redirects
- Add/edit/delete redirects (from path → to path)
- Import redirects from CSV (critical for Shopify migration — there will be hundreds)
- Redirect hit counter

---

## Module 9: Messaging & Chatwoot Integration

**Route:** `/admin/messaging`

### Inbox (`/admin/messaging/inbox`)
- Unified view pulling from Chatwoot API
- Tabs: All, Clinical, Support, Sales (matching Chatwoot inbox structure)
- Conversation list: patient name, last message preview, timestamp, status (open/pending/resolved), assigned agent, priority label
- Conversation detail: full message thread, reply composer, file attachments, canned response selector, assign/reassign agent, add label, resolve/reopen
- Patient info sidebar: pulled from patient profile, shows current program, subscription status, recent orders

### Canned Responses (`/admin/messaging/canned`)
- CRUD for canned response templates
- Categories: General, Shipping, Billing, Clinical, Onboarding
- Variables: {{patient_name}}, {{order_number}}, {{product_name}}, {{tracking_url}}

### Claudia AI Settings (`/admin/messaging/ai`)
- Toggle Claudia on/off per inbox
- View AI-handled vs. human-handled conversation stats
- Escalation rule configuration (keywords, sentiment thresholds)
- Review AI responses (sampling dashboard)

---

## Module 10: Marketing Hub

**Route:** `/admin/marketing`

### Email Campaigns (`/admin/marketing/email`)
- Campaign list: name, status (draft/scheduled/sent), audience size, open rate, click rate, send date
- Campaign builder:
  - Audience: all patients, segment by product/status/tag/custom filter
  - Template: select from branded templates or custom HTML
  - Content: subject line, preview text, body (rich text or HTML)
  - Schedule: send now or schedule date/time
  - Test: send test email to admin addresses before broadcast
- Sequence manager: view/edit automated sequences (abandoned quiz, onboarding, retention, re-engagement)
  - Visual flow: show trigger → wait → email → condition → branch
  - Edit individual emails within sequence
  - Toggle sequences on/off

### SMS Campaigns (`/admin/marketing/sms`)
- Same structure as email but for Twilio SMS
- Character count with segment indicator
- Opt-out compliance (STOP handling, quiet hours config)
- Keyword flow manager (COST, HELP, etc.)

### Referral Program (`/admin/marketing/referrals`)
- Program settings: reward amounts (referrer credit, referred discount), attribution window, minimum qualification
- Referral activity: list of all referrals with referrer, referred patient, status (pending/credited/expired), date
- Top referrers leaderboard
- Manual credit/debit

### Review Management (`/admin/marketing/reviews`)
- Moderation queue: pending reviews with approve/reject/edit actions
- Published reviews list with ability to hide/feature
- Review request settings: trigger timing, email/SMS template, follow-up rules
- Before/After gallery curator: approve/reject/feature submitted photos
- Aggregate stats: average rating, total reviews, sentiment breakdown

---

## Module 11: Analytics

**Route:** `/admin/analytics`

### Revenue (`/admin/analytics/revenue`)
- Revenue by day/week/month (line chart with period comparison)
- Revenue by product (bar chart)
- Revenue by subscription tier (1-mo vs 3-mo vs 6-mo)
- Refund totals
- MRR trend
- ARPU (Average Revenue Per User)

### Patients (`/admin/analytics/patients`)
- New patients over time
- Active vs. churned
- Retention cohort analysis (simple: % still active at 30/60/90/180 days)
- LTV distribution

### Funnels (`/admin/analytics/funnels`)
- Quiz start → quiz complete → checkout start → checkout complete → intake complete → prescription approved
- Drop-off at each step with percentages
- By quiz type
- A/B test results (if running)

### Marketing (`/admin/analytics/marketing`)
- Email campaign performance aggregate
- SMS campaign performance aggregate
- Referral program ROI
- Discount code impact

### Windsor.ai Integration
- Embed or link to Windsor.ai dashboards for cross-platform ad performance
- Or pull Windsor data via API: Google Ads ROAS, Meta Ads ROAS, total ad spend, cost per acquisition

---

## Module 12: Settings

**Route:** `/admin/settings`

### General (`/admin/settings/general`)
- Business name, logo upload, favicon upload
- Contact email, phone, address
- Social media URLs

### Design (`/admin/settings/design`)
- Theme editor: edit design tokens (colors, fonts, spacing, border radius)
- Live preview panel showing changes before save
- Logo and brand asset management
- Global CSS overrides (for developer use)

### Team (`/admin/settings/team`)
- User list: name, email, role, last login, status
- Invite new team member (email invite)
- Edit role assignments
- Deactivate/reactivate accounts
- Activity log per user

### Integrations (`/admin/settings/integrations`)
- Connection status for each integration: PayPal, Chatwoot, Mailgun, Twilio, Stytch, DoseSpot, n8n, GA4, Meta Pixel, Windsor.ai
- API key management (masked display, regenerate)
- Webhook log: recent incoming webhooks with payload preview and status
- Test connection button per integration

### Notifications (`/admin/settings/notifications`)
- Configure which events trigger admin notifications
- Per-user notification preferences (email, in-app, Slack)
- Slack integration (send alerts to Body Good Slack channels)

### SEO (`/admin/settings/seo`)
- Global meta defaults (title template, description)
- Google Analytics tracking ID
- Google Search Console verification
- Sitemap URL display
- robots.txt editor

### Legal (`/admin/settings/legal`)
- Edit policy page content (Privacy, Terms, HIPAA Notice, Telehealth Consent, Refund Policy)
- Version history for legal documents

---

# IMPORTANT IMPLEMENTATION NOTES

## Database
- Check existing schema before creating new tables. Extend what exists.
- All admin tables need: `id`, `created_at`, `updated_at`, `created_by` (user ID), soft delete (`deleted_at`).
- All PHI-adjacent tables need access logging.
- Use database transactions for multi-step operations (e.g., refund = PayPal API call + order status update + patient notification).

## API Routes
- All admin API routes under `/api/admin/*`
- Every route must validate auth token AND check RBAC permissions
- Rate limit admin API routes (100 req/min per user)
- Return consistent error format: `{ error: string, code: string, details?: object }`
- Log all write operations to audit trail

## UI Components
- Use a component library consistent with the existing storefront (check what's already installed — likely shadcn/ui, Radix, or similar)
- Build reusable admin components: DataTable, FormBuilder, StatCard, Chart wrapper, Modal, Drawer, Toast
- All tables must support: sorting, filtering, pagination (server-side for large datasets), row selection, CSV export
- All forms must support: validation (Zod), error display, loading states, optimistic updates where appropriate

## Performance
- Server-side pagination for all list views (never load all records client-side)
- Dashboard KPIs should be cached (Redis or in-memory) with 5-minute TTL
- Charts should lazy-load and show skeleton states
- Image uploads should compress client-side before S3 upload

## Security
- Never expose internal IDs in URLs without auth check
- Sanitize all user inputs (especially rich text editors — prevent XSS)
- CSRF protection on all mutation endpoints
- Admin session tokens separate from patient session tokens
- Log all admin actions to audit trail with: user, action, target entity, timestamp, IP

## PayPal Integration
- PayPal Commerce Platform REST API: https://developer.paypal.com/api/rest/
- Orders API for one-time payments
- Subscriptions API for recurring billing
- Use webhook events for real-time status updates (don't poll)
- Store PayPal transaction IDs alongside internal order IDs

## Chatwoot Integration
- Chatwoot API docs: https://www.chatwoot.com/developers/api/
- Pull conversations, messages, contacts
- Push replies from admin messaging interface
- Sync patient profiles as Chatwoot contacts
- Respect inbox routing (Clinical, Support, Sales)

---

# BUILD ORDER

1. **Module 1** — Auth + Layout Shell + RBAC (everything else depends on this)
2. **Module 2** — Dashboard (gives Dr. Linda immediate value)
3. **Module 3** — Orders (highest operational priority)
4. **Module 4** — Products (must manage catalog)
5. **Module 5** — Patients (360 view)
6. **Module 6** — Subscriptions (revenue management)
7. **Module 7** — Discounts (growth lever)
8. **Module 8** — Content/Pages/Blog (marketing needs)
9. **Module 9** — Messaging/Chatwoot (support workflow)
10. **Module 10** — Marketing Hub (campaigns + referrals + reviews)
11. **Module 11** — Analytics (data-driven decisions)
12. **Module 12** — Settings (system config)

---

# REFERENCE: Current Pricing Matrix

| Program | 1-Mo | 3-Mo | 6-Mo |
|---------|------|------|------|
| Tirzepatide (One-Time) | $315 | — | — |
| Tirzepatide Starter (2.25–9mg) | $299 | $279 | $259 |
| Tirzepatide Maintenance (11.25mg+) | $349 | $329 | $319 |
| Semaglutide | $179 | $149 | $139 |
| Oral GLP-1 | $149/$129 | $119 | $109 |
| Branded Rx Mgmt | $55 | $45 | $25 |
| Insurance — Eligibility | $25 one-time | — | — |
| Insurance — Prior Auth | $50 one-time | — | — |
| Insurance — Approval | $85 one-time | — | — |
| Insurance — Ongoing | $75/mo | — | — |

---

# REFERENCE: Domain Structure

- **Storefront:** joinbodygood.com (already built)
- **Patient Portal:** my.joinbodygood.com (already built)
- **Admin Dashboard:** admin.joinbodygood.com OR joinbodygood.com/admin (your choice based on existing setup)
- **Chatwoot:** support.bodygoodstudio.com (self-hosted)
- **API:** api.bodygoodstudio.com (HIPAA VPS)
