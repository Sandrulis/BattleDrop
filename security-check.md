# BattleDrop — Security Check

Living document for manual and automated security reviews. Re-run this checklist after major auth, API, or database changes.

**Last deep review:** 2026-06-07  
**Scope:** `app/` + CI + Supabase migrations + GitHub repo state  
**Verified locally:** `npm audit` (0 vulns), `npm run test:security` (4/4 pass), `npm run build` pass

---

## Current security score: **8 / 10**

*(Ja drošības izmaiņas vēl nav **commit/push** uz GitHub un **deploy** Vercel — praktiskais līmenis šobrīd ir **~7/10**, jo CI workflow un SSRF fixi nav produkcijā.)*

| Score | Meaning |
|-------|---------|
| 1–3 | Critical gaps; do not expose publicly |
| 4–5 | Major issues remain |
| 6–7 | Reasonable MVP baseline |
| **8–9** | **Strong controls for current scope; monitor rate limits & dependency advisories** |
| 10 | Defense-in-depth, penetration tested, full observability |

**Remaining gaps (why not 10/10)**

| # | Gap | Severity |
|---|-----|----------|
| 1 | Rate limits ir **in-memory** (Vercel serverless — nav globāli starp instancēm) | Medium |
| 2 | CSP atļauj `'unsafe-inline'` / `'unsafe-eval'` (Next.js kompromiss) | Medium |
| 3 | Nav `Strict-Transport-Security` headera | Low |
| 4 | Admin audit log ir tikai DB — **nav admin UI** apskatei | Low |
| 5 | GitHub **secret scanning push protection** — jāieslēdz manuāli | Low |
| 6 | Supabase **Database Linter** — jāapstiprina manuāli pēc 008/009 | Low |
| 7 | Drošības kods **nav vēl push** uz GitHub (lokāli uncommitted) | **High** |
| 8 | `favicon` URL projektu saglabāšanā nav SSRF validācijas | Low |
| 9 | Security testi aptver tikai redirect + IP — nav DNS/SSRF integration testu | Low |

---

## Remaining work (priority backlog)

### Must do (High)

| # | Task | Action |
|---|------|--------|
| H1 | Publicēt drošības izmaiņas | `git commit` + `git push` — CI workflow, `app/lib/security/*`, migrācija 009, `next.config.ts` |
| H2 | Deploy uz Vercel | Pēc push — pārliecināties, ka jaunā versija ir live |
| H3 | Migrācija 009 produkcijā | Ja vēl nav: `npm run db:migrate` vai SQL Editor; verificēt ar `admin_audit_log` + `sync_admin_todo_board` |

### Should do (Medium)

| # | Task | Action |
|---|------|--------|
| M1 | Globāls rate limiting | Vercel Firewall, Cloudflare, vai Upstash Redis — ne tikai in-memory |
| M2 | Stingrāks CSP | Nonce/hash-based CSP kad migrē no `'unsafe-inline'` |
| M3 | Supabase Linter | Dashboard → Database → Linter → Refresh; novērst atlikušos brīdinājumus |

### Nice to have (Low)

| # | Task | Action |
|---|------|--------|
| L1 | GitHub secret scanning push protection | Repo Settings → Code security |
| L2 | Admin audit log UI | `/admin-panel/audit` — lasīt `admin_audit_log` |
| L3 | `Strict-Transport-Security` | Pievienot `next.config.ts` (tikai production) |
| L4 | Favicon URL validācija | `assertSafeExternalHttpUrl` pie project POST/PATCH |
| L5 | Paplašināt testus | SSRF ar mock DNS; E2E admin/API smoke |
| L6 | Penetration test | Pirms liela trafika — ārējs audit |

---

## Automated checks (GitHub Actions)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Security audit** (`.github/workflows/security-audit.yml`) | `push`, PR | `npm audit --audit-level=moderate` (PostCSS override in `package.json`) |
| **Security smoke** (`.github/workflows/security-smoke.yml`) | `push`, PR | `npm run test:security`, `npm run lint`, `npm run build` |
| **Secret scan** (`.github/workflows/secret-scan.yml`) | `push`, PR | gitleaks |
| **Dependabot** (`.github/dependabot.yml`) | weekly | npm + GitHub Actions updates |

Run locally before push:

```bash
npm audit --audit-level=moderate
npm run test:security
npm run build
npm run db:check-migrations
```

---

## Manual review checklist

