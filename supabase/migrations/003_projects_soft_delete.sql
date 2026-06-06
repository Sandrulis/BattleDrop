-- BattleDrop: soft-delete for user projects
-- Run in Supabase Dashboard → SQL Editor

alter table public.projects
  add column if not exists deleted_at timestamptz;

create index if not exists projects_user_deleted_idx
  on public.projects (user_id, deleted_at);

create index if not exists projects_user_url_lookup_idx
  on public.projects (user_id, url);
