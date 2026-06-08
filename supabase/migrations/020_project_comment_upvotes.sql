-- BattleDrop: one upvote per user per comment (not on own comments — enforced in API)

create table if not exists public.project_comment_upvotes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.project_comments (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists project_comment_upvotes_comment_id_idx
  on public.project_comment_upvotes (comment_id);

alter table public.project_comment_upvotes enable row level security;

create policy "project_comment_upvotes_select_published"
  on public.project_comment_upvotes
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.project_comments as comments
      join public.projects as projects on projects.id = comments.project_id
      where comments.id = comment_id
        and projects.status = 'published'
        and projects.deleted_at is null
    )
  );

grant select on table public.project_comment_upvotes to anon, authenticated;
grant insert on table public.project_comment_upvotes to authenticated;