- [x] User-controlled URLs validated before server fetch (`app/lib/security/safe-url.ts`)
- [x] OAuth return paths sanitized (`app/lib/security/safe-redirect-path.ts`)
- [x] Public APIs rate-limited (`app/lib/security/rate-limit.ts`)
- [x] Security headers in `next.config.ts`
- [x] `/api/projects/check-url` requires sign-in
- [x] Input max lengths enforced in API + DB (`009_security_hardening.sql`)
- [x] Admin todo board sync is atomic (`sync_admin_todo_board` RPC)
- [x] Admin audit log for settings, roles, todos
- [x] Security unit tests (`app/lib/security/security.test.ts`)
- [x] Production Supabase has migrations **001–009** applied (2026-06-07 — apstiprināts lietotājs; verificēt ar SQL)
- [ ] Drošības izmaiņas **push** uz GitHub + Vercel deploy
- [ ] Supabase Dashboard → Database → Linter clean (see `docs/security/supabase-linter-review.md`)
- [ ] GitHub repo: enable secret scanning **push protection**

---

## API auth matrix

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/project-preview` | Public | SSRF guard + rate limit (10/min/IP) |
| `GET /api/project-screenshot` | Public | SSRF guard + rate limit (30/min/IP) |
| `GET /api/projects/check-url` | **Signed-in** | Rate limit (20/min/IP) |
| `GET /api/site-settings` | Public | Read-only |
| `POST /api/projects` | Signed-in | Input length limits |
| `PATCH/DELETE /api/projects/[id]` | Signed-in | Scoped by `user_id` |
| `GET/PATCH /api/user-settings` | Signed-in | Own prefs only |
| `PATCH /api/site-settings` | Admin | Audit logged |
| `PATCH /api/users/[id]/admin` | Admin | Audit logged; blocks self-demotion |
| `POST /api/admin-todos` | Admin | Audit logged |
| `PUT /api/admin-todos/board` | Admin | Atomic RPC + audit |
| `PATCH/DELETE /api/admin-todos/[id]` | Admin | Audit logged |

---

## Database & Supabase

| Item | Status |
|------|--------|
| RLS on core tables | OK |
| Migrations `001`–`009` | **Applied** (2026-06-07) |
| `008_security_function_hardening.sql` | Applied |
| `009_security_hardening.sql` | Applied — audit log, length checks, `sync_admin_todo_board` |
| Admin audit table | `public.admin_audit_log` (admin read via RLS) |

Verify migrations:

```bash
npm run db:check-migrations
npm run db:migrate   # local / CI with DATABASE_URL or SUPABASE_DB_PASSWORD
```

---

## Security modules

| Module | Role |
|--------|------|
| `app/lib/security/safe-url.ts` | SSRF protection + DNS resolve checks |
| `app/lib/security/safe-redirect-path.ts` | OAuth `next` sanitization |
| `app/lib/security/rate-limit.ts` | Per-IP sliding window |
| `app/lib/security/enforce-rate-limit.ts` | API route helper → 429 |
| `app/lib/security/input-limits.ts` | Max field lengths |
| `app/lib/security/log-admin-action.ts` | Admin audit log writes |
| `app/lib/security/security.test.ts` | Redirect + IP block tests |

---

## Related docs

- `docs/security/csrf-posture.md` — cookie/session CSRF assumptions
- `docs/security/supabase-linter-review.md` — DB linter cadence

---

## Completed backlog (2026-06-07)

### HIGH ✓

1. SSRF guards on preview/screenshot/meta fetch  
2. Safe redirect helper on OAuth callback + sign-in  
3. Migration checklist script (`npm run db:check-migrations`)  
4. Rate limits on public fetch/check routes  

### MEDIUM ✓

5. Security headers (`next.config.ts`)  
6. `check-url` requires authentication; guests rely on save-time duplicate check  
7. Input limits (API + migration 009)  
8. PostCSS override + CI `--audit-level=moderate`  
9. Atomic `sync_admin_todo_board` RPC  
10. Security unit tests in CI  

### LOW ✓

11. Dependabot config  
12. CSRF posture doc  
13. Admin audit log table + server logging  
14. gitleaks workflow  
15. Supabase linter review doc  

---

## How to update this document

1. Update **Last full review** date.
2. Re-score **Current security score** (1–10).
3. Add new findings to a **Priority backlog** section if regressions appear.
4. Keep the API matrix and checklist in sync with code.
