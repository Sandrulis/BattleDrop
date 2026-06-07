# BattleDrop

Weekly product battles for early-stage founders. Community votes, promoted leaderboard spots, and a Product Hunt–style feed — Next.js frontend with Supabase auth, project submissions, and admin tooling.

**Repository:** [github.com/Sandrulis/BattleDrop](https://github.com/Sandrulis/BattleDrop)  
**Current version:** `0.1.14` (see [Changelog](#changelog))

---

## Features

### Public

- **Weekly leaderboard** — **published projects** for the displayed battle week from Supabase; project **favicons** on feed rows; promoted insertions from `promoted_slots`; votes disabled until voting opens (demo counts still client-side until DB-backed)
- **Promoted spots** — book from **My Projects** after publishing; fixed positions (before #1, after #5, after #10); highlighted row + badge on home feed
- **Monthly championship** — banner with contender voting and countdown
- **Product pages** — detail view with comments, stats sidebar, and maker info
- **Archive** — season calendar grouped by month with historical week cards
- **Site identity** — configurable site name and slogan (header, footer, metadata, OG tags)
- **Date & time display** — site-wide defaults with optional per-user overrides
- **Currency display** — site-wide default currency with optional per-user overrides (EUR, USD, GBP)

- **Weekly battle hero** — resolves the **next enabled ISO week** when the current week is disabled; status badge (**Waiting battle week** / awaiting voting / voting open / closed); live countdown to **week start** and **voting opens**; per-week submit price in points; min-project progress bar
- **Weekly battle rules** — sidebar lists dynamic rules for the displayed week (entry fee, min projects, voting hours, one submit per user, one vote per day, pre-voting shuffle)
- **Pre-voting shuffle** — product order randomised on each page refresh until voting opens (server-side; avoids hydration mismatch)

> Home **leaderboard products** and **promoted bookings** use Supabase (`published` projects + `promoted_slots`). Votes and comments on the feed are still demo/client-side. Auth, user projects, admin entry counts, and **weekly battle context** (`getHomeBattleWeek()`) are wired to Supabase and per-week settings.

### Auth & projects

- **Google sign-in** — Supabase Auth with session refresh via `proxy.ts`; OAuth callback supports `?next=` return path
- **Submit product** — two-step flow (URL → review details); guests can start without signing in; **This week** panel uses the same resolved battle week as home (`getHomeBattleWeek()`)
  - **Step 1** — enter URL; pasted paths like `/dashboard` resolve to the **site root landing page** (`normalizeProjectSubmitUrl`) for preview, screenshot, and save — not login-gated app routes
  - **Signed-in users** get a duplicate check by **domain** before preview (guests skip client check — duplicate blocked on save)
  - **Step 2** — guests see **Login + Save** (not Save); draft stored in `sessionStorage`, then Google sign-in → return to `/submit` → auto-save
  - **Signed-in users** — standard **Save** button; edit via `/submit?projectId=…` (auth required)
  - Meta fetch (direct + Microlink fallback), favicon, screenshot proxy
- **Duplicate URLs** — signed-in submit flow checks domain before preview; save always checks server-side (active, soft-deleted, any owner)
- **My Projects** — list drafts, edit, soft-delete, full-page preview; **Publish** opens modal (target battle week, rules checkbox, entry fee, balance check); published entries show **Week N, YYYY** badge in the action row; **Promote** published entry (spot picker modal, booked slots shown as taken); insufficient points → redirect to **Buy points**
- **Points balance** — header badge (`fa-money-bill-wave`) between Submit and avatar; clickable → `/buy-points`; same link in publish/promote modals and submit side panel
- **Buy points** (`/buy-points`) — frontend-only top-up page (Stripe coming soon); point packages UI, account side panel with pricing reference; `?return=` for back navigation
- **User settings** (`/settings`) — date/time and currency preferences with account side panel (member since, last seen, quick links); site name, slogan, and default currency are admin-only

### Admin panel (`/admin-panel`)

- **Overview** — quick links to admin areas
- **Users** — all accounts, admin badge, last seen (5‑min throttle; shown in each user's own date/time format)
- **Projects** — placeholder UI
- **Battles** — weekly, monthly, and yearly subnav at `/admin-panel/battles`
  - Year switcher — active year, previous years with real entries, and next year for planning (`?year=`)
  - Weekly — 52 week cards; entry counts from **published projects only**; scrollable list auto-scrolls to active week
  - Week card badges — disabled (💩), min projects (👥 + count), points per submit (💵 + `N points`, not currency symbol)
  - Per-week settings modal — enabled toggle, optional min projects, submit price override (saved via API to `battle_week_settings`)
  - Monthly — 12 month cards; yearly — years with entry counts, starting from active year
- **Settings** — site name, slogan, date/time display defaults, **regional defaults** (default currency), and **battle defaults** (`site_settings` table)
  - Default currency (EUR, USD, GBP) — used for price display when users have no personal override
  - Default submit price (shown in site currency)
  - Default hours until battle starts from ISO week beginning (Monday 00:00)
- **Todo** — shared admin task board (`admin_todos` table)
  - Two columns: **Tasks** (pending) and **In progress** — each column header shows a **task count** badge on the right
  - Drag-and-drop between columns, reorder within a column, drop indicator line
  - Shared trash zones above and below both columns (drag task there to delete)
  - Add task via header button → modal (title + description)
  - Edit task via pencil icon on each card → modal

### Security

- **SSRF protection** — user-supplied URLs validated before server fetch (`app/lib/security/safe-url.ts`)
- **Safe OAuth redirects** — `?next=` sanitized against open redirects
- **Rate limits** — public fetch routes (preview, screenshot, check-url) per IP
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy (`next.config.ts`)
- **Input limits** — API validation + DB constraints (migration 009)
- **Admin audit log** — settings, role changes, and todo actions → `admin_audit_log`
- **CI** — npm audit, security unit tests, lint, build, gitleaks (see below)
- **Docs** — [`security-check.md`](security-check.md) (score **8/10**, checklist, remaining work)

### UX patterns

- **Toast feedback** — success/error/info via shared popup (auto-dismiss, pauses on hover)
- **Loading states** — animated spinner + “Loading…” in the content area; header and footer stay visible
- **Tooltips** — shared `Tooltip` component (`role="tooltip"`); never use HTML `title` for hover hints
- **User avatars** — Google profile photos in header menu, settings side panel, admin users list, and submit sidebar; initial fallback when image missing or blocked
- **Header scroll** — body scroll lock only for mobile nav / mobile user menu, not desktop account dropdown

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS 4, Font Awesome |
| Backend | Supabase (Postgres, Auth, RLS) |
| Fonts | Geist Sans / Geist Mono |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project (for auth, projects, and settings)

### Install & run

```bash
git clone https://github.com/Sandrulis/BattleDrop.git
cd BattleDrop
npm install
cp .env.example .env.local
# fill in Supabase keys (see below)
npm run db:migrate   # or run SQL files manually in Supabase SQL Editor
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) locally.  
Production: [https://battle-drop.vercel.app](https://battle-drop.vercel.app)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run test:security` | Security unit tests (redirect + IP blocklist) |
| `npm run db:migrate` | Apply `supabase/migrations/*.sql` in order |
| `npm run db:check-migrations` | List required migration files |

---

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | **Local + Vercel** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | **Local + Vercel** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Local + Vercel** | Server-only service role key (site settings, admin ops, duplicate checks) |
| `NEXT_PUBLIC_SITE_URL` | Yes | **Local + Vercel** | `http://localhost:3000` locally · `https://battle-drop.vercel.app` on Vercel |
| `SUPABASE_DB_PASSWORD` or `DATABASE_URL` | Migrations only | **Local only** | For `npm run db:migrate` — do **not** add to Vercel |

Get API keys from **Supabase Dashboard → Project Settings → API**.

> **Important:** `.env.local` is gitignored and used only on your machine. Vercel does **not** read it — copy the same Supabase values into **Vercel → Project → Settings → Environment Variables** (check **Production**), then **Redeploy**. Env changes do not apply to an existing deployment until you redeploy.

Test the connection locally:

```bash
node scripts/test-supabase.mjs
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — monthly banner, weekly battle, leaderboard, sidebar |
| `/products/[id]` | Product detail — published projects from DB; falls back to mock for legacy demo IDs |
| `/archive` | Season archive with year switcher |
| `/submit` | Submit new project (guests OK) · edit requires auth (`?projectId=`) |
| `/my-projects` | User's projects — publish, promote, edit, delete |
| `/my-projects/[id]/preview` | Full-page project preview |
| `/settings` | Date/time and currency preferences (auth); side panel with account info |
| `/buy-points` | Buy points (auth); package picker (Stripe placeholder), side panel with account + pricing |
| `/admin-panel` | Admin overview (admin only) |
| `/admin-panel/users` | User list; last seen per user's format |
| `/admin-panel/projects` | All projects (placeholder UI) |
| `/admin-panel/battles` | Battles hub (redirects to weekly) |
| `/admin-panel/battles/weekly` | 52 weekly battles for selected year |
| `/admin-panel/battles/monthly` | 12 monthly battles for selected year |
| `/admin-panel/battles/yearly` | Annual battle years with entry counts |
| `/admin-panel/todo` | Admin todo board — drag-and-drop columns, add/edit modals |
| `/admin-panel/settings` | Site name, slogan, date/time defaults, default currency, battle defaults |

### API

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/projects` | POST | Yes | Create draft; returns `{ skipped, message }` if URL already in DB |
| `/api/projects/[id]` | PATCH, DELETE | Yes | Update, soft-delete |
| `/api/projects/[id]/publish` | POST | Yes | Publish draft for display or next available week (`getPublishTargetWeek`); sets `battle_year` / `battle_iso_week`; deducts `submitPrice` points (`users.points`); returns `402` + `redirectTo: /buy-points` if insufficient |
| `/api/projects/[id]/promote` | POST | Yes | Book promoted slot for current week (`{ spot: 1\|2\|3 }`); deducts slot price (3 / 2 / 1 points); `402` + redirect hint when insufficient |
| `/api/projects/check-url` | GET | Yes | Duplicate check by domain; rate limited |
| `/api/project-preview` | POST | Public | Fetch page meta; SSRF guard + rate limit |
| `/api/project-screenshot` | GET | Public | Screenshot proxy; SSRF guard + rate limit |
| `/api/site-settings` | GET, PATCH | GET public · PATCH admin | Site config (name, slogan, date/time, default currency, battle defaults) |
| `/api/user-settings` | GET, PATCH | Yes | User date/time and currency prefs |
| `/api/battle-week-settings/[year]/[week]` | GET, PATCH | Admin | Per-week battle overrides (enabled, min projects, submit price) |
| `/api/users/[id]/admin` | PATCH | Admin | Grant/revoke admin role |
| `/api/admin-todos` | POST | Admin | Create todo task |
| `/api/admin-todos/board` | PUT | Admin | Sync column order after drag-and-drop |
| `/api/admin-todos/[id]` | PATCH, DELETE | Admin | Update title/description · delete task |

---

## Security & CI

**Local checks** (run before push):

```bash
npm audit --audit-level=moderate
npm run test:security
npm run lint
npm run build
npm run db:check-migrations
```

**GitHub Actions** (on push/PR to `main`):

| Workflow | Job | Purpose |
|----------|-----|---------|
| `security-audit.yml` | npm-audit | Dependency audit (`moderate`+) |
| `security-smoke.yml` | smoke | Security tests, lint, production build (placeholder Supabase env — not real keys) |
| `secret-scan.yml` | gitleaks | Secret scanning |

**Dependabot** — weekly npm + GitHub Actions updates (`.github/dependabot.yml`).

Full checklist, API auth matrix, and remaining work: [`security-check.md`](security-check.md).  
CSRF assumptions: [`docs/security/csrf-posture.md`](docs/security/csrf-posture.md).  
Supabase linter cadence: [`docs/security/supabase-linter-review.md`](docs/security/supabase-linter-review.md).

---

## Date & Time Formatting

Display order, separator, and 12h/24h time come from the database — not browser locale.

**Priority (per field):**

1. User preference (`public.users.date_format`, `time_format`, `date_separator` — nullable)
2. Site default (`public.site_settings`)
3. Hardcoded fallback (`DEFAULT_SITE_SETTINGS`)

**Who sees what:**

| Context | Settings used |
|---------|----------------|
| Signed-in viewer (layout, home week range, own pages) | Viewer's effective prefs (user → site → default) |
| Timestamp for a specific user (e.g. admin last seen) | That user's effective prefs |
| Guest | Site defaults only |

**Settings pages:**

| Route | Who | Editable |
|-------|-----|----------|
| `/settings` | Signed-in user | Date format, separator, time format; reset to site defaults |
| `/admin-panel/settings` | Admin | Site name, slogan, date/time defaults, default currency, battle defaults (submit price, battle start hours) |

**Key modules:**

| Module | Role |
|--------|------|
| `app/lib/site-settings/get-site-settings.ts` | Cached site settings read |
| `app/lib/site-settings/format-display-date.ts` | `formatDisplayDate`, `formatDisplayDateTime`, `formatLastSeen` |
| `app/lib/site-settings/resolve-effective-date-time-settings.ts` | Merge user + site prefs |
| `app/lib/users/user-date-time-preferences.ts` | User prefs CRUD + `getEffectiveDateTimeSettingsForUser` |
| `app/components/site-date-settings-provider.tsx` | Client context (`useSiteDateSettings`) |

Do not use `toLocaleString()` / `toLocaleDateString()` for user-visible dates.

---

## Currency Formatting

Price symbols come from the database — not hardcoded `€` strings.

**Priority:**

1. User preference (`public.users.currency` — nullable)
2. Site default (`public.site_settings.default_currency`)
3. Hardcoded fallback (`DEFAULT_SITE_SETTINGS.defaultCurrency` → EUR)

**Who sees what:**

| Context | Currency used |
|---------|----------------|
| Signed-in viewer (layout, home, submit, sidebar) | Viewer's effective currency (user → site → default) |
| Guest | Site default only |
| Admin battle-week settings modal | Site default currency for price input (not admin's personal override) |
| Admin battle-week card badge | Points only (`15 points`) — `formatDisplayPoints`, no currency symbol |

**Settings pages:**

| Route | Who | Editable |
|-------|-----|----------|
| `/settings` | Signed-in user | Currency; reset to site default |
| `/admin-panel/settings` | Admin | Default currency (Regional defaults section) |

**Key modules:**

| Module | Role |
|--------|------|
| `app/lib/battle-week-settings/get-home-battle-week.ts` | Canonical **display week** (`HomeBattleWeek`) and **publish target week** (`getPublishTargetWeek`) |
| `app/lib/projects/project-battle-week.ts` | Week on a project row (`battle_year` / `battle_iso_week` or `created_at` fallback) |
| `app/lib/battle-week-settings/resolveEffectiveWeekSettings()` | Per-week enabled, min projects, effective submit price |
| `app/lib/battle-week-status.ts` | Week timing, display status, shuffle gate, battle-start hours label |
| `app/lib/site-settings/format-display-money.ts` | `formatDisplayMoney`, `formatDisplayMoneyWithPoints`, `formatDisplayPoints`, `formatPointsAmount` |
| `app/lib/site-settings/resolve-effective-currency-settings.ts` | Merge user + site currency |
| `app/lib/users/user-currency-preferences.ts` | User currency CRUD + `getEffectiveCurrencyForUser` |
| `app/components/site-currency-settings-provider.tsx` | Client context (`useSiteCurrency`) |

Amounts (`battle_submit_price`, per-week `submit_price`) are numeric only; currency is display-only. Do not hardcode currency symbols in UI — use `formatDisplayMoney*`. For battle rules and week hero labels, use **`formatDisplayPoints`** (points-only). See `.cursor/rules/single-source-of-truth.mdc` — never duplicate battle-week resolution in pages.

---

## Loading States

Route transitions and async UI use a shared spinner — not skeleton placeholders or blank screens.

**Layout during load:**

```
SiteHeader  (always visible)
main        → spinner + “Loading…”
SiteFooter  (always visible)
```

**Components** (`app/components/loading.tsx`):

| Component | Use when |
|-----------|----------|
| `LoadingSpinner` | Inline (buttons, small panels, Suspense fallbacks) |
| `PageLoading` | Content-area spinner only |
| `SiteRouteLoading` | Route `loading.tsx` on standard pages (header + main + footer) |

**Route `loading.tsx`:**

- **Standard routes** — return `<SiteRouteLoading />` (home, archive, products, submit, my-projects, settings, auth)
- **Admin panel** — return `<PageLoading />`; `app/admin-panel/layout.tsx` already renders header, side nav, and footer

Every page segment has a `loading.tsx` file. New routes should add one following the same pattern.

**Button / action loading:** disable the control and reuse `LoadingSpinner size="sm"` or swap the label to “Loading…”.

See `.cursor/rules/loading-states.mdc` for agent conventions.

---

## Project Structure

```
app/
├── admin-panel/          # Admin UI + layout (header/nav/footer); loading.tsx per segment
├── api/                  # Route handlers (projects, settings, admin todos)
├── auth/                 # OAuth callback + error page
├── components/           # UI (feed, hero, toast, tooltip, loading, admin battles, settings forms)
├── lib/
│   ├── battle-week-settings/  # Per-week overrides CRUD
│   ├── admin-battles/    # Battle entry counts from published projects
│   ├── admin-todos/      # Todo board CRUD, atomic RPC sync
│   ├── auth/             # `signInWithGoogle` (OAuth + safe return path)
│   ├── projects/         # CRUD, URL normalize/host match, duplicate checks
│   ├── security/         # SSRF, rate limit, input limits, audit log, redirect helper
│   ├── site-settings/    # get/update site_settings, date & money format helpers
│   ├── supabase/         # Server, client, admin clients; env guard (`env.ts`)
│   ├── promoted-slots/   # Slot definitions, week bookings
│   └── users/            # Profile sync, last seen, date/time & currency prefs, points balance + deduct/credit RPC
├── buy-points/           # Buy points page + loading.tsx
├── my-projects/          # User project list + preview
├── products/[id]/        # Product detail (mock)
├── settings/             # User preferences page
├── submit/               # Submit / edit flow
├── archive/              # Archive page + loading.tsx
├── loading.tsx           # Home route loading (SiteRouteLoading)
├── proxy.ts              # Session refresh (Next.js 16); skips if Supabase env missing
├── page.tsx              # Home
└── layout.tsx            # Root layout, metadata, date + currency settings providers

.github/workflows/        # security-audit, security-smoke, secret-scan
docs/security/           # CSRF posture, Supabase linter review
.cursor/rules/            # Cursor agent conventions (date formats, currency, toast, loading)
supabase/migrations/      # Ordered SQL migrations (001–016)
scripts/
├── apply-migrations.mjs  # Run migrations against Supabase Postgres
├── check-required-migrations.mjs
└── test-supabase.mjs     # Connectivity check
security-check.md         # Security score, checklist, backlog
```

### Key files

- `app/lib/mock-data.ts` — demo products, battles (legacy product pages / archive)
- `app/lib/build-leaderboard.ts` — organic ranking + promoted insertions from `BookedPromotedSlot[]`
- `app/lib/projects/get-battle-week-products.ts` — published projects → `Product[]` for home feed (week filter via `battle_year` / `created_at`)
- `app/lib/projects/project-battle-week.ts` — `resolveProjectBattleWeek`, `projectMatchesBattleWeek`, Supabase OR filters
- `app/lib/projects/publish-project.ts` — `userHasPublishedProjectInWeek`
- `app/lib/battle-week-settings/get-home-battle-week.ts` — `getHomeBattleWeek()`, `getPublishTargetWeek()` (next week when voting started)
- `app/components/publish-project-modal.tsx` — publish confirm modal (week info + rules checkbox)
- `app/components/project-logo.tsx` — favicon or letter avatar (feed, product detail)
- `app/lib/promoted-slots/` — slot definitions, week bookings, `getPromotedSlotsForWeek()`
- `app/components/promote-project-modal.tsx` — spot picker (3 / 2 / 1 points labels); balance link; redirect on insufficient points
- `app/components/points-balance-link.tsx` — clickable points badge/inline link → `/buy-points?return=`
- `app/components/user-points-balance.tsx` — header points badge wrapper
- `app/components/buy-points-panel.tsx` — point packages UI (Stripe placeholder)
- `app/components/buy-points-side-panel.tsx` — account + pricing reference on `/buy-points`
- `app/lib/users/user-points.ts` — balance read, atomic deduct/credit via RPC
- `app/lib/users/buy-points-path.ts` — `BUY_POINTS_PATH`, `buildBuyPointsPath()`, `402` constant
- `app/components/toast.tsx` — shared toast + `useToast` hook
- `app/components/loading.tsx` — `LoadingSpinner`, `PageLoading`, `SiteRouteLoading`
- `app/components/settings-side-panel.tsx` — account card + quick links on `/settings`
- `app/components/user-settings-form.tsx` — date/time and currency prefs forms + preview
- `app/components/admin-settings-form.tsx` — site-wide settings, default currency, battle defaults (admin)
- `app/components/site-currency-settings-provider.tsx` — client currency context (`useSiteCurrency`)
- `app/lib/site-settings/format-display-money.ts` — `formatDisplayMoney`, `formatDisplayMoneyWithPoints`
- `app/lib/users/user-currency-preferences.ts` — user currency CRUD + effective currency resolver
- `app/components/tooltip.tsx` — shared hover tooltip (`role="tooltip"`); no HTML `title` hints
- `app/components/admin-battles-subnav.tsx` — Weekly / Monthly / Yearly subnav on battles pages
- `app/components/admin-battles-year-switcher.tsx` — year picker with Active / Upcoming labels
- `app/components/admin-battle-week-list.tsx` — scrollable weekly battle cards with auto-scroll
- `app/components/admin-battle-week-card.tsx` — week row with settings gear + status badges
- `app/components/admin-battle-week-settings-modal.tsx` — per-week settings form (GET/PATCH API)
- `app/lib/battle-week-settings/` — per-week overrides read/write (`get-battle-week-settings-for-year.ts`)
- `app/lib/admin-battles-data.ts` — week/month/year blocks with effective settings + `formatDisplayPoints`
- `app/components/user-avatar.tsx` — profile image with initial fallback
- `app/lib/admin-battles/get-records.ts` — aggregate published project counts by week/month/year
- `app/lib/users/resolve-avatar-url.ts` — Google avatar URL from profile metadata
- `app/components/admin-todo-board.tsx` — drag-and-drop todo columns + add/edit modals
- `app/components/admin-todo-form-modal.tsx` — shared add/edit task modal
- `app/lib/admin-todos/` — get/create/update/delete/sync board against `admin_todos`
- `app/lib/security/safe-url.ts` — SSRF protection for outbound fetches
- `app/lib/security/log-admin-action.ts` — admin audit log writes
- `next.config.ts` — security headers (CSP, X-Frame-Options, …)
- `app/components/submit-product-form.tsx` — two-step submit; guest **Login + Save** flow
- `app/lib/projects/find-existing-project-by-url.ts` — duplicate detection by host (admin client)
- `app/lib/projects/project-utils.ts` — `normalizeProjectSubmitUrl`, `resolveProjectLandingUrl`, `normalizeProjectHost`
- `app/lib/supabase/env.ts` — `isSupabaseConfigured()` / `getSupabasePublicEnv()`; proxy skips session refresh when env is missing
- `app/lib/auth/sign-in-with-google.ts` — shared OAuth redirect helper
- `security-check.md` — security score, checklist, CI workflows
- `docs/security/` — CSRF posture, Supabase linter cadence

---

## Promoted Spots Logic

Promoted products are visually distinct (badge + border + background) but show their **real vote rank**, not the paid slot number.

| Spot | Position |
|------|----------|
| 1 | Before organic #1 |
| 2 | After organic #5 |
| 3 | After organic #10 |

Promoted products are excluded from the organic vote ranking to avoid duplicates.

Bookings persist in `public.promoted_slots` (migration `014`). Users book via **My Projects → Promote** after publishing. **Points are deducted** on promote (3 / 2 / 1 by spot) and on publish (`submitPrice` from `getPublishTargetWeek()`). Insufficient balance returns HTTP `402` and redirects the client to `/buy-points`.

When every (or most) feed entry is promoted, unplaced promoted slots are still appended to the leaderboard so multiple promoted products remain visible (`build-leaderboard.ts`).

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Google** auth (Authentication → Providers)
3. Add redirect URLs in **Authentication → URL Configuration**:
   - Site URL (prod): `https://battle-drop.vercel.app`
   - Redirect URLs: `http://localhost:3000/**` and `https://battle-drop.vercel.app/**`
4. Apply migrations (in order):

   | File | Purpose |
   |------|---------|
   | `001_create_users.sql` | `public.users` + auth sync triggers |
   | `002_create_projects.sql` | `public.projects` (drafts) |
   | `003_projects_soft_delete.sql` | `deleted_at` column |
   | `004_users_last_seen.sql` | `last_seen` + throttle RPC |
   | `005_site_settings.sql` | Singleton site config row |
   | `006_user_date_time_preferences.sql` | Per-user date/time columns + update policy |
   | `007_admin_todos.sql` | Shared admin todo board (`admin_todos`) |
   | `008_security_function_hardening.sql` | Function `search_path` + EXECUTE hardening |
   | `009_security_hardening.sql` | Audit log, input limits, atomic todo board RPC |
   | `010_battle_default_settings.sql` | Default submit price + battle start hours on `site_settings` |
   | `011_battle_week_settings.sql` | Per-week battle overrides (enabled, min projects, submit price) |
   | `012_site_default_currency.sql` | Default display currency on `site_settings` |
   | `013_user_currency_preference.sql` | Per-user currency column (nullable) |
   | `014_promoted_slots.sql` | Promoted slot bookings + public read for published projects |
   | `015_project_battle_week.sql` | `battle_year` + `battle_iso_week` on published projects; backfill from `created_at` |
   | `016_user_points.sql` | `users.points` balance; client cannot self-edit; `deduct_user_points` / `credit_user_points` RPC (service_role) |

   ```bash
   npm run db:migrate
   ```

   Or paste each file into **Supabase → SQL Editor**.

   Verify migration 009:

   ```sql
   select to_regclass('public.admin_audit_log');
   select proname from pg_proc where proname = 'sync_admin_todo_board';
   ```

5. Set an admin user: `update public.users set is_admin = true where email = 'you@example.com';`
6. Fill `.env.local` and run `node scripts/test-supabase.mjs`

---

## Cursor Rules

Agent conventions live in `.cursor/rules/`:

| Rule | Topic |
|------|-------|
| `readme-version-update.mdc` | README **update** → bump version, Changelog since last release |
| `site-date-time-formats.mdc` | Use `formatDisplayDate*` / effective settings; no locale formatters |
| `site-currency-formats.mdc` | Use `formatDisplayMoney*` / effective currency; no hardcoded symbols |
| `toast-feedback.mdc` | Action feedback via `useToast` + `<Toast>` |
| `loading-states.mdc` | `SiteRouteLoading` / `PageLoading`; spinner in content area only |
| `tooltips-not-title.mdc` | Use `Tooltip` component; never HTML `title` for hover hints |

---

## Deployment

Deploy to [Vercel](https://vercel.com) by importing the GitHub repo.

**Live app:** [https://battle-drop.vercel.app](https://battle-drop.vercel.app)

### Vercel environment variables

Copy from your local `.env.local` into **Vercel → Settings → Environment Variables**. Enable **Production** (and Preview if needed):

| Variable | Vercel value |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | `https://battle-drop.vercel.app` |

Do **not** add `SUPABASE_DB_PASSWORD` / `DATABASE_URL` to Vercel (local migrations only).

After saving env vars: **Deployments → latest → Redeploy**. A new build is required — editing env alone does not fix a running deployment.

### Checklist

1. Run migrations `001`–`016` on the **production** Supabase project (see [Supabase Setup](#supabase-setup))
2. Add all four env vars above in Vercel (**Production**)
3. Set Supabase **Authentication → URL Configuration** redirect URLs to include `https://battle-drop.vercel.app/**`
4. Redeploy on Vercel
5. Enable GitHub **secret scanning push protection** in repo settings (recommended)

### Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **Internal Server Error** on `/` | Supabase env missing on Vercel | Add all four vars, redeploy |
| `Your project's URL and Key are required…` in `update-session.ts` | Same — runtime has no `NEXT_PUBLIC_SUPABASE_*` | Copy from `.env.local` → Vercel → **Redeploy** |
| Google sign-in redirects to localhost | Wrong `NEXT_PUBLIC_SITE_URL` on Vercel | Set to `https://battle-drop.vercel.app`, redeploy |
| Auth works locally but not in prod | Supabase redirect URLs | Add prod callback URL in Supabase dashboard |
| CI build passes but prod fails | GitHub Actions uses placeholder env; Vercel needs real keys | Configure Vercel env separately from CI |

Static assets (`/favicon.ico`, `/_next/static/*`) may work even when pages return 500 — that usually means the app deployed but Supabase env is missing at runtime.

---

## Versioning & Commits

Version follows `package.json` (`semver`). Every commit message ends with the version tag:

```
Short description of the change. v0.1.13
```

Bump the version in `package.json` when the change is user-facing or notable. Current: `0.1.14`.

When the user asks to **update README**, follow `.cursor/rules/readme-version-update.mdc`: bump version, move `Unreleased` → new changelog section, list all improvements since the last version.

---

## Changelog

Summary of what shipped in each release (newest first).

### Unreleased

- (none)

### v0.1.14

**User points, buy-points page & admin todo counts**

- **Points balance** — migration `016_user_points.sql`; `users.points` (default 0); `protect_user_points` trigger; atomic `deduct_user_points` / `credit_user_points` RPC
- **Header** — points badge with `fa-money-bill-wave` between Submit and avatar; links to `/buy-points`
- **Publish & promote** — deduct points after successful action; pre-check + HTTP `402` with `redirectTo: /buy-points`; rollback promote slot / draft status if deduction races
- **Buy points** (`/buy-points`) — frontend-only package picker (Stripe coming soon); side panel (account, publish/promote prices, quick links); `?return=` back navigation
- **Insufficient points UX** — publish/promote modals and My Projects redirect to buy-points; `PointsBalanceLink` in modals and submit side panel
- **Battle hero** — `upcoming` badge label **Waiting battle week** (was “Waiting”)
- **Admin todo** — task count badge on each column header (Tasks / In progress)

### v0.1.13

**Publish UX, battle week columns & leaderboard polish**

- **Publish modal** — `PublishProjectModal`: target week range, entry fee, rules checkbox; `getPublishTargetWeek()` applies rule #3 (next available week when voting already started on display week)
- **Battle week on projects** — migration `015_project_battle_week.sql`; `battle_year` + `battle_iso_week` set on publish; `project-battle-week.ts` for week resolution and Supabase filters (column match OR `created_at` fallback)
- **My Projects** — published entries show **Week N, YYYY** badge in the Publish-button slot; date range under title
- **Battle hero** — live countdown to week start and voting opens (replaces static “Waiting for this week” copy)
- **Voting gate** — upvote buttons disabled until `voting_open`; feed hint “voting opens soon”
- **Favicons on feed** — `ProjectLogo` + `faviconUrl` on `Product`; home leaderboard and product detail match My Projects / admin favicon display
- **Multiple promoted rows** — `build-leaderboard.ts` appends promoted slots that could not be inserted after organic ranks (fixes one-promoted-only when organic list is empty or short)
- **Query resilience** — project list and week queries fall back when migration `015` columns are missing

### v0.1.12

**Submit landing URL resolution**

- **Submit URL** — pasted paths (e.g. `https://repazy.com/dashboard`) resolve to the **site root** for preview, screenshot, and DB save — avoids login-gated app routes
- **`normalizeProjectSubmitUrl()`** — canonical helper in `app/lib/projects/project-utils.ts`; strips path, query, and hash to `/`
- **Wired through** — `fetchProjectMeta`, `/api/project-preview`, `/api/projects/check-url`, `POST /api/projects`, `submit-product-form.tsx`

### v0.1.11

**Real leaderboard, publish & promote**

- **Home feed** — `getBattleWeekProducts()` loads **published** projects for the displayed ISO week; empty state when no entries
- **Promoted slots (DB)** — migration `014_promoted_slots.sql`; `buildLeaderboard()` inserts booked spots from `promoted_slots` (not mock names)
- **Publish** — `POST /api/projects/[id]/publish`; **My Projects** modal for any draft (see v0.1.13 for target-week rules); one published project per user per target week
- **Promote** — `POST /api/projects/[id]/promote`; modal to pick spot 1–3 (before #1 / after #5 / after #10); badge + highlighted row on home feed
- **Product pages** — `/products/[id]` resolves published projects from DB; mock fallback for legacy demo IDs
- **RLS** — `projects_select_published` lets anyone read published rows; `promoted_slots` public select + owner insert
- **Lib** — `get-battle-week-bounds`, `is-project-in-battle-week`, `project-to-product`, `format-maker-handle`

### v0.1.10

**Home battle week UX, rules sidebar & single source of truth**

- **Display week resolution** — `getHomeBattleWeek()` skips disabled weeks to the next enabled week; shared by home hero, sidebar rules, and submit flow
- **Battle hero** — four status badges (waiting / awaiting voting / voting open / closed); dynamic voting countdown; min-project progress bar; submit price as `N point(s) per submit`; battle-start hours from admin settings (bold in copy)
- **Sidebar rules** — “This week's battle rules” with dynamic entry fee, min projects, voting hours, one product per user per week, one vote per day, pre-voting shuffle policy
- **Pre-voting shuffle** — `prepareProductFeedOrder()` shuffles on the server each refresh until voting opens; fixes client hydration mismatch from `Math.random()` in `ProductFeed`
- **Submit flow** — `/submit` and side panel use `getHomeBattleWeek()` (no hardcoded `20 projects` / `24h` / site-only price)
- **Consolidated lib** — `mapBattleWeekSettingsRow()`, `resolveEffectiveWeekSettings()` (+ `effectiveProjectsRequired`), `shouldShuffleBeforeVoting()`, `displayStatusToBattlePhase()`, exported `formatPointsAmount()`
- **Cursor rule** — `single-source-of-truth.mdc` documents canonical modules for battle week, formatting, and SSR shuffle

### v0.1.9

**Admin battles polish, per-week settings API & UX**

- **Battles admin** — `/admin-panel/battles` with weekly, monthly, yearly subroutes and large subnav cards
- **Year switcher** — active year default; `?year=` for past years with published entries and next year (planning)
- **Weekly list** — all 52 weeks; scrollable container auto-scrolls to active week; empty weeks show minimal dashed cards
- **Entry counts** — from published projects only (`app/lib/admin-battles/get-records.ts`); no mock winners on admin cards
- **Per-week settings API** — `GET/PATCH /api/battle-week-settings/[year]/[week]` persists to `battle_week_settings` (migration `011`)
- **Settings modal** — enabled toggle, min projects switch + input, submit price override (site default from admin settings)
- **Week badges** — disabled, min projects count, points per submit (`formatDisplayPoints`; badge shows `15 points`, not `€15`)
- **`Tooltip` component** — replaces HTML `title` on battle badges; Cursor rule `tooltips-not-title.mdc`
- **Home weekly battle** — dynamic ISO week + date range via `getCurrentIsoWeek()` and user/site date formatters
- **Header** — desktop user menu no longer locks page scroll (`header-actions.tsx`)
- **Audit** — `battle_week_settings.update` action in admin audit log

### v0.1.8

**Currency display settings**

- **Site default currency** — admin sets EUR, USD, or GBP at `/admin-panel/settings` (Regional defaults; migration `012`)
- **User currency override** — signed-in users set personal currency at `/settings`; null follows site default (migration `013`)
- **Display priority** — user preference → site default → `EUR` fallback; wired through layout provider and price formatters
- **`formatDisplayMoney` / `formatDisplayMoneyWithPoints`** — replace hardcoded `€` on home hero, sidebar, submit flow, and admin price inputs
- **`SiteCurrencySettingsProvider`** + `useSiteCurrency()` for client components; `getEffectiveCurrencyForUser()` on server
- Cursor rule `site-currency-formats.mdc` — agent conventions for currency formatting

### v0.1.7

**Admin battles, battle defaults & user avatars**

- **Battles** admin section — `/admin-panel/battles` with weekly, monthly, and yearly subnav (replaces battle-results placeholder)
- Weekly view — 52 week cards, year switcher, active-week highlight, auto-scroll to current week
- Per-week settings modal — enabled toggle, optional min projects, submit price (API wired in v0.1.9)
- **Battle defaults** in admin settings — default submit price (€) and hours until battle starts from ISO week beginning (migration `010`)
- Entry counts from published projects — `app/lib/admin-battles/get-records.ts`
- **User avatars** — `UserAvatar` + `resolveAvatarUrl`; Google photos in header, settings, admin users, submit sidebar
- CSP `img-src` allows `https://*.googleusercontent.com` for profile images

### v0.1.6

**Deployment docs, env guard & release workflow**

- Supabase env guard (`app/lib/supabase/env.ts`) — `isSupabaseConfigured()`; proxy skips session refresh when env is missing
- Safer server layout when misconfigured — `getCurrentAppUser` and `SiteHeader` no longer crash without Supabase env
- README **Deployment** — full Vercel env table, checklist, troubleshooting (500 / missing URL+Key / localhost redirect)
- README **Environment Variables** — `Where` column (local vs Vercel vs migrations-only)
- README **Changelog** — per-version release notes (`v0.1.0`–`v0.1.7`)
- Cursor rule `readme-version-update.mdc` — README **update** auto-bumps version and changelog

### v0.1.5

**Security hardening & CI**

- SSRF protection for user-supplied URLs (`app/lib/security/safe-url.ts`)
- Safe OAuth `?next=` redirects (`safe-redirect-path.ts`)
- Per-IP rate limits on preview, screenshot, and check-url routes
- Security headers in `next.config.ts` (CSP, X-Frame-Options, Referrer-Policy, …)
- Input length limits — API validation + DB constraints (migration `009`)
- Admin audit log (`admin_audit_log`) for settings, role changes, and todo actions
- Atomic todo board sync via Postgres RPC `sync_admin_todo_board`
- `check-url` requires sign-in; guests rely on server-side duplicate check on save
- Security unit tests (`npm run test:security`)
- GitHub Actions: `security-audit`, `security-smoke`, `secret-scan` (gitleaks)
- Dependabot for npm + GitHub Actions
- Docs: `security-check.md`, `docs/security/csrf-posture.md`, `docs/security/supabase-linter-review.md`
- `npm run db:check-migrations` script
- CI smoke workflow uses non-JWT placeholder env so gitleaks passes

### v0.1.4

**Admin todo UI**

- Todo card layout: title vertically centered when description is empty
- Multiline descriptions render with preserved line breaks (`whitespace-pre-wrap`)

### v0.1.3

**Supabase backend, auth, submissions, admin panel**

- Google sign-in (Supabase Auth) + session refresh via `proxy.ts`
- OAuth callback with optional `?next=` return path
- Two-step **Submit product** flow (URL → review); guest **Login + Save** with post-login auto-save
- Duplicate URL detection by normalized host (signed-in preview check + server-side on save)
- **My Projects** — list, edit, soft-delete, full-page preview
- Project meta fetch (direct + Microlink fallback), favicon, screenshot proxy API
- **User settings** (`/settings`) — date/time format preferences; account side panel
- **Admin panel** — users (admin toggle, last seen), site settings, todo board, projects/battle-results placeholders
- Admin todo board — drag-and-drop columns, trash zones, add/edit modals (`admin_todos`, migration `007`)
- Site-wide date/time display from DB (site defaults + per-user overrides, migration `006`)
- Configurable site name and slogan (`site_settings`, migration `005`)
- Toast feedback + route loading spinners (header/footer stay visible)
- DB migrations `001`–`008` (users, projects, soft delete, last seen, settings, todos, function hardening)
- `npm run db:migrate` + `scripts/test-supabase.mjs`

### v0.1.2

**Documentation**

- Document local dev URL (`http://localhost:3000`) and production URL (`https://battle-drop.vercel.app`) in README and `.env.example`

### v0.1.1

**Documentation**

- Replace Next.js boilerplate README with full project documentation
- Document versioned commit message convention (`… v0.1.x`)

### v0.1.0

**Initial MVP (mock data frontend)**

- Home page — monthly championship banner, weekly battle hero, product leaderboard
- Promoted spot insertions (before #1, after #5, after #10) with demo voting UI
- Product detail pages with comments (mock)
- Archive page — season calendar grouped by month
- Site header, footer, mobile nav
- Mock data layer (`mock-data.ts`, `build-leaderboard.ts`, `archive-data.ts`)
- Next.js 16 App Router + Tailwind CSS 4 + Font Awesome

---

## Roadmap

- [x] Supabase client + session refresh (`proxy.ts`)
- [x] Google sign-in
- [x] Product submission flow (drafts, edit, soft delete, preview)
- [x] Guest submit flow (Login + Save, post-login auto-save, domain duplicate check)
- [x] Submit URL → site root landing page (`normalizeProjectSubmitUrl`, v0.1.12)
- [x] Admin panel (users, site settings, battles browser)
- [x] Battle default settings — submit price + start hours (`site_settings`, migration 010)
- [x] Per-week battle settings — enabled, min projects, submit price override + API (`battle_week_settings`, migration 011)
- [x] Admin todo board — DB-backed drag-and-drop columns, add/edit/delete (migration 007)
- [x] Security hardening — SSRF, rate limits, headers, audit log, CI (migrations 008–009)
- [x] Site-wide date/time formats + per-user overrides (`/settings`, migration 006)
- [x] Site-wide currency display + per-user overrides (`/settings`, migrations 012–013)
- [x] Home battle week — enabled-week skip, status badges, rules sidebar, pre-voting shuffle (`getHomeBattleWeek`, v0.1.10)
- [x] Real weekly leaderboard — published projects from Supabase (`getBattleWeekProducts`, v0.1.11)
- [x] Publish flow — draft → published battle entry (`/api/projects/[id]/publish`, v0.1.11)
- [x] Promoted spot booking — DB-backed slots from My Projects (v0.1.11)
- [x] Publish modal + next-week targeting when voting started (`getPublishTargetWeek`, v0.1.13)
- [x] Explicit battle week on published projects (`battle_year` / `battle_iso_week`, migration 015, v0.1.13)
- [x] Battle hero countdowns + vote button gated until voting opens (v0.1.13)
- [x] Project favicons on home leaderboard (`ProjectLogo`, v0.1.13)
- [x] Multiple promoted feed rows when organic list is short (v0.1.13)
- [x] Toast feedback + route loading spinners (header/footer stay visible)
- [ ] Admin audit log UI (read-only view in admin panel)
- [ ] Global rate limiting (edge/WAF) for production scale
- [ ] Persistent votes and comments
- [ ] Seed database from mock data / real battles
- [x] User **points balance** — `users.points`, header badge, migration `016` (v0.1.14)
- [x] **Points deduction** on publish and promote (v0.1.14)
- [x] **Buy points** page — frontend placeholder for Stripe (v0.1.14)
- [ ] Stripe checkout — credit points after payment
- [ ] Affiliate / referral system
- [ ] Payment step on submit (fiat alternative to points)

---

## TODO (recommended next steps)

Practical backlog — ops first, then product. See also [Roadmap](#roadmap) and [`security-check.md`](security-check.md).

### Ops & deploy (do first)

- [ ] **Commit + push `v0.1.14`** — points system, buy-points page, publish/promote deduction
- [ ] **Vercel env vars** — copy all four Supabase vars from `.env.local`; set `NEXT_PUBLIC_SITE_URL=https://battle-drop.vercel.app`
- [ ] **Redeploy** on Vercel after env changes (required — old deploys keep missing env at runtime)
- [ ] **Verify production** — `https://battle-drop.vercel.app/` loads; Google sign-in redirects to prod, not localhost
- [ ] **Migrations 014–016** on production Supabase — `promoted_slots`, `battle_year` / `battle_iso_week`, `users.points`

### Security & quality

- [ ] Enable GitHub **secret scanning push protection** (repo Settings → Code security)
- [ ] Run Supabase **Database Linter** after migrations 008/009; fix any warnings
- [ ] **Global rate limiting** — Upstash Redis, Vercel Firewall, or Cloudflare (in-memory limits don’t span serverless instances)
- [ ] Stricter **CSP** — reduce `'unsafe-inline'` / `'unsafe-eval'` when feasible
- [ ] Add **`Strict-Transport-Security`** header in production (`next.config.ts`)
- [ ] Validate **favicon URL** on project save (SSRF guard, same as preview routes)
- [ ] Expand **security tests** — SSRF/DNS integration cases beyond redirect + IP blocklist

### Admin & observability

- [ ] **Admin audit log UI** — read-only `/admin-panel/audit` for `admin_audit_log`
- [ ] Wire **admin Projects** page (currently placeholder UI)

### Product (replace mock data)

- [ ] **Persistent votes and comments** — DB-backed; home feed vote counts still client-side demo
- [x] **Publish flow** — draft → published weekly battle (v0.1.11)
- [x] **Promoted spot booking** — My Projects modal + `promoted_slots` table (v0.1.11)
- [x] **Points deduction** on publish and promote (v0.1.14)
- [x] **Buy points** frontend at `/buy-points` (v0.1.14)
- [ ] **Stripe checkout** — wire buy-points packages to credit `users.points`
- [ ] **Seed** real battles from mock data or admin import
- [ ] **Affiliate / referral** system
- [ ] **Payment** step on submit (fiat alternative to points)

---

## License

Private project.
