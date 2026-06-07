-- BattleDrop: explicit battle week on published projects

alter table public.projects
  add column if not exists battle_year integer,
  add column if not exists battle_iso_week integer;

alter table public.projects
  drop constraint if exists projects_battle_iso_week_range_chk;

alter table public.projects
  add constraint projects_battle_iso_week_range_chk
  check (battle_iso_week is null or battle_iso_week between 1 and 53);

create index if not exists projects_battle_week_idx
  on public.projects (battle_year, battle_iso_week)
  where status = 'published' and deleted_at is null;

update public.projects
set
  battle_year = extract(isoyear from created_at)::integer,
  battle_iso_week = extract(week from created_at)::integer
where status = 'published'
  and deleted_at is null
  and battle_year is null;
