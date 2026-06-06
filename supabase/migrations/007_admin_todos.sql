-- BattleDrop: shared admin todo board (drag-and-drop columns)

create type public.admin_todo_column as enum ('pending', 'in_progress');

create table if not exists public.admin_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  board_column public.admin_todo_column not null default 'pending',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_todos_board_column_sort_idx
  on public.admin_todos (board_column, sort_order);

alter table public.admin_todos enable row level security;

create policy "admin_todos_select_admin"
  on public.admin_todos
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "admin_todos_insert_admin"
  on public.admin_todos
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "admin_todos_update_admin"
  on public.admin_todos
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

create policy "admin_todos_delete_admin"
  on public.admin_todos
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create or replace function public.set_admin_todos_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_todos_set_updated_at on public.admin_todos;

create trigger admin_todos_set_updated_at
  before update on public.admin_todos
  for each row
  execute function public.set_admin_todos_updated_at();

insert into public.admin_todos (title, description, board_column, sort_order)
select *
from (
  values
    (
      'Review new submissions'::text,
      'Check pending product links and approve or reject them.'::text,
      'pending'::public.admin_todo_column,
      0
    ),
    (
      'Update battle results'::text,
      'Publish this week''s winners and refresh the leaderboard.'::text,
      'pending'::public.admin_todo_column,
      1
    ),
    (
      'Reply to support messages'::text,
      'Respond to open user reports from the last 48 hours.'::text,
      'pending'::public.admin_todo_column,
      2
    ),
    (
      'Moderate flagged projects'::text,
      'Review projects reported for policy violations.'::text,
      'in_progress'::public.admin_todo_column,
      0
    )
) as seed (title, description, board_column, sort_order)
where not exists (select 1 from public.admin_todos limit 1);
