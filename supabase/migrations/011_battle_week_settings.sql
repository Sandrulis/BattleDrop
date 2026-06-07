-- BattleDrop: per-week battle overrides (admin panel)

create table if not exists public.battle_week_settings (
  year integer not null,
  iso_week integer not null check (iso_week >= 1 and iso_week <= 53),
  is_enabled boolean not null default true,
  min_projects_enabled boolean not null default false,
  min_projects integer
    check (min_projects is null or min_projects >= 1),
  submit_price numeric(10, 2)
    check (submit_price is null or submit_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (year, iso_week)
);

alter table public.battle_week_settings enable row level security;

create policy "battle_week_settings_admin_all"
  on public.battle_week_settings
  for all
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  )
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create or replace function public.set_battle_week_settings_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists battle_week_settings_set_updated_at on public.battle_week_settings;

create trigger battle_week_settings_set_updated_at
  before update on public.battle_week_settings
  for each row
  execute function public.set_battle_week_settings_updated_at();
