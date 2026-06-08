-- BattleDrop: promote duration site default + slot expiry

alter table public.site_settings
  add column if not exists promote_duration_hours integer not null default 168
    check (promote_duration_hours >= 1 and promote_duration_hours <= 168);

alter table public.promoted_slots
  add column if not exists expires_at timestamptz;

update public.promoted_slots
set expires_at = created_at + interval '168 hours'
where expires_at is null;

alter table public.promoted_slots
  alter column expires_at set not null;

create index if not exists promoted_slots_active_week_idx
  on public.promoted_slots (year, iso_week, expires_at);
