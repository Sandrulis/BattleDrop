-- BattleDrop: audit log, input limits, atomic admin todo board sync

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_actor_id_idx
  on public.admin_audit_log (actor_id);

alter table public.admin_audit_log enable row level security;

create policy "admin_audit_log_select_admin"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

alter table public.projects
  drop constraint if exists projects_name_length_check,
  drop constraint if exists projects_tagline_length_check,
  drop constraint if exists projects_description_length_check;

alter table public.projects
  add constraint projects_name_length_check check (char_length(name) <= 120),
  add constraint projects_tagline_length_check check (char_length(tagline) <= 200),
  add constraint projects_description_length_check check (char_length(description) <= 5000);

alter table public.admin_todos
  drop constraint if exists admin_todos_title_length_check,
  drop constraint if exists admin_todos_description_length_check;

alter table public.admin_todos
  add constraint admin_todos_title_length_check check (char_length(title) <= 200),
  add constraint admin_todos_description_length_check check (char_length(description) <= 5000);

create or replace function public.sync_admin_todo_board(
  pending_ids uuid[],
  in_progress_ids uuid[]
)
returns void
language plpgsql
set search_path = public
as $$
declare
  expected_count integer;
  actual_count integer;
begin
  expected_count :=
    coalesce(array_length(pending_ids, 1), 0) +
    coalesce(array_length(in_progress_ids, 1), 0);

  if expected_count > 0 then
    select count(*) into actual_count
    from public.admin_todos
    where id = any(pending_ids || in_progress_ids);

    if actual_count <> expected_count then
      raise exception 'One or more tasks no longer exist.';
    end if;
  end if;

  update public.admin_todos as todos
  set
    board_column = ordered.board_column,
    sort_order = ordered.sort_order,
    updated_at = now()
  from (
    select
      ids.id,
      ids.board_column,
      (row_number() over (
        partition by ids.board_column
        order by ids.ord
      ) - 1)::integer as sort_order
    from (
      select
        pending.id,
        'pending'::public.admin_todo_column as board_column,
        pending.ord
      from unnest(coalesce(pending_ids, array[]::uuid[])) with ordinality as pending(id, ord)
      union all
      select
        progress.id,
        'in_progress'::public.admin_todo_column as board_column,
        progress.ord
      from unnest(coalesce(in_progress_ids, array[]::uuid[])) with ordinality as progress(id, ord)
    ) as ids
  ) as ordered
  where todos.id = ordered.id;
end;
$$;

revoke all on function public.sync_admin_todo_board(uuid[], uuid[]) from public;
revoke all on function public.sync_admin_todo_board(uuid[], uuid[]) from anon, authenticated;
grant execute on function public.sync_admin_todo_board(uuid[], uuid[]) to service_role;
