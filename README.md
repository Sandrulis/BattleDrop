# BattleDrop

Weekly product battles for early-stage founders. Community votes, promoted leaderboard spots, and a Product Hunt–style feed — built as a Next.js frontend MVP with Supabase scaffolding.

**Repository:** [github.com/Sandrulis/BattleDrop](https://github.com/Sandrulis/BattleDrop)

---

## Features

- **Weekly leaderboard** — products ranked by votes with live demo voting UI
- **Promoted spots** — paid placements inserted at fixed positions (before #1, after #5, after #10) with badge and styling
- **Monthly championship** — parallel banner with contender voting and countdown
- **Product pages** — detail view with comments, stats sidebar, and maker info
- **Archive** — season calendar grouped by month with historical week cards
- **Responsive UI** — mobile nav, skeleton loaders, branded 404

> **Note:** Auth, persistent votes, comments, and payments are not wired yet. The app currently uses mock data; Supabase tables exist but are empty.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Database (planned) | Supabase (Postgres + Auth) |
| Fonts | Geist Sans / Geist Mono |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
git clone https://github.com/Sandrulis/BattleDrop.git
cd BattleDrop
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) locally.  
Production: [https://battle-drop.vercel.app](https://battle-drop.vercel.app)

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only service role key |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` locally · `https://battle-drop.vercel.app` on Vercel |

Get keys from **Supabase Dashboard → Project Settings → API**.

Test the connection:

```bash
node scripts/test-supabase.mjs
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — monthly banner, weekly battle, leaderboard, sidebar |
| `/products/[id]` | Product detail — about, comments, stats |
| `/archive` | Season archive with year switcher |

---

## Project Structure

```
app/
├── components/       # UI components (feed, hero, sidebar, archive, etc.)
├── lib/              # Data, types, leaderboard logic, countdown
├── products/[id]/    # Product detail page
├── archive/          # Archive page
├── page.tsx          # Home
└── layout.tsx        # Root layout

scripts/
└── test-supabase.mjs # Supabase connectivity check
```

### Key files

- `app/lib/mock-data.ts` — demo products, battles, promoted slots
- `app/lib/build-leaderboard.ts` — merges organic ranking with promoted insertions
- `app/lib/types.ts` — shared TypeScript types
- `.env.example` — environment variable template

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
2. Enable **Google** auth provider (Authentication → Providers)
3. Add redirect URLs in **Authentication → URL Configuration**:
   - Site URL (prod): `https://battle-drop.vercel.app`
   - Redirect URLs: `http://localhost:3000/**` and `https://battle-drop.vercel.app/**`
4. Run migrations (schema tables: `products`, `battles`, `profiles`, `votes`, `comments`, `promoted_slots`)
5. Fill `.env.local` and run `node scripts/test-supabase.mjs`

---

## Deployment

Deploy to [Vercel](https://vercel.com) by importing the GitHub repo.

**Live app:** [https://battle-drop.vercel.app](https://battle-drop.vercel.app)

Add the same Supabase environment variables in Vercel project settings. Override the site URL for production:

```
NEXT_PUBLIC_SITE_URL=https://battle-drop.vercel.app
```

Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in your local `.env.local` only.

---

## Versioning & Commits

Version follows `package.json` (`semver`). Every commit message ends with the version tag:

```
Short description of the change. v0.1.1
```

Bump the version in `package.json` when the change is user-facing or notable.

---

## Roadmap

- [ ] Supabase client + middleware (auth session)
- [ ] Google sign-in
- [ ] Persistent votes and comments
- [ ] Seed database from mock data
- [ ] Product submission flow
- [ ] Promoted spot booking with points
- [ ] Affiliate / referral system

---

## License

Private project.
