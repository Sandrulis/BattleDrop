-- BattleDrop: promoted leaderboard slots + public read for published projects

create table if not exists public.promoted_slots (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  iso_week integer not null check (iso_week between 1 and 53),
  spot integer not null check (spot between 1 and 3),
  insert_after_organic integer not null check (insert_after_organic in (0, 5, 10)),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  price_points integer not null check (price_points >= 0),
  created_at timestamptz not null default now(),
  unique (year, iso_week, spot),
  unique (year, iso_week, project_id)
);

create index if not exists promoted_slots_week_idx
  on public.promoted_slots (year, iso_week);

alter table public.promoted_slots enable row level security;

create policy "promoted_slots_select_public"
  on public.promoted_slots
  for select
  to anon, authenticated
  using (true);

create policy "promoted_slots_insert_own"
  on public.promoted_slots
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "projects_select_published"
  on public.projects
  for select
  to anon, authenticated
  using (status = 'published' and deleted_at is null);
