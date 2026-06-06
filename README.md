# BattleDrop

Weekly product battles for early-stage founders. Community votes, promoted leaderboard spots, and a Product Hunt–style feed — Next.js frontend with Supabase auth, project submissions, and admin tooling.

**Repository:** [github.com/Sandrulis/BattleDrop](https://github.com/Sandrulis/BattleDrop)

---

## Features

### Public

- **Weekly leaderboard** — products ranked by votes with live demo voting UI
- **Promoted spots** — paid placements at fixed positions (before #1, after #5, after #10)
- **Monthly championship** — banner with contender voting and countdown
- **Product pages** — detail view with comments, stats sidebar, and maker info
- **Archive** — season calendar grouped by month with historical week cards
- **Site identity** — configurable site name and slogan (header, footer, metadata, OG tags)
- **Date & time display** — site-wide defaults with optional per-user overrides

> Leaderboard, battles, votes, and comments on the home feed still use **mock data**. Auth and user projects are wired to Supabase.

### Auth & projects

- **Google sign-in** — Supabase Auth with session refresh via `proxy.ts`; OAuth callback supports `?next=` return path
- **Submit product** — two-step flow (URL → review details); guests can start without signing in
  - **Step 1** — enter URL; **signed-in users** get a duplicate check by **domain** before preview (guests skip client check — duplicate blocked on save)
  - **Step 2** — guests see **Login + Save** (not Save); draft stored in `sessionStorage`, then Google sign-in → return to `/submit` → auto-save
  - **Signed-in users** — standard **Save** button; edit via `/submit?projectId=…` (auth required)
  - Meta fetch (direct + Microlink fallback), favicon, screenshot proxy
- **Duplicate URLs** — signed-in submit flow checks domain before preview; save always checks server-side (active, soft-deleted, any owner)
- **My Projects** — list drafts, edit, soft-delete, full-page preview
- **User settings** (`/settings`) — date/time format preferences with account side panel (member since, last seen, quick links); site name and slogan are admin-only

### Admin panel (`/admin-panel`)

- **Overview** — quick links to admin areas
- **Users** — all accounts, admin badge, last seen (5‑min throttle; shown in each user's own date/time format)
- **Projects** — placeholder UI
- **Battle Results** — placeholder UI
- **Todo** — shared admin task board (`admin_todos` table)
  - Two columns: **Tasks** (pending) and **In progress**
  - Drag-and-drop between columns, reorder within a column, drop indicator line
  - Shared trash zones above and below both columns (drag task there to delete)
  - Add task via header button → modal (title + description)
  - Edit task via pencil icon on each card → modal
- **Settings** — site name, slogan, date/time display defaults (`site_settings` table)

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

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only service role key |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` locally · production URL on Vercel |
| `SUPABASE_DB_PASSWORD` or `DATABASE_URL` | For migrations | Database password or connection string for `npm run db:migrate` |

Get API keys from **Supabase Dashboard → Project Settings → API**.

Test the connection:

```bash
node scripts/test-supabase.mjs
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — monthly banner, weekly battle, leaderboard, sidebar |
| `/products/[id]` | Product detail (mock data) |
| `/archive` | Season archive with year switcher |
| `/submit` | Submit new project (guests OK) · edit requires auth (`?projectId=`) |
| `/my-projects` | User's draft projects |
| `/my-projects/[id]/preview` | Full-page project preview |
| `/settings` | Date/time preferences (auth); side panel with account info |
| `/admin-panel` | Admin overview (admin only) |
| `/admin-panel/users` | User list; last seen per user's format |
| `/admin-panel/projects` | All projects (placeholder UI) |
| `/admin-panel/battle-results` | Battle results (placeholder UI) |
| `/admin-panel/todo` | Admin todo board — drag-and-drop columns, add/edit modals |
| `/admin-panel/settings` | Site name, slogan, date/time defaults |

### API

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/projects` | POST | Yes | Create draft; returns `{ skipped, message }` if URL already in DB |
| `/api/projects/[id]` | GET, PATCH, DELETE | Yes | Read, update, soft-delete |
| `/api/projects/check-url` | GET | Yes | Duplicate check by domain; rate limited |
| `/api/project-preview` | POST | Public | Fetch page meta; SSRF guard + rate limit |
| `/api/project-screenshot` | GET | Public | Screenshot proxy; SSRF guard + rate limit |
| `/api/site-settings` | GET, PATCH | GET public · PATCH admin | Site config |
| `/api/user-settings` | GET, PATCH | Yes | User date/time prefs |
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
| `security-smoke.yml` | smoke | Security tests, lint, production build |
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
| `/admin-panel/settings` | Admin | Site name, slogan, date/time defaults |

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
├── components/           # UI (feed, hero, toast, loading, settings-side-panel, user-settings-form)
├── lib/
│   ├── admin-todos/      # Todo board CRUD, atomic RPC sync
│   ├── auth/             # `signInWithGoogle` (OAuth + safe return path)
│   ├── projects/         # CRUD, URL normalize/host match, duplicate checks
│   ├── security/         # SSRF, rate limit, input limits, audit log, redirect helper
│   ├── site-settings/    # get/update site_settings, format helpers
│   ├── supabase/         # Server, client, admin clients
│   └── users/            # Profile sync, last seen, date/time prefs
├── my-projects/          # User project list + preview
├── products/[id]/        # Product detail (mock)
├── settings/             # User preferences page
├── submit/               # Submit / edit flow
├── archive/              # Archive page + loading.tsx
├── loading.tsx           # Home route loading (SiteRouteLoading)
├── proxy.ts              # Session refresh (Next.js 16)
├── page.tsx              # Home
└── layout.tsx            # Root layout, metadata, date settings provider

.github/workflows/        # security-audit, security-smoke, secret-scan
docs/security/           # CSRF posture, Supabase linter review
.cursor/rules/            # Cursor agent conventions (date formats, toast, loading)
supabase/migrations/      # Ordered SQL migrations (001–009)
scripts/
├── apply-migrations.mjs  # Run migrations against Supabase Postgres
├── check-required-migrations.mjs
└── test-supabase.mjs     # Connectivity check
security-check.md         # Security score, checklist, backlog
```

### Key files

- `app/lib/mock-data.ts` — demo products, battles, promoted slots
- `app/lib/build-leaderboard.ts` — organic ranking + promoted insertions
- `app/components/toast.tsx` — shared toast + `useToast` hook
- `app/components/loading.tsx` — `LoadingSpinner`, `PageLoading`, `SiteRouteLoading`
- `app/components/settings-side-panel.tsx` — account card + quick links on `/settings`
- `app/components/user-settings-form.tsx` — date/time prefs form + preview
- `app/components/admin-settings-form.tsx` — site-wide settings (admin)
- `app/components/admin-todo-board.tsx` — drag-and-drop todo columns + add/edit modals
- `app/components/admin-todo-form-modal.tsx` — shared add/edit task modal
- `app/lib/admin-todos/` — get/create/update/delete/sync board against `admin_todos`
- `app/lib/security/safe-url.ts` — SSRF protection for outbound fetches
- `app/lib/security/log-admin-action.ts` — admin audit log writes
- `next.config.ts` — security headers (CSP, X-Frame-Options, …)
- `app/components/submit-product-form.tsx` — two-step submit; guest **Login + Save** flow
- `app/lib/projects/find-existing-project-by-url.ts` — duplicate detection by host (admin client)
- `app/lib/projects/project-utils.ts` — `normalizeProjectInputUrl`, `normalizeProjectHost`
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
| `site-date-time-formats.mdc` | Use `formatDisplayDate*` / effective settings; no locale formatters |
| `toast-feedback.mdc` | Action feedback via `useToast` + `<Toast>` |
| `loading-states.mdc` | `SiteRouteLoading` / `PageLoading`; spinner in content area only |

---

## Deployment

Deploy to [Vercel](https://vercel.com) by importing the GitHub repo.

**Live app:** [https://battle-drop.vercel.app](https://battle-drop.vercel.app)

Add Supabase environment variables in Vercel project settings. Set:

```
NEXT_PUBLIC_SITE_URL=https://battle-drop.vercel.app
```

Run all migrations against the production Supabase project before deploying.  
Enable GitHub **secret scanning push protection** in repo settings (recommended).

---

## Versioning & Commits

Version follows `package.json` (`semver`). Every commit message ends with the version tag:

```
Short description of the change. v0.1.5
```

Bump the version in `package.json` when the change is user-facing or notable.

---

## Roadmap

- [x] Supabase client + session refresh (`proxy.ts`)
- [x] Google sign-in
- [x] Product submission flow (drafts, edit, soft delete, preview)
- [x] Guest submit flow (Login + Save, post-login auto-save, domain duplicate check)
- [x] Admin panel (users, site settings)
- [x] Admin todo board — DB-backed drag-and-drop columns, add/edit/delete (migration 007)
- [x] Security hardening — SSRF, rate limits, headers, audit log, CI (migrations 008–009)
- [x] Site-wide date/time formats + per-user overrides (`/settings`, migration 006)
- [x] Toast feedback + route loading spinners (header/footer stay visible)
- [ ] Admin audit log UI (read-only view in admin panel)
- [ ] Global rate limiting (edge/WAF) for production scale
- [ ] Persistent votes and comments
- [ ] Publish flow (draft → live battle)
- [ ] Seed database from mock data / real battles
- [ ] Promoted spot booking with points
- [ ] Affiliate / referral system
- [ ] Payment step on submit

---

## License

Private project.
