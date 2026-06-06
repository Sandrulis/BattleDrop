-- BattleDrop: track when users were last active
-- Run in Supabase Dashboard → SQL Editor

alter table public.users
  add column if not exists last_seen timestamptz;

create index if not exists users_last_seen_idx
  on public.users (last_seen desc nulls last);

create or replace function public.touch_user_last_seen(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set
    last_seen = now(),
    updated_at = now()
  where id = p_user_id
    and (
      last_seen is null
      or last_seen < now() - interval '5 minutes'
    );
end;
$$;

revoke all on function public.touch_user_last_seen(uuid) from public;
revoke all on function public.touch_user_last_seen(uuid) from anon, authenticated;
grant execute on function public.touch_user_last_seen(uuid) to service_role;
