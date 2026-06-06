# Supabase linter review cadence

Run this after every migration that adds or changes SQL functions, RLS policies, or `SECURITY DEFINER` helpers.

## Where to check

Supabase Dashboard → **Database** → **Linter**

## Review checklist

- [ ] No **Function Search Path Mutable** warnings (every function uses `set search_path = public` or stricter)
- [ ] No **Public Can Execute SECURITY DEFINER Function** warnings
- [ ] No **Signed-In Users Can Execute SECURITY DEFINER Function** warnings unless intentionally documented
- [ ] New tables have RLS enabled before production data
- [ ] Admin-only tables/policies use inline `is_admin` subquery or service-role-only RPC

## BattleDrop migrations to re-verify

| Migration | Focus |
|-----------|--------|
| `001_create_users.sql` | Auth sync triggers, `protect_is_admin` |
| `004_users_last_seen.sql` | `touch_user_last_seen` execute grants |
| `008_security_function_hardening.sql` | Function hardening baseline |
| `009_security_hardening.sql` | `sync_admin_todo_board`, audit log RLS |

## When issues appear

1. Fix forward in a new numbered migration (do not edit old files in prod).
2. Re-run `npm run db:migrate` locally, then apply in Supabase SQL Editor for production.
3. Update `security-check.md` score/backlog if new exceptions are accepted.

## Schedule

- **Every migration PR** — run linter before merge
- **Monthly** — quick pass even without schema changes
- **After Supabase major upgrades** — full linter + auth smoke test
