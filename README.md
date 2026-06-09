# BattleDrop

Weekly product battles for early-stage founders. Community votes, promoted leaderboard spots, and a Product Hunt–style feed — Next.js frontend with Supabase auth, project submissions, and admin tooling.

**Repository:** [github.com/Sandrulis/BattleDrop](https://github.com/Sandrulis/BattleDrop)  
**Current version:** `0.1.37` (see [Changelog](#changelog))

---

## Features

### Public

- **Weekly leaderboard** — **published projects** for the displayed battle week from Supabase; project **favicons** on feed rows; promoted insertions from `promoted_slots`; votes disabled until voting opens (demo counts still client-side until DB-backed)
- **Promoted spots** — when `project_promotes` integration is enabled: book from **My Projects** after publishing; fixed positions (before #1, after #5, after #10); highlighted row + badge on home feed; active for a configurable duration (site default, `expires_at` on each booking); **owner-only countdown** (small mono timer after Promoted badge); live expiry drops badge/row without refresh; `#` on promoted rows shows **vote rank** (real position by votes), not feed position
- **Monthly championship** — banner with contender voting and countdown
- **Product pages** (`/products/[id]`) — unified detail view for published projects and owner draft preview; landing screenshot above About; threaded **DB-backed comments** with optimistic post/upvote, **author upvote totals** (`fa-star` after username), and square rounded avatars with initials fallback; launch stats sidebar (Battle week or **Created** date when not in a battle)
- **Archive** (`/archive`) — season calendar grouped by month from **Supabase** published projects; one full-width row per week; **top 5 organic** products per week (compact grid, monthly-voting layout); gold / silver / bronze row backgrounds for places 1–3; click row → product page + comments; **active week** voting (client UI) and auto-scroll when viewing the current year; year switcher via `?year=`
- **Hall of Fame** — home sidebar card for the **previous closed week**'s top 5 organic products (`Week N, YYYY` label); hidden when that week has no entries
- **Site identity** — configurable site name and slogan (header, footer, metadata, OG tags)
- **Date & time display** — site-wide defaults with optional per-user overrides
- **Currency display** — site-wide default currency with optional per-user overrides (EUR, USD, GBP)

- **Weekly battle hero** — resolves the **next enabled ISO week** when the current week is disabled; status badge (**Waiting battle week** / awaiting voting / voting open / closed); live countdown to **week start** and **voting opens**; per-week submit price in points; optional **winner cash prize** after the week title (`fa-trophy` + formatted amount when > 0); min-project progress bar
- **Weekly battle rules** — sidebar lists dynamic rules for the displayed week (entry fee, min projects, voting hours, one submit per user, one vote per day, pre-voting shuffle); mentions cash prize when the week has one
- **Site poll** — when `integration_poll` is enabled and an admin poll is active, home sidebar shows question + answer options; signed-in users vote once; after voting, progress bars compare each option (percent + count)
- **Pre-voting shuffle** — product order randomised on each page refresh until voting opens (server-side; avoids hydration mismatch)

> Home **leaderboard products**, **promoted bookings**, **product comments**, and **archive** use Supabase (`published` projects + `promoted_slots` + `project_comments`). **Vote counts** on the home feed and archive active week are still client-side demo until DB-backed voting ships. Auth, user projects, admin entry counts, and **weekly battle context** (`getHomeBattleWeek()`) are wired to Supabase and per-week settings.

### Auth & projects

- **Google sign-in** — Supabase Auth with session refresh via `proxy.ts`; OAuth callback supports `?next=` return path
- **Submit product** — two-step flow (URL → review details); guests can start without signing in; side panel uses the same resolved battle week as home (`getHomeBattleWeek()`)
  - **Step 1** — enter URL; pasted paths like `/dashboard` resolve to the **site root landing page** (`normalizeProjectSubmitUrl`) for preview, screenshot, and save — not login-gated app routes
  - **Signed-in users** get a duplicate check by **domain** before preview (guests skip client check — duplicate blocked on save)
  - **Step 2** — guests see **Login + Save** (not Save); draft stored in `sessionStorage`, then Google sign-in → return to `/submit` → auto-save
  - **Signed-in users** — standard **Save** button; edit via `/submit?projectId=…` (auth required)
  - Meta fetch (direct + Microlink fallback), favicon, screenshot proxy
  - **Week card** (always visible) — entry fee, live **Voting opens in** countdown, optional **Battle starts at** `X/Y projects` with progress bar when min-projects rule is enabled
- **Duplicate URLs** — signed-in submit flow checks domain before preview; save always checks server-side (active, soft-deleted, any owner)
- **My Projects** — sorted by **created_at** (newest first); list drafts, edit, soft-delete; **Preview** on drafts and published entries (links to `/products/[id]?from=my-projects`); **comment badge** (`fa-comment-alt` + count) after Preview when the project has comments; **Publish** opens modal (target battle week, rules checkbox, entry fee, balance check); published entries show **Week N, YYYY** badge in the action row; **published cards** use battle-week **border + colored drop shadow** (same palette as home status badge); **Promote** published entry when `project_promotes` integration is enabled (spot picker modal shows site promote duration; active booking shows Promoted badge + owner countdown; insufficient points → redirect to **Buy points**)
- **Header balances** — signed-in users see **Points** (`fa-money-bill-wave`), **Upvotes** (`fa-star`), and **Affiliates** (`fa-user-tag` + available referral count when `integration_affiliates` enabled) as `h-8` badges with tooltips; desktop header only — on mobile they appear at the top of the account dropdown
- **Points balance** — clickable → `/buy-points`; same link in publish/promote modals and submit side panel
- **Comment upvote reputation** — total upvotes received on your comments; same total shown after each comment author’s `@handle`
- **Buy points** (`/buy-points`) — frontend-only top-up page (Stripe coming soon); point packages UI, account side panel with pricing reference; `?return=` for back navigation
- **Affiliates** (`/affiliates`) — when `integration_affiliates` is enabled: personal referral link + code, email invites (+), joined/pending stats, account side panel; referral claimed on sign-up via `?ref=` cookie (`bd_affiliate_ref`) only when **marketing** cookies are accepted in cookie settings; account menu link (after My Projects, before Shop); header + home sidebar **Copy link** for signed-in users; **Shop redeem** stats and **How rewards work** only when `integration_shop` is also enabled (otherwise invite-only copy); rates from `shop_affiliates_per_point` via `format-shop-exchange-rate.ts`
- **Shop** (`/shop`) — when `integration_shop` is enabled: exchange **comment upvotes** and **affiliate referrals** for battle points at admin-set rates; account menu link; **red banner** when integration disabled; affiliate redemption also requires `integration_affiliates`
- **User settings** (`/settings`) — date/time and currency preferences with account side panel (member since, last seen, quick links); site name, slogan, and default currency are admin-only
- **Support** (`/support`) — signed-in users open support tickets (subject + message) and track status (`open` / `in_progress` / `closed`)
- **Suggestions** (`/suggestions`) — signed-in users submit feature ideas; **community feed** shows all suggestions sorted by upvotes; optimistic **upvote / unupvote** toggle (one vote per user; cannot upvote own idea); own submissions show admin review status
- **Blog** (`/blog`, `/blog/[slug]`) — public articles when at least one is published; slug from title (spaces → hyphens, lowercase); BBCode body (bold, links, lists, quotes, code, images); footer **Blog** link appears when any published article exists
- **Legal pages** (`/privacy`, `/rules`, `/cookie`) — admin-editable BBCode text on `site_settings`; each public route returns 404 until content is saved; footer links appear only when the matching field has content
- **Cookie consent** — when cookie rules exist, first visit opens a **Cookie settings** modal with category toggles (Necessary always on; Functional / Analytics / Marketing optional); **Reject all**, **Accept all**, and **Save preferences**; choice stored in `localStorage` (`battledrop-cookie-preferences`); fixed **cookie icon** bottom-left reopens settings; **Marketing** toggle gates `bd_affiliate_ref` (`apply-cookie-preferences.ts`); popup **Privacy policy** link only when `/privacy` is published
- **Footer** — **Blog** (when published articles exist), **Privacy** / **Rules** / **Cookie** (when each legal page has content), **Support**, **Suggestions**, and **Submit** links

### Admin panel (`/admin-panel`)

- **Overview** — quick links to admin areas
- **Users** — all accounts, admin badge, **points balance** before admin toggle (same icon/style as header), last seen (5‑min throttle; shown in each user's own date/time format)
- **Projects** — placeholder UI
- **Battles** — weekly, monthly, and yearly subnav at `/admin-panel/battles`
  - Year switcher — active year, previous years with real entries, and next year for planning (`?year=`)
  - Weekly — 52 week cards; entry counts from **published projects only**; scrollable list auto-scrolls to active week
  - Week card badges — disabled (💩), min projects (👥 + count), points per submit (💵 + `N points`, not currency symbol); winner cash prize inline after week title (`fa-trophy` + site default currency) when > 0
  - Per-week settings modal — enabled toggle, optional min projects, submit price override, optional **winner cash prize** (empty = 0, hidden in UI; saved via API to `battle_week_settings`)
  - Monthly — 12 month cards; yearly — years with entry counts, starting from active year
- **Settings** — site name, slogan, date/time display defaults, **regional defaults** (default currency), and **battle defaults** (`site_settings` table)
  - Default currency (EUR, USD, GBP) — used for price display when users have no personal override
  - Default submit price (shown in site currency)
  - Default hours until battle starts from ISO week beginning (Monday 00:00)
  - **Promote duration (hours)** — how long one promoted spot stays active after booking (1–168 h; default 168)
- **Todo** — shared admin task board (`admin_todos` table); sidebar link last in the menu
  - Two columns: **Tasks** (pending) and **In progress** — each column header shows a **task count** badge on the right
  - Drag-and-drop between columns, reorder within a column, drop indicator line
  - Shared trash zones above and below both columns (drag task there to delete)
  - Add task via header button → modal (title + description)
  - Edit task via pencil icon on each card → modal
- **Integrations** (`/admin-panel/integrations`) — admin-managed third-party service keys (`site_integrations`, migration `019`); add/edit modal (name, key, API key, description); each card shows **Configure**, status badge, and enable toggle on one row; audit log on changes; feature gates: `integration_poll` (home sidebar poll), `project_promotes` (promote booking + feed insertions), `integration_affiliates` (referral program), `integration_shop` (upvote / affiliate → points exchange)
- **Poll** (`/admin-panel/poll`) — create polls with 2–10 answer options (`site_polls`, migration `021`); live vote progress per option; enable one poll at a time for the homepage sidebar; **red warning** when `integration_poll` is disabled (link to Integrations); audit log on create/update
- **Blog** (`/admin-panel/blog`) — create, edit, publish, and delete articles (`blog_articles`, migration `028`); title + description + BBCode content; toolbar + live preview; drag-and-drop / upload images into content (`blog-images` storage bucket, migration `029`); slug auto-generated from title; audit log on create/update/delete
- **Privacy** (`/admin-panel/privacy`) — edit privacy policy BBCode (`site_settings.privacy_content`, migration `030`); public `/privacy` + footer link when saved
- **Rules** (`/admin-panel/rules`) — edit site rules BBCode (`site_settings.rules_content`, migration `030`); public `/rules` + footer link when saved
- **Cookie** (`/admin-panel/cookie`) — edit cookie policy BBCode (`site_settings.cookie_content`, migration `031`); public `/cookie`, footer **Cookie** link, first-visit consent modal, and fixed bottom-left cookie icon when saved
- **Shop** (`/admin-panel/shop`) — exchange rates on `site_settings` (`shop_upvotes_per_point`, `shop_affiliates_per_point`; defaults 5 upvotes / 1 referral per point); **red warning** when `integration_shop` is disabled (link to Integrations); audit log on rate changes
- **Support** (`/admin-panel/support`) — review user tickets; update status; list sorted by recency; sidebar **red badge** counts only `open` tickets (drops when moved to `in_progress` or `closed`)
- **Suggestions** (`/admin-panel/suggestions`) — review feature ideas; mark `new` / `reviewed` / `accepted` / `declined`; sorted by upvote count; sidebar **red badge** counts only `new` suggestions (drops when reviewed)
- **Admin alerts (header)** — bell icon for admins; `!` overlay when actionable items exist; dropdown lists **Support** and **Suggestions** with red count badges; badges refresh live via `AdminAlertCountsProvider` + `router.refresh()` on status change (no desktop scroll lock)

### Security

- **SSRF protection** — user-supplied URLs validated before server fetch (`app/lib/security/safe-url.ts`)
- **Safe OAuth redirects** — `?next=` sanitized against open redirects
- **Rate limits** — public fetch routes (preview, screenshot, check-url) per IP
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy (`next.config.ts`)
- **Input limits** — API validation + DB constraints (migration 009)
- **Admin audit log** — settings, role changes, todo actions, integration changes, poll create/update, shop rate changes, support ticket status, suggestion status, blog article create/update/delete, and legal page updates → `admin_audit_log`
- **CI** — npm audit, security unit tests, lint, build, gitleaks (see below)
- **Docs** — [`security-check.md`](security-check.md) (score **8/10**, checklist, remaining work)

### UX patterns

- **Toast feedback** — success/error/info via shared popup (auto-dismiss, pauses on hover)
- **Loading states** — animated spinner + “Loading…” in the content area; header and footer stay visible
- **Tooltips** — shared `Tooltip` component (`role="tooltip"`) with **auto placement** (flips above/below and re-aligns when clipped); never use HTML `title` for hover hints
- **Site header** — desktop: logo, **Archive** (after site name), **Submit product** (`fa-plus`), balance badges, avatar; mobile: logo + hamburger + avatar only — **Archive** and **Submit product** live in the hamburger menu (`fixed` full-width panel below header)
- **Account menu** — Font Awesome icon on every item; **Shop** listed after **Affiliates** when integrations enabled; **Admin Panel** shows red total alert badge for admins
- **User avatars** — Google profile photos in header menu, settings side panel, admin users list, submit sidebar, and comment threads; square rounded fallback with **initials** from full name or `@handle` (`formatUserAvatarInitials`) when image missing or blocked
- **Header controls** — shared `h-8` sizing via `header-control-styles.ts` (submit link, **Sign in** button, balance badges, menu button, avatar); guest **Sign in** matches **Submit product** outline style (`headerAuthButtonClassName`)
- **Header scroll** — body scroll lock only for mobile nav / mobile user menu / mobile admin-alerts panel, not desktop dropdowns

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
| `/products/[id]` | Product detail — published projects from DB (owner can preview drafts); threaded comments + upvotes + author reputation badges; square avatars with initials; `?from=my-projects` back link; mock fallback for legacy demo IDs |
| `/archive` | DB-backed season archive — year switcher (`?year=`); one row per week; top 5 organic products; podium styling; active week scroll + vote |
| `/submit` | Submit new project (guests OK) · edit requires auth (`?projectId=`) |
| `/my-projects` | User's projects — newest first; published rows tinted by battle week status |
| `/my-projects/[id]/preview` | Redirects to `/products/[id]?from=my-projects` |
| `/settings` | Date/time and currency preferences (auth); side panel with account info |
| `/buy-points` | Buy points (auth); package picker (Stripe placeholder), side panel with account + pricing |
| `/affiliates` | Referral dashboard — link, invites, joined/pending stats, side panel (auth; requires `integration_affiliates`; shop redeem UI gated on `integration_shop`) |
| `/shop` | Exchange comment upvotes and affiliate referrals for points (auth; requires `integration_shop` for redemption) |
| `/support` | Open support tickets and track status (auth) |
| `/suggestions` | Submit feature ideas; browse community feed; upvote / unupvote (auth) |
| `/blog` | Published blog articles index (public) |
| `/blog/[slug]` | Single blog article — BBCode-rendered body (public; slug from title) |
| `/privacy` | Privacy policy — BBCode body (public when admin has saved content) |
| `/rules` | Site rules — BBCode body (public when admin has saved content) |
| `/cookie` | Cookie policy — BBCode body (public when admin has saved content) |
| `/admin-panel` | Admin overview (admin only) |
| `/admin-panel/users` | User list; last seen per user's format |
| `/admin-panel/projects` | All projects (placeholder UI) |
| `/admin-panel/battles` | Battles hub (redirects to weekly) |
| `/admin-panel/battles/weekly` | 52 weekly battles for selected year |
| `/admin-panel/battles/monthly` | 12 monthly battles for selected year |
| `/admin-panel/battles/yearly` | Annual battle years with entry counts |
| `/admin-panel/todo` | Admin todo board — drag-and-drop columns, add/edit modals |
| `/admin-panel/integrations` | Third-party integrations — add/edit modal, inline status + enable toggle (admin only) |
| `/admin-panel/poll` | Site-wide polls — create question + options, view progress, enable/disable for homepage sidebar (admin only) |
| `/admin-panel/blog` | Blog articles — create/edit, BBCode editor, image upload, publish toggle (admin only) |
| `/admin-panel/privacy` | Privacy policy — BBCode editor (admin only) |
| `/admin-panel/rules` | Site rules — BBCode editor (admin only) |
| `/admin-panel/cookie` | Cookie rules — BBCode editor; powers `/cookie` page + consent popup (admin only) |
| `/admin-panel/shop` | Shop exchange rates — upvotes and affiliates per point (admin only) |
| `/admin-panel/settings` | Site name, slogan, date/time defaults, default currency, battle defaults |
| `/admin-panel/support` | User support tickets — status updates (admin only) |
| `/admin-panel/suggestions` | User feature suggestions — review status + upvote counts (admin only) |

### API

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/projects` | POST | Yes | Create draft; returns `{ skipped, message }` if URL already in DB |
| `/api/projects/[id]` | PATCH, DELETE | Yes | Update, soft-delete |
| `/api/projects/[id]/publish` | POST | Yes | Publish draft for display or next available week (`getPublishTargetWeek`); sets `battle_year` / `battle_iso_week`; deducts `submitPrice` points (`users.points`); returns `402` + `redirectTo: /buy-points` if insufficient |
| `/api/projects/[id]/promote` | POST | Yes | Book promoted slot for current week (`{ spot: 1\|2\|3 }`); requires `project_promotes` integration enabled (`403` otherwise); sets `expires_at` from site `promoteDurationHours`; deducts slot price (3 / 2 / 1 points); `402` + redirect hint when insufficient |
| `/api/projects/[id]/comments` | POST | Yes | Post threaded comment on published project; returns `{ comment }` |
| `/api/project-comments/[id]/upvote` | POST | Yes | Upvote another user's comment (one per user; cannot upvote own) |
| `/api/integrations` | GET, POST | Admin | List integrations · create |
| `/api/integrations/[id]` | PATCH, DELETE | Admin | Update integration · delete |
| `/api/polls` | GET, POST | Admin | List polls · create poll with options |
| `/api/polls/[id]` | PATCH | Admin | Enable/disable poll for homepage |
| `/api/polls/[id]/vote` | POST | Yes | Cast one vote per user on active poll |
| `/api/affiliates` | GET | Yes | Affiliate dashboard (link, invites, joined count, shop redeem hints); `404` when `integration_affiliates` disabled |
| `/api/affiliates/invites` | POST | Yes | Send email invite (`{ email }`); duplicate invite blocked |
| `/api/shop-settings` | GET, PATCH | GET public · PATCH admin | Shop exchange rates (`upvotesPerPoint`, `affiliatesPerPoint`) |
| `/api/shop/redeem-upvotes` | POST | Yes | Exchange comment upvotes for points (`{ points }`); requires `integration_shop` |
| `/api/shop/redeem-affiliates` | POST | Yes | Exchange joined referrals for points (`{ points }`); requires `integration_shop` + `integration_affiliates` |
| `/api/projects/check-url` | GET | Yes | Duplicate check by domain; rate limited |
| `/api/project-preview` | POST | Public | Fetch page meta; SSRF guard + rate limit |
| `/api/project-screenshot` | GET | Public | Screenshot proxy; SSRF guard + rate limit |
| `/api/site-settings` | GET, PATCH | GET public · PATCH admin | Site config (name, slogan, date/time, default currency, battle defaults) |
| `/api/user-settings` | GET, PATCH | Yes | User date/time and currency prefs |
| `/api/battle-week-settings/[year]/[week]` | GET, PATCH | Admin | Per-week battle overrides (enabled, min projects, submit price, winner cash prize) |
| `/api/users/[id]/admin` | PATCH | Admin | Grant/revoke admin role |
| `/api/admin-todos` | POST | Admin | Create todo task |
| `/api/admin-todos/board` | PUT | Admin | Sync column order after drag-and-drop |
| `/api/admin-todos/[id]` | PATCH, DELETE | Admin | Update title/description · delete task |
| `/api/support-tickets` | POST | Yes | Create support ticket (`subject`, `message`) |
| `/api/support-tickets/[id]` | PATCH | Admin | Update ticket status (`open` / `in_progress` / `closed`) |
| `/api/user-suggestions` | POST | Yes | Submit feature suggestion (`title`, `description`) |
| `/api/user-suggestions/[id]` | PATCH | Admin | Update suggestion status (`new` / `reviewed` / `accepted` / `declined`) |
| `/api/user-suggestions/[id]/upvote` | POST, DELETE | Yes | Upvote · remove upvote (cannot upvote own suggestion) |
| `/api/blog` | GET, POST | Admin | List articles · create article (`title`, `description`, `content`, optional `published`) |
| `/api/blog/[id]` | PATCH, DELETE | Admin | Update article · delete article |
| `/api/blog/upload` | POST | Admin | Upload blog image (`FormData` field `file`); returns public URL for `[img]…[/img]` |
| `/api/site-legal-pages` | GET, PATCH | GET public · PATCH admin | Read privacy/rules/cookie content · save one page (`{ page, content }`; `page`: `privacy` \| `rules` \| `cookie`) |

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
| Admin battle-week card badge | Submit fee: points only (`15 points`); winner prize on week title uses **site default currency** |
| Home hero / sidebar winner prize | Viewer's effective currency (user → site → default) — same as other money display |

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
| `app/lib/battle-week-settings/resolveEffectiveWeekSettings()` | Per-week enabled, min projects, effective submit price, effective winner cash prize |
| `app/lib/battle-week-status.ts` | Week timing, display status, badge/border/shadow classes, shuffle gate |
| `app/lib/site-settings/format-display-money.ts` | `formatDisplayMoney`, `formatDisplayMoneyWithPoints`, `formatDisplayPoints`, `formatPointsAmount` |
| `app/lib/site-settings/resolve-effective-currency-settings.ts` | Merge user + site currency |
| `app/lib/users/user-currency-preferences.ts` | User currency CRUD + `getEffectiveCurrencyForUser` |
| `app/components/site-currency-settings-provider.tsx` | Client context (`useSiteCurrency`) |

Amounts (`battle_submit_price`, per-week `submit_price`, per-week `winner_money_price`) are numeric only; currency is display-only. Do not hardcode currency symbols in UI — use `formatDisplayMoney*`. For battle rules and week hero submit labels, use **`formatDisplayPoints`** (points-only). Winner prize uses **`formatDisplayMoney`** when `winnerMoneyPrice > 0`. See `.cursor/rules/single-source-of-truth.mdc` — never duplicate battle-week resolution in pages.

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
├── api/                  # Route handlers (projects, comments, integrations, settings, admin todos)
├── auth/                 # OAuth callback + error page
├── components/           # UI (feed, hero, toast, tooltip, loading, admin battles, settings forms)
├── lib/
│   ├── battle-week-settings/  # Per-week overrides CRUD
│   ├── hall-of-fame/       # Previous week top 5 for home sidebar
│   ├── archive/            # DB-backed season calendar (year fetch, week status, top 5 organic)
│   ├── admin-battles/    # Battle entry counts from published projects
│   ├── admin-todos/      # Todo board CRUD, atomic RPC sync
│   ├── admin-alerts/     # Open support + new suggestion counts for admin badges
│   ├── support-tickets/  # User tickets CRUD + admin status updates
│   ├── user-suggestions/ # Feature ideas, upvotes, admin review status
│   ├── blog/             # Articles CRUD, BBCode parse, slugify, image upload
│   ├── integrations/     # Site integrations CRUD (admin)
│   ├── affiliates/       # Referral codes, invites, claim on sign-up; `integration_affiliates` gate
│   ├── shop/             # Exchange rates, dashboard, redeem RPC wrappers; `integration_shop` gate
│   ├── product-comments.ts / product-comments-client.ts  # DB reads + optimistic tree helpers
│   ├── auth/             # `signInWithGoogle` (OAuth + safe return path)
│   ├── projects/         # CRUD, URL normalize/host match, duplicate checks
│   ├── security/         # SSRF, rate limit, input limits, audit log, redirect helper
│   ├── site-settings/    # get/update site_settings, date & money format helpers
│   ├── supabase/         # Server, client, admin clients; env guard (`env.ts`)
│   ├── promoted-slots/   # Slot definitions, week bookings
│   └── users/            # Profile sync, last seen, date/time & currency prefs, points balance + deduct/credit RPC
├── buy-points/           # Buy points page + loading.tsx
├── affiliates/           # Referral dashboard (auth)
├── shop/                 # Upvote / affiliate → points exchange (auth)
├── support/              # User support tickets (auth)
├── suggestions/          # Feature ideas + community upvote feed (auth)
├── blog/                 # Public blog index + article pages
├── my-projects/          # User project list; preview redirects to /products/[id]
├── products/[id]/        # Product detail (DB + mock fallback)
├── settings/             # User preferences page
├── submit/               # Submit / edit flow
├── archive/              # Archive page + loading.tsx
├── loading.tsx           # Home route loading (SiteRouteLoading)
├── proxy.ts              # Session refresh (Next.js 16); skips if Supabase env missing
├── page.tsx              # Home
└── layout.tsx            # Root layout, metadata, date + currency providers, cookie consent

.github/workflows/        # security-audit, security-smoke, secret-scan
docs/security/           # CSRF posture, Supabase linter review
.cursor/rules/            # Cursor agent conventions (date formats, currency, toast, loading)
supabase/migrations/      # Ordered SQL migrations (001–031)
scripts/
├── apply-migrations.mjs  # Run migrations against Supabase Postgres
├── check-required-migrations.mjs
└── test-supabase.mjs     # Connectivity check
security-check.md         # Security score, checklist, backlog
```

### Key files

- `app/lib/mock-data.ts` — demo products, battles (legacy product pages only)
- `app/lib/archive/` — `getArchiveYearData()`, `fetchYearProjectsGroupedByWeek()`, week status via `getHomeBattleWeek()`; top 5 organic (excludes promoted via `getPromotedSlotsForYear()`)
- `app/lib/build-leaderboard.ts` — organic ranking + promoted insertions from `BookedPromotedSlot[]`
- `app/lib/projects/get-battle-week-products.ts` — published projects → `Product[]` for home feed (week filter via `battle_year` / `created_at`)
- `app/lib/projects/project-battle-week.ts` — `resolveProjectBattleWeek`, `projectMatchesBattleWeek`, Supabase OR filters
- `app/lib/projects/publish-project.ts` — `userHasPublishedProjectInWeek`
- `app/lib/battle-week-settings/get-home-battle-week.ts` — `getHomeBattleWeek()`, `getPublishTargetWeek()` (next week when voting started)
- `app/lib/hall-of-fame/get-previous-week-hall-of-fame.ts` — `getPreviousWeekHallOfFame()` (closed week only; top 5 organic by votes; excludes promoted)
- `app/components/publish-project-modal.tsx` — publish confirm modal (week info + rules checkbox)
- `app/components/project-logo.tsx` — favicon or letter avatar (feed, product detail)
- `app/lib/promoted-slots/` — slot definitions, week bookings, `getPromotedSlotsForWeek()` (active slots only; empty when `project_promotes` disabled), `promote-duration.ts` (`computePromoteExpiresAt`, `formatPromoteDurationLabel`, `isPromotedSlotActive`), `is-promotes-enabled.ts` (`PROMOTE_INTEGRATION_KEY`, `isPromotesEnabled()`)
- `app/components/promote-expiry-countdown.tsx` — owner-only live countdown after Promoted badge (home feed + My Projects)
- `app/components/promote-project-modal.tsx` — spot picker (3 / 2 / 1 points labels); shows promote duration from site settings; balance link; redirect on insufficient points
- `app/components/points-balance-link.tsx` — clickable points badge/inline link → `/buy-points?return=`; `display` variant for read-only (admin users)
- `app/components/submit-battle-week-card.tsx` — submit side panel week card (entry fee, min projects, voting countdown)
- `app/components/submit-voting-opens-countdown.tsx` — live countdown to `timing.votingOpensAt` on `/submit`
- `app/components/my-projects-list.tsx` — project cards; published rows use `BATTLE_WEEK_STATUS_BADGE` border + shadow; Preview + comment count badge
- `app/lib/product-comments.ts` — DB-backed comment threads + counts; `getUserCommentUpvoteCount(s)` for author reputation totals; demo fallback for legacy numeric product IDs
- `app/lib/product-comments-client.ts` — optimistic tree helpers (`appendCommentToTree`, `updateCommentInTree`, `updateCommentsByAuthorInTree`)
- `app/lib/users/format-user-avatar-initials.ts` — initials from full name or `@handle` (not raw `@`)
- `app/lib/projects/get-product-page-data.ts` — single resolver for `/products/[id]` (published, owner draft, mock); `ProductLaunchStat` (battle week vs created date)
- `app/components/product-comments-section.tsx` — comment form, replies, optimistic post/upvote; syncs header/sidebar count; bumps author reputation on upvote
- `app/components/comment-thread.tsx` — threaded replies; per-comment upvote + author reputation badge; square avatars
- `app/components/user-comment-upvote-balance.tsx` — header comment-upvote badge (`fa-star`)
- `app/components/user-affiliate-balance.tsx` — header affiliate badge (`fa-user-tag`)
- `app/components/author-upvote-badge.tsx` — inline author reputation in comment header
- `app/components/user-points-balance.tsx` — header points badge wrapper
- `app/components/header-control-styles.ts` — shared `h-8` classes for submit link, balance badges, icon buttons
- `app/components/affiliate-copy-link-button.tsx` — home sidebar **Copy link** (toast on success)
- `app/lib/affiliates/get-user-available-affiliates.ts` — available referral count for header badge + sidebar
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
- `app/components/tooltip.tsx` — client hover tooltip with auto placement (`role="tooltip"`); no HTML `title` hints
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
- `app/components/admin-integrations-panel.tsx` — integrations list; Configure + status badge + enable toggle per card
- `app/components/admin-integration-form-modal.tsx` — add/edit integration modal
- `app/lib/integrations/` — CRUD, normalize input, map rows (`site_integrations`); `is-integration-enabled.ts` for runtime feature gates
- `app/components/admin-poll-panel.tsx` — create poll form, progress bars, homepage enable toggle
- `app/components/sidebar-poll.tsx` — home sidebar vote UI + post-vote progress bars
- `app/components/poll-progress-bars.tsx` — shared option comparison bars (admin + sidebar)
- `app/lib/polls/` — types, create/update/vote, `isPollEnabled()`, `getHomePoll()`, `getSitePolls()` (`site_polls`, `site_poll_options`, `site_poll_votes`)
- `app/lib/affiliates/` — codes, invites, `claimAffiliateReferral()`, `getAffiliateDashboard()`; `AFFILIATE_INTEGRATION_KEY`, `isAffiliatesEnabled()`
- `app/components/affiliate-ref-capture.tsx` — stores `?ref=` in `bd_affiliate_ref` only when marketing cookies are allowed
- `app/components/affiliates-panel.tsx` / `affiliates-side-panel.tsx` — `/affiliates` UI
- `app/lib/shop/` — `getShopSettings()`, `getShopDashboard()`, `redeemShopUpvotes()` / `redeemShopAffiliates()`; `SHOP_INTEGRATION_KEY`, `isShopEnabled()`
- `app/lib/shop/format-shop-exchange-rate.ts` — canonical affiliate/shop rate labels (sidebar, affiliates, shop panels)
- `app/components/admin-shop-panel.tsx` — admin exchange-rate form + integration disabled warning
- `app/components/shop-panel.tsx` / `shop-side-panel.tsx` — `/shop` exchange UI
- `app/components/admin-todo-board.tsx` — drag-and-drop todo columns + add/edit modals
- `app/components/admin-todo-form-modal.tsx` — shared add/edit task modal
- `app/lib/admin-todos/` — get/create/update/delete/sync board against `admin_todos`
- `app/lib/admin-alerts/get-admin-alert-counts.ts` — open tickets + new suggestions for header/sidebar badges
- `app/components/admin-alert-counts-provider.tsx` — live admin badge counts in sidebar after status changes
- `app/components/admin-alerts-menu.tsx` — header bell dropdown (Support + Suggestions counts)
- `app/components/admin-count-badge.tsx` — shared red count badge for admin alerts
- `app/components/support-panel.tsx` / `app/components/suggestions-panel.tsx` — user ticket + suggestion forms and lists
- `app/components/admin-support-list.tsx` / `admin-suggestions-list.tsx` — admin review lists with status controls
- `app/lib/support-tickets/` — ticket types, create, admin/user reads, status updates
- `app/lib/user-suggestions/` — suggestion feed, upvote/unupvote, attach counts, admin reads
- `app/components/admin-blog-panel.tsx` — create/edit articles, publish toggle, delete
- `app/components/bbcode-editor.tsx` — BBCode toolbar, preview, drag-and-drop image upload
- `app/components/bbcode-content.tsx` — server-safe BBCode → HTML renderer
- `app/components/blog-article-list.tsx` / `blog-article-view.tsx` — public blog UI
- `app/lib/blog/` — types, CRUD, `parse-bbcode.ts`, `slugify-blog-title.ts`, `upload-blog-image.ts`, cached published reads (`tags: ["blog"]`)
- `app/lib/site-legal-pages/` — privacy/rules/cookie content on `site_settings`; cached reads (`tags: ["site-legal-pages"]`)
- `app/components/legal-page-view.tsx` — shared public legal page layout (`BbcodeContent`)
- `app/components/admin-legal-page-form.tsx` — admin BBCode editor + save for each legal page
- `app/components/cookie-consent-provider.tsx` — root layout wrapper; first-visit auto-open; applies stored preferences on load
- `app/components/cookie-consent-popup.tsx` — GDPR-style settings modal (category toggles, Reject all / Accept all / Save preferences)
- `app/components/cookie-consent-fab.tsx` — fixed bottom-left cookie icon to reopen settings
- `app/lib/cookie-consent/cookie-consent-storage.ts` — `battledrop-cookie-preferences` JSON in `localStorage`
- `app/lib/cookie-consent/cookie-consent-types.ts` — category definitions (Necessary, Functional, Analytics, Marketing)
- `app/lib/cookie-consent/apply-cookie-preferences.ts` — enforces marketing choice on `bd_affiliate_ref`; dispatches `battledrop-cookie-preferences` event
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

Promoted products are visually distinct (badge + border + background) but show their **real vote rank** (`#` prefix), not the paid slot number or visual feed position.

| Spot | Position |
|------|----------|
| 1 | Before organic #1 |
| 2 | After organic #5 |
| 3 | After organic #10 |

Promoted products are excluded from the organic vote ranking to avoid duplicates.

**Integration gate:** create `project_promotes` in **Admin → Integrations** and enable it. When disabled or missing, `isPromotesEnabled()` returns false — no Promote button on My Projects, no promoted insertions on the home feed, `POST /api/projects/[id]/promote` returns `403`, and `getPromotedSlotsForWeek()` returns `[]`.

Bookings persist in `public.promoted_slots` (migration `014`; `expires_at` added in `022`). Users book via **My Projects → Promote** after publishing (integration enabled). Each booking gets `expires_at = now + promoteDurationHours` from `site_settings` (admin default 1–168 hours). `getPromotedSlotsForWeek()` returns only non-expired rows — expired slots free the position and drop off the feed (client ticks every second on home + My Projects). **Project owners** see a small mono countdown after the Promoted badge until expiry. **Points are deducted** on promote (3 / 2 / 1 by spot) and on publish (`submitPrice` from `getPublishTargetWeek()`). Insufficient balance returns HTTP `402` and redirects the client to `/buy-points`.

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
   | `017_project_comments.sql` | Threaded comments on published projects (`project_comments`) |
   | `018_project_comments_grants.sql` | Grants + `select_own` RLS policy for comment authors |
   | `019_site_integrations.sql` | Admin-managed third-party integrations (`site_integrations`) |
   | `020_project_comment_upvotes.sql` | One upvote per user per comment (`project_comment_upvotes`) |
   | `021_site_polls.sql` | Site-wide polls (`site_polls`, `site_poll_options`, `site_poll_votes`) |
   | `022_site_promote_duration.sql` | `promote_duration_hours` on `site_settings`; `expires_at` on `promoted_slots` |
   | `023_affiliates.sql` | `users.affiliate_code`, `referred_by_user_id`; `affiliate_invites`; protected affiliate fields |
   | `024_shop.sql` | Shop rates on `site_settings`; `shop_*_redeemed` on `users`; `redeem_shop_upvotes` / `redeem_shop_affiliates` RPC |
   | `025_support_tickets_and_suggestions.sql` | `support_tickets` + `user_suggestions` tables; RLS for own insert/select + admin read/update |
   | `026_user_suggestion_upvotes.sql` | One upvote per user per suggestion (`user_suggestion_upvotes`) |
   | `027_battle_week_winner_money_price.sql` | Per-week winner cash prize (`winner_money_price`; default 0, hidden when zero) |
   | `028_blog_articles.sql` | Admin-managed blog articles (`blog_articles`); public read when `published = true` |
   | `029_blog_images_storage.sql` | Public `blog-images` storage bucket for inline article images (5 MB; JPEG/PNG/GIF/WebP) |
   | `030_site_legal_pages.sql` | `privacy_content` + `rules_content` on `site_settings` for `/privacy` and `/rules` |
   | `031_site_cookie_rules.sql` | `cookie_content` on `site_settings` for `/cookie` + consent popup |

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

1. Run migrations `001`–`031` on the **production** Supabase project (see [Supabase Setup](#supabase-setup))
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

Bump the version in `package.json` when the change is user-facing or notable. Current: `0.1.37`.

When the user asks to **update README**, follow `.cursor/rules/readme-version-update.mdc`: bump version, move `Unreleased` → new changelog section, list all improvements since the last version.

When the user asks to **commit** or **push**, follow `.cursor/rules/github-version-commit.mdc` — every release commit message must end with `. vX.Y.Z`.

---

## Changelog

Summary of what shipped in each release (newest first).

### Unreleased

- (none)

### v0.1.37

**CI lint fixes**

- **`admin-alert-counts-provider.tsx`** — sync alert counts from server props during render (avoids `set-state-in-effect`)
- **`cookie-consent-provider.tsx`** — first-visit auto-open via `queueMicrotask`; popup remount `key` for preference resets
- **`cookie-consent-popup.tsx`** — drop redundant preferences sync effect
- **`site-footer.tsx`** — internal nav uses `next/link` (`@next/next/no-html-link-for-pages`)
- **`fetch-year-projects.ts`** — remove unused `formatMakerHandle` import

### v0.1.36

**Cookie consent — GDPR settings UI & marketing gate**

- **Cookie settings modal** — category toggles (Necessary locked on; Functional / Analytics / Marketing optional); **Reject all**, **Accept all**, **Save preferences**; first visit requires a choice (no backdrop dismiss)
- **Fixed cookie FAB** — large `fa-cookie-bite` button bottom-left reopens settings (replaces footer **Cookie popup** link)
- **Preference storage** — `battledrop-cookie-preferences` JSON in `localStorage` (replaces legacy `battledrop-cookie-consent-seen`)
- **Marketing enforcement** — `apply-cookie-preferences.ts` + `affiliate-ref-capture.tsx`; `bd_affiliate_ref` set only when marketing accepted; deleted on reject
- **Popup links** — **Cookie policy** always; **Privacy policy** only when privacy content is published (same rule as footer)
- **Layout** — `overflow-x-hidden` on `html`/`body`; `min-h-dvh` flex wrapper in `CookieConsentProvider` (fixes horizontal scroll + footer gap)
- **BBCode editor** — `toLocaleString("en-US")` on character counter (fixes SSR hydration mismatch in admin legal/blog editors)

### v0.1.35

**Legal pages — Privacy, Rules & Cookie consent**

- **Migrations `030`–`031`** — `privacy_content`, `rules_content`, and `cookie_content` text columns on `site_settings` singleton
- **Admin panel** — `/admin-panel/privacy`, `/admin-panel/rules`, `/admin-panel/cookie`; shared BBCode editor form; sidebar links after Blog
- **Public routes** — `/privacy`, `/rules`, `/cookie`; `LegalPageView` + `BbcodeContent`; `notFound()` when content empty
- **Footer** — conditional **Privacy**, **Rules**, **Cookie**, and **Cookie popup** links when matching content exists
- **Cookie consent** — `CookieConsentProvider` in root layout; first visit auto-opens modal; **Accept** / backdrop dismiss sets `localStorage` `battledrop-cookie-consent-seen`; footer **Cookie popup** reopens manually
- **API** — `GET/PATCH /api/site-legal-pages` (`{ page: "privacy" | "rules" | "cookie", content }`); cache tag `site-legal-pages`
- **Audit** — `site_legal_pages.update`
- **Input limits** — `siteLegalContent` in `input-limits.ts`

### v0.1.34

**Blog — admin articles & public pages**

- **Migrations `028`–`029`** — `blog_articles` (title, description, BBCode content, slug, published, `published_at`); public `blog-images` Supabase Storage bucket (5 MB; JPEG/PNG/GIF/WebP)
- **Admin Blog** (`/admin-panel/blog`) — sidebar link; create, edit, publish/unpublish, delete; BBCode toolbar + preview; drag-and-drop / file upload inserts `[img]url[/img]` into content
- **Public routes** — `/blog` index; `/blog/[slug]` article page; slug from title (spaces → hyphens, lowercase; `-2` suffix on collision)
- **BBCode renderer** — `parse-bbcode.ts` + `BbcodeContent` (bold, italic, underline, headings, links, lists, quotes, code, images); safe HTML via allowlist + escaping
- **Footer** — **Blog** link when at least one published article exists (`hasPublishedBlogArticles()`; cached tag `blog`)
- **API** — `GET/POST /api/blog`, `PATCH/DELETE /api/blog/[id]`, `POST /api/blog/upload` (admin-only; rate limited)
- **Audit** — `blog_article.create`, `blog_article.update`, `blog_article.delete`
- **Input limits** — `blogTitle`, `blogDescription`, `blogContent` in `input-limits.ts`

### v0.1.33

**Archive — real data & UX polish**

- **DB-backed archive** — `/archive` loads published projects from Supabase (`app/lib/archive/`); one query per year grouped by `battle_year` / `battle_iso_week`; comment counts from `project_comments`
- **Top 5 organic** — same rule as Hall of Fame (promoted slots excluded via `getPromotedSlotsForYear()`); week status from `getHomeBattleWeek()` + `resolveArchiveWeekStatus()`
- **Layout** — one full-width week row; compact top-5 grid (monthly-voting style); subtle week-card backgrounds; bordered project rows
- **Podium styling** — distinct gold / silver / bronze backgrounds for ranks 1–3
- **Navigation** — project row links to `/products/[id]`; comment button active; voting disabled on closed weeks; **active week** keeps client vote UI
- **Auto-scroll** — opening the current year scrolls to the live week (`ARCHIVE_ACTIVE_WEEK_ELEMENT_ID`)
- **Year switcher** — `router.push(/archive?year=…)` server refetch (reuses route `loading.tsx`)

### v0.1.32

**Hall of Fame & archive top 5**

- **Home sidebar Hall of Fame** — shows previous **closed** week's top 5 organic products; `Week N, YYYY` header; card hidden when no data (`getPreviousWeekHallOfFame()` in `app/lib/hall-of-fame/`)
- **Removed** static mock Hall of Fame copy (*"Top 5 each week — locked forever…"* and hardcoded month label)
- **Archive calendar** — week cards show **top 5** ranked products in a responsive grid (completed + live weeks); `Week N, YYYY` headers; `archive-data.ts` + `ArchiveWeekCard` use `topProducts[]` instead of a single winner

### v0.1.31

**Per-week winner cash prize**

- **Migration `027`** — `battle_week_settings.winner_money_price` (numeric, default 0; check `>= 0`)
- **Admin battles** — per-week settings modal: optional **Winner cash prize** (site default currency symbol in input); empty saves as 0
- **Admin week cards** — trophy + formatted prize inline after `Week N, YYYY` when prize > 0
- **Home hero** — `fa-trophy` + prize after week title when set; submit fee unchanged (`N points per submit`)
- **Sidebar rules** — mentions cash prize in weekly winner step when configured
- **`getHomeBattleWeek()`** — exposes `winnerMoneyPrice`; `resolveEffectiveWeekSettings()` adds `effectiveWinnerMoneyPrice`
- **API** — `PATCH /api/battle-week-settings/[year]/[week]` accepts `winnerMoneyPrice`; audit metadata includes the field

### v0.1.30

**Support/suggestions polish & header sign-in**

- **Admin sidebar** — **Todo** moved to bottom; Support and Suggestions stay after Settings
- **Alert badges** — Support counts only `open` tickets; Suggestions only `new` items; sidebar badges update immediately on status change (`AdminAlertCountsProvider`)
- **Admin alerts dropdown** — Support + Suggestions links only (removed Admin Panel row); desktop page scrollbar no longer hidden when open
- **Header Sign in** — guest button matches **Submit product** outline style (`headerAuthButtonClassName` in `header-control-styles.ts`)

### v0.1.29

**Support, suggestions & admin alerts**

- **Migrations `025`–`026`** — `support_tickets` (open / in_progress / closed); `user_suggestions` (new / reviewed / accepted / declined); `user_suggestion_upvotes` (one vote per user)
- **User pages** — `/support` (tickets) and `/suggestions` (ideas + community feed sorted by upvotes); footer links; optimistic upvote / unupvote toggle
- **Admin panel** — `/admin-panel/support` and `/admin-panel/suggestions` (sidebar after Settings); status dropdowns; suggestion list sorted by popularity
- **Admin alerts** — header bell with `!` badge when open tickets or new suggestions; dropdown shows Support + Suggestions with red count badges; sidebar + account menu **Admin Panel** red badges via `getAdminAlertCounts()`
- **API** — `POST/PATCH /api/support-tickets`, `POST/PATCH /api/user-suggestions`, `POST/DELETE /api/user-suggestions/[id]/upvote`
- **Audit** — `support_ticket.update_status`, `user_suggestion.update_status`
- **UX** — admin notifications dropdown no longer locks desktop page scroll (scrollbar stays visible)

### v0.1.28

**CI lint fixes**

- **`product-comments-section.tsx`** — reset comment state when `projectId` changes during render (avoids `set-state-in-effect` ESLint error)
- **`submit-product-form.tsx`** — `handleSaveResult` wrapped in `useCallback` for stable effect deps
- **`toast.tsx`**, **`admin-battle-week-settings-modal.tsx`** — exhaustive-deps hook dependency fixes
- **Unused imports/vars** — `format-display-date.ts`, `format-display-money.ts`, `site-settings-types.ts`

### v0.1.27

**Header & mobile nav polish**

- **Affiliate header badge** — `fa-user-tag` + available referral count when `integration_affiliates` enabled; `getUserAvailableAffiliates()`; links to `/affiliates`
- **Balance tooltips** — Points / Upvotes / Affiliates badges labeled via shared `Tooltip`; auto-flip when clipped by viewport or sticky header
- **Nav cleanup** — removed **This Month** / **This week** links and `nav-month-link` pulse CSS; **Archive** after site name on desktop (`md+`); **Submit product** gets `fa-plus` icon
- **Mobile header** — Archive + Submit hidden from bar; hamburger menu shows both (`fixed` full-width panel — fixes mispositioned `absolute` dropdown); balance badges moved into account dropdown top
- **Account menu** — Font Awesome icon per item; **Shop** after **Affiliates**; unified `h-8` control sizing (`header-control-styles.ts`)
- **Home sidebar** — **Referrals & points** card: **Copy link** replaces Shop button; `AffiliateCopyLinkButton` + server-built affiliate URL for signed-in users
- **Hydration fix** — `BattleHero` week range formatted on server (`weekRangeLabel` prop) so date settings match SSR and client

### v0.1.26

**Affiliates & Shop UX polish**

- **Home sidebar** — **Referrals & points** card only when `integration_affiliates` enabled; copy uses live `shop_affiliates_per_point` from `getShopSettings()` (passed from `page.tsx`); **Shop** button only when `integration_shop` enabled
- **`/affiliates`** — two-column layout with `AffiliatesSidePanel` (account, referral summary, quick links); main panel stat cards for joined / pending invites; shop redeem cards (**Available to redeem**, **Redeemable now**) hidden when shop integration off
- **Shop-gated copy** — **How rewards work** (Shop rate, point spending) only when shop active; **How invites work** fallback when shop disabled — avoids “enable Shop” dead-ends
- **`format-shop-exchange-rate.ts`** — shared rate labels (`formatAffiliateHomeSidebarBlurb`, `formatAffiliateExchangeArrow`, etc.) for home sidebar, affiliates, and shop panels
- **`getAffiliateDashboard()`** — includes `affiliatesPerPoint`, `availableAffiliates`, `maxRedeemablePoints`, `shopEnabled` for conditional UI

### v0.1.25

**Affiliates & Shop — referral program and points exchange**

- **Migration `023`** — `users.affiliate_code`, `referred_by_user_id`; `affiliate_invites` (pending/joined); trigger protects affiliate fields from client edits
- **Affiliates** (`/affiliates`) — personal link + code, email invites, joined/pending stats; `GET /api/affiliates`, `POST /api/affiliates/invites`; account menu when `integration_affiliates` enabled
- **Referral capture** — `?ref=` stored in `bd_affiliate_ref` cookie; `claimAffiliateReferral()` on OAuth callback; one referrer per new user
- **Home sidebar** — **Referrals & points** card when affiliates enabled; shows Shop rate + links to Affiliates and Shop
- **Migration `024`** — `site_settings.shop_upvotes_per_point` (default 5), `shop_affiliates_per_point` (default 1); `users.shop_upvotes_redeemed` / `shop_affiliates_redeemed`; atomic `redeem_shop_upvotes` / `redeem_shop_affiliates` RPC
- **Admin Shop** (`/admin-panel/shop`) — set upvotes and referrals required per point; **red warning** when `integration_shop` disabled; nav link in admin sidebar
- **Shop** (`/shop`) — exchange comment upvotes and joined referrals for points; balances + rates side panel; **red banner** when shop integration off; account menu when `integration_shop` enabled
- **API** — `GET/PATCH /api/shop-settings`, `POST /api/shop/redeem-upvotes`, `POST /api/shop/redeem-affiliates`
- **Integration gates** — `integration_affiliates` in `affiliate-types.ts`; `integration_shop` in `shop-types.ts`; `format-shop-exchange-rate.ts` for shared rate copy
- **Audit** — `shop_settings.update` in admin audit log

### v0.1.24

**Promote expiry UX & `project_promotes` integration gate**

- **Owner countdown** — `PromoteExpiryCountdown` after Promoted badge on home feed (owner only) and My Projects; live `1d 2h 3m 4s` style timer
- **Live expiry** — `ProductFeed` and `MyProjectsList` filter active slots every second; badge, highlighted row, and Promote button return when `expires_at` passes (no page refresh)
- **Integration gate** — `project_promotes` in `site_integrations`; `isPromotesEnabled()` in `is-promotes-enabled.ts`; when disabled: no promote UI, empty feed insertions, API `403`
- **Docs** — Promoted Spots Logic clarifies `#` = vote rank; integration setup note for admins

### v0.1.23

**Admin Poll — integration disabled warning**

- **Admin Poll** — red banner when `integration_poll` is disabled, with link to Integrations (replaces always-on blue info callout)
- **`isPollEnabled()`** — canonical poll integration gate in `app/lib/polls/is-poll-enabled.ts`; used by admin page and `getHomePoll()`

### v0.1.22

**Promote duration — admin setting & slot expiry**

- **Migration `022`** — `site_settings.promote_duration_hours` (1–168 h, default 168); `promoted_slots.expires_at` (backfilled for existing rows)
- **Admin Settings** — *Promote duration (hours)* under battle defaults; saved via `PATCH /api/site-settings`
- **Booking** — `POST /api/projects/[id]/promote` sets `expires_at` from `computePromoteExpiresAt()` in `promote-duration.ts`
- **Active slots only** — `getPromotedSlotsForWeek()` filters `expires_at > now`; expired spots reopen for booking and leave the home feed
- **Promote modal** — shows duration label (e.g. “3 days”, “24 hours”) from site settings

### v0.1.21

**Site polls — admin panel & home sidebar**

- **Migration `021`** — `site_polls`, `site_poll_options`, `site_poll_votes`; one vote per user per poll; RLS for enabled polls + admin CRUD
- **Admin Poll** (`/admin-panel/poll`) — create question with 2–10 options; progress bars with percent + vote count; enable toggle (one active poll at a time); nav link in admin sidebar
- **Home sidebar** — `getHomePoll()` shows poll when `integration_poll` integration is enabled **and** an admin poll is active; `SidebarPoll` for vote UI; progress bars after voting
- **API** — `GET/POST /api/polls`, `PATCH /api/polls/[id]`, `POST /api/polls/[id]/vote` (auth required; duplicate vote blocked)
- **Integration gate** — `isIntegrationEnabled()` in `app/lib/integrations/`; poll constant `integration_poll` in `poll-types.ts`
- **Audit** — `site_poll.create` / `site_poll.update` in admin audit log

### v0.1.20

**Comment upvote reputation & comment avatars**

- **Header badge** — signed-in users see total comment upvotes received (`fa-star` + count) before the avatar; `getUserCommentUpvoteCount()` in `product-comments.ts`
- **Author reputation in threads** — after each `@handle`, star + lifetime upvote total on that author’s comments; optimistic bump when upvoting (`updateCommentsByAuthorInTree`)
- **Comment avatars** — square rounded (`rounded-lg`); initials from full name or handle via `formatUserAvatarInitials` (fixes `@` placeholder); `authorDisplayName` on `ProductComment`

### v0.1.19

**Admin integrations card layout**

- **Integrations UI** — status badge (Enabled/Disabled) and enable toggle moved inline after **Configure**; removed separate Active footer block on each card

### v0.1.18

**DB-backed product comments, unified product page & admin integrations**

- **Product comments** — migrations `017`–`018`; threaded `project_comments` on published projects; `POST /api/projects/[id]/comments` (auth required); RLS + admin client insert
- **Comment upvotes** — migration `020`; `POST /api/project-comments/[id]/upvote`; one upvote per user; cannot upvote own comment; optimistic UI (no full-page refresh)
- **Product page** — `get-product-page-data.ts` single resolver for `/products/[id]`; owner draft preview; landing screenshot above About; launch stats show **Battle Week** only when `battle_year` / `battle_iso_week` set, otherwise **Created [date]**
- **Preview redirect** — `/my-projects/[id]/preview` → `/products/[id]?from=my-projects`; My Projects Preview + comment badge link to product page
- **Comment counts** — home feed and My Projects list load real counts from DB (`getProductCommentCount`, `enrichProductsWithCommentCounts`)
- **Admin integrations** — migration `019`; `/admin-panel/integrations` + `GET/POST/PATCH/DELETE /api/integrations`; enable/disable third-party keys; audit log
- **React fix** — parent comment count sync via `useEffect` (fixes setState-during-render warning)

### v0.1.17

**My Projects preview & comment badge**

- **Preview on published** — **Preview** button shown for published projects (not only drafts)
- **Comment indicator** — after Preview, `fa-comment-alt` + count when `getProductCommentCount()` > 0; links to product page (see v0.1.18 for DB comments)
- **Cursor rules** — `github-version-commit.mdc` enforces version-tagged commit messages on GitHub push

### v0.1.16

**My Projects sort & published card styling**

- **My Projects sort** — `getUserProjects()` orders by `created_at` descending (newest at top)
- **Published card accent** — border (`border-2`) + colored drop shadow from project's battle week status via `BATTLE_WEEK_STATUS_BADGE` (`borderClass`, `shadowClass`); status resolved server-side per published row

### v0.1.15

**Submit week card, CI fixes & admin user points**

- **Submit side panel** — `SubmitBattleWeekCard` always shown (new submit + edit); live **Voting opens in** countdown (`SubmitVotingOpensCountdown`); replaces static “24h after week start” copy
- **Min projects on submit** — when enabled, shows `submitted/required` and progress bar directly under **Battle starts at** (same data as home hero)
- **Admin users** — points badge before admin toggle (`PointsBalanceLink` `display` variant)
- **CI / build** — fix publish modal `set-state-in-effect` lint; TypeScript fixes for legacy project queries without `battle_year` / `battle_iso_week` columns

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
- Admin audit log (`admin_audit_log`) for settings, role changes, todo actions, and integration CRUD
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
- Product detail pages with comments (mock — replaced by DB in v0.1.18)
- Archive page — season calendar grouped by month; top 5 per week card
- Home Hall of Fame — previous closed week's top 5 in sidebar
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
- [x] Per-week **winner cash prize** — admin setting; trophy + amount on home hero when > 0 (migration `027`, v0.1.31)
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
- [x] **DB-backed product comments** — threaded comments + upvotes on `/products/[id]` (migrations `017`–`020`, v0.1.18)
- [ ] Persistent **votes** (home feed vote counts still client-side demo)
- [ ] Seed database from mock data / real battles
- [x] User **points balance** — `users.points`, header badge, migration `016` (v0.1.14)
- [x] **Points deduction** on publish and promote (v0.1.14)
- [x] **Buy points** page — frontend placeholder for Stripe (v0.1.14)
- [x] **Submit week card** — voting countdown + min-project progress on `/submit` (v0.1.15)
- [x] **My Projects** — newest-first sort + published status border/shadow (v0.1.16)
- [x] **My Projects preview** — Preview on published + comment count badge (v0.1.17)
- [x] **Product comments** — DB-backed threads, upvotes, optimistic UI (v0.1.18)
- [x] **Comment upvote reputation** — header badge + author totals in threads (v0.1.20)
- [x] **Admin integrations** — `/admin-panel/integrations` (v0.1.18)
- [x] **Site polls** — admin Poll page + home sidebar when `integration_poll` enabled (migration `021`, v0.1.21)
- [x] **Promote duration** — admin setting + `expires_at` on promoted slots (migration `022`, v0.1.22)
- [x] **Promote owner countdown** — live timer after Promoted badge until slot expires (v0.1.24)
- [x] **`project_promotes` integration gate** — disable promote booking + feed insertions from Integrations (v0.1.24)
- [x] **Affiliate / referral system** — `/affiliates`, invites, `?ref=` capture, `integration_affiliates` gate (migration `023`, v0.1.25)
- [x] **Shop** — exchange upvotes and referrals for points; admin rates; `integration_shop` gate (migration `024`, v0.1.25)
- [x] **Header & mobile nav** — affiliate badge, balance tooltips, simplified nav, mobile hamburger menu, `header-control-styles` (v0.1.27)
- [x] **Support tickets** — `/support` + `/admin-panel/support` (migration `025`, v0.1.29)
- [x] **User suggestions** — community feed, upvotes, admin review (migrations `025`–`026`, v0.1.29)
- [x] **Admin alert badges** — header bell dropdown + sidebar counts for support/suggestions (v0.1.29)
- [x] **Home Hall of Fame** — previous closed week's top 5 in sidebar (v0.1.32)
- [x] **Archive top 5** — five ranked products per week card (v0.1.32)
- [x] **Archive DB-backed** — real published projects, podium styling, active-week scroll + vote (v0.1.33)
- [x] **Blog** — admin BBCode articles, image upload, public `/blog` + footer link (migrations `028`–`029`, v0.1.34)
- [ ] Stripe checkout — credit points after payment
- [ ] Payment step on submit (fiat alternative to points)

---

## TODO (recommended next steps)

Practical backlog — ops first, then product. See also [Roadmap](#roadmap) and [`security-check.md`](security-check.md).

### Ops & deploy (do first)

- [ ] **Commit + push `v0.1.19`** — product comments, upvotes, unified product page, admin integrations
- [ ] **Vercel env vars** — copy all four Supabase vars from `.env.local`; set `NEXT_PUBLIC_SITE_URL=https://battle-drop.vercel.app`
- [ ] **Redeploy** on Vercel after env changes (required — old deploys keep missing env at runtime)
- [ ] **Verify production** — `https://battle-drop.vercel.app/` loads; Google sign-in redirects to prod, not localhost
- [ ] **Migrations 014–029** on production Supabase — `promoted_slots`, battle week columns, `users.points`, `project_comments`, `site_integrations`, `project_comment_upvotes`, `site_polls`, promote duration + slot expiry, affiliates, shop exchange, support tickets, suggestions + upvotes, winner cash prize, blog articles + image storage

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

- [x] **Product comments** — DB-backed threads + upvotes on published projects (v0.1.18)
- [ ] **Persistent votes** — home feed vote counts still client-side demo
- [x] **Publish flow** — draft → published weekly battle (v0.1.11)
- [x] **Promoted spot booking** — My Projects modal + `promoted_slots` table (v0.1.11)
- [x] **Promote duration** — admin hours setting + slot `expires_at` (migration `022`, v0.1.22)
- [x] **Promote owner countdown + live expiry** — home feed + My Projects (v0.1.24)
- [x] **`project_promotes` integration gate** — Integrations toggle (v0.1.24)
- [x] **Points deduction** on publish and promote (v0.1.14)
- [x] **Buy points** frontend at `/buy-points` (v0.1.14)
- [x] **Submit side panel** — week card with voting countdown and min-project bar (v0.1.15)
- [x] **My Projects published styling** — battle week status border + shadow (v0.1.16)
- [x] **My Projects preview + comments badge** — published Preview + comment count (v0.1.17)
- [x] **Unified product page** — `/products/[id]` for published + owner preview; launch stats; screenshot (v0.1.18)
- [x] **Admin integrations** page (v0.1.18)
- [ ] **Stripe checkout** — wire buy-points packages to credit `users.points`
- [ ] **Seed** real battles from mock data or admin import
- [x] **Affiliate / referral** system — `/affiliates`, invites, referral cookie (migration `023`, v0.1.25)
- [x] **Shop** — upvote / affiliate → points exchange (migration `024`, v0.1.25)
- [x] **Legal pages** — admin-editable Privacy, Rules, Cookie + GDPR cookie settings modal (migrations `030`–`031`, v0.1.35–v0.1.36)
- [ ] **Payment** step on submit (fiat alternative to points)

---

## License

Private project.
