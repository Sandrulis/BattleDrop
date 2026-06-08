-- BattleDrop: site-wide polls (admin-managed, shown when integration_poll is enabled)

create table if not exists public.site_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_polls_question_length_check check (
    char_length(question) >= 1 and char_length(question) <= 500
  )
);

create index if not exists site_polls_enabled_idx
  on public.site_polls (enabled);

create table if not exists public.site_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.site_polls (id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  constraint site_poll_options_label_length_check check (
    char_length(label) >= 1 and char_length(label) <= 200
  )
);

create index if not exists site_poll_options_poll_id_idx
  on public.site_poll_options (poll_id, sort_order asc);

create table if not exists public.site_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.site_polls (id) on delete cascade,
  option_id uuid not null references public.site_poll_options (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create index if not exists site_poll_votes_poll_id_idx
  on public.site_poll_votes (poll_id);

create index if not exists site_poll_votes_option_id_idx
  on public.site_poll_votes (option_id);

alter table public.site_polls enable row level security;
alter table public.site_poll_options enable row level security;
alter table public.site_poll_votes enable row level security;

create policy "site_polls_select_enabled"
  on public.site_polls
  for select
  to anon, authenticated
  using (enabled = true);

create policy "site_polls_select_admin"
  on public.site_polls
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_polls_insert_admin"
  on public.site_polls
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_polls_update_admin"
  on public.site_polls
  for update
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

create policy "site_polls_delete_admin"
  on public.site_polls
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_poll_options_select_enabled_poll"
  on public.site_poll_options
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.site_polls as polls
      where polls.id = poll_id
        and polls.enabled = true
    )
  );

create policy "site_poll_options_select_admin"
  on public.site_poll_options
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_poll_options_insert_admin"
  on public.site_poll_options
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_poll_options_delete_admin"
  on public.site_poll_options
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_poll_votes_select_enabled_poll"
  on public.site_poll_votes
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.site_polls as polls
      where polls.id = poll_id
        and polls.enabled = true
    )
  );

create policy "site_poll_votes_insert_authenticated"
  on public.site_poll_votes
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.site_polls as polls
      where polls.id = poll_id
        and polls.enabled = true
    )
    and exists (
      select 1
      from public.site_poll_options as options
      where options.id = option_id
        and options.poll_id = poll_id
    )
  );

grant select on table public.site_polls to anon, authenticated;
grant select on table public.site_poll_options to anon, authenticated;
grant select on table public.site_poll_votes to anon, authenticated;
grant insert on table public.site_poll_votes to authenticated;

create or replace function public.set_site_polls_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_polls_set_updated_at on public.site_polls;

create trigger site_polls_set_updated_at
  before update on public.site_polls
  for each row
  execute function public.set_site_polls_updated_at();
