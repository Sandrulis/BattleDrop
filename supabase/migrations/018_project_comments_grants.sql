-- BattleDrop: grants + own-row read for project_comments (PostgREST INSERT RETURNING)

grant select on table public.project_comments to anon, authenticated;
grant insert on table public.project_comments to authenticated;

drop policy if exists "project_comments_select_own" on public.project_comments;

create policy "project_comments_select_own"
  on public.project_comments
  for select
  to authenticated
  using (auth.uid() = user_id);
