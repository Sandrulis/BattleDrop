# CSRF posture — BattleDrop

BattleDrop uses **Supabase Auth** with **HTTP-only cookies** managed by `@supabase/ssr`. There is no custom CSRF token on API routes.

## Why this is acceptable today

| Control | Detail |
|---------|--------|
| Cookie model | Supabase session cookies are not readable from JavaScript |
| SameSite | Modern browsers default session cookies to `Lax`; cross-site POST form submissions do not include cookies on navigation |
| JSON APIs | Route handlers expect `Content-Type: application/json`; simple cross-site HTML forms cannot send JSON with cookies in most browsers |
| OAuth | Google OAuth uses server-side code exchange in `/auth/callback` |

## Residual risk

- If Supabase or deployment ever sets `SameSite=None` without careful `Secure` + origin controls, cross-site request risk increases.
- State-changing `GET` routes would be CSRF-prone — **avoid GET mutations** (BattleDrop uses POST/PATCH/PUT/DELETE for writes).

## Recommendations

1. Keep all mutations on non-GET methods.
2. When adding cookie-based form POST endpoints, add CSRF tokens or use `SameSite=Strict` where UX allows.
3. Review Supabase cookie options after major `@supabase/ssr` upgrades.
4. Prefer `fetch(..., { credentials: 'same-origin' })` from client components.

## Related docs

- `security-check.md` — full security checklist
- `docs/security/supabase-linter-review.md` — database function review cadence
