-- BattleDrop: one upvote per user per suggestion (not on own suggestions — enforced in API)

create table if not exists public.user_suggestion_upvotes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.user_suggestions (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (suggestion_id, user_id)
);

create index if not exists user_suggestion_upvotes_suggestion_id_idx
  on public.user_suggestion_upvotes (suggestion_id);

alter table public.user_suggestion_upvotes enable row level security;

create policy "user_suggestion_upvotes_select_authenticated"
  on public.user_suggestion_upvotes
  for select
  to authenticated
  using (true);

grant select on table public.user_suggestion_upvotes to authenticated;
grant insert on table public.user_suggestion_upvotes to authenticated;
