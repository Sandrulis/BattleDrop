-- BattleDrop: threaded comments on published projects

create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  parent_id uuid references public.project_comments (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint project_comments_body_length_check check (
    char_length(body) >= 1 and char_length(body) <= 2000
  )
);

create index if not exists project_comments_project_id_idx
  on public.project_comments (project_id);

create index if not exists project_comments_parent_id_idx
  on public.project_comments (parent_id);

create index if not exists project_comments_created_at_idx
  on public.project_comments (project_id, created_at asc);

alter table public.project_comments enable row level security;

create policy "project_comments_select_published"
  on public.project_comments
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects as projects
      where projects.id = project_id
        and projects.status = 'published'
        and projects.deleted_at is null
    )
  );

create policy "project_comments_insert_authenticated"
  on public.project_comments
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects as projects
      where projects.id = project_id
        and projects.status = 'published'
        and projects.deleted_at is null
    )
    and (
      parent_id is null
      or exists (
        select 1
        from public.project_comments as parent_comment
        where parent_comment.id = parent_id
          and parent_comment.project_id = project_id
      )
    )
  );
