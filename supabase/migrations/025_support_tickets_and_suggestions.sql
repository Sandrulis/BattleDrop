-- BattleDrop: user support tickets and feature suggestions

create type public.support_ticket_status as enum ('open', 'in_progress', 'closed');

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  subject text not null,
  message text not null,
  status public.support_ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_subject_length_check check (
    char_length(subject) >= 1 and char_length(subject) <= 200
  ),
  constraint support_tickets_message_length_check check (
    char_length(message) >= 1 and char_length(message) <= 5000
  )
);

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id, created_at desc);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);

create type public.user_suggestion_status as enum ('new', 'reviewed', 'accepted', 'declined');

create table if not exists public.user_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text not null,
  status public.user_suggestion_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_suggestions_title_length_check check (
    char_length(title) >= 1 and char_length(title) <= 200
  ),
  constraint user_suggestions_description_length_check check (
    char_length(description) >= 1 and char_length(description) <= 5000
  )
);

create index if not exists user_suggestions_user_id_idx
  on public.user_suggestions (user_id, created_at desc);

create index if not exists user_suggestions_status_idx
  on public.user_suggestions (status, created_at desc);

alter table public.support_tickets enable row level security;
alter table public.user_suggestions enable row level security;

create policy "support_tickets_select_own"
  on public.support_tickets
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "support_tickets_select_admin"
  on public.support_tickets
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "support_tickets_insert_own"
  on public.support_tickets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "support_tickets_update_admin"
  on public.support_tickets
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

create policy "user_suggestions_select_own"
  on public.user_suggestions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_suggestions_select_admin"
  on public.user_suggestions
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "user_suggestions_insert_own"
  on public.user_suggestions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_suggestions_update_admin"
  on public.user_suggestions
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

grant select, insert on table public.support_tickets to authenticated;
grant select, insert on table public.user_suggestions to authenticated;

create or replace function public.set_support_tickets_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists support_tickets_set_updated_at on public.support_tickets;

create trigger support_tickets_set_updated_at
  before update on public.support_tickets
  for each row
  execute function public.set_support_tickets_updated_at();

create or replace function public.set_user_suggestions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_suggestions_set_updated_at on public.user_suggestions;

create trigger user_suggestions_set_updated_at
  before update on public.user_suggestions
  for each row
  execute function public.set_user_suggestions_updated_at();
