-- BattleDrop: blog articles (admin-managed, public when published)

create table if not exists public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text not null default '',
  content text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_articles_slug_unique unique (slug),
  constraint blog_articles_title_length_check check (
    char_length(title) >= 1 and char_length(title) <= 200
  ),
  constraint blog_articles_description_length_check check (
    char_length(description) <= 500
  ),
  constraint blog_articles_content_length_check check (
    char_length(content) <= 50000
  ),
  constraint blog_articles_slug_length_check check (
    char_length(slug) >= 1 and char_length(slug) <= 220
  )
);

create index if not exists blog_articles_published_published_at_idx
  on public.blog_articles (published, published_at desc nulls last);

create index if not exists blog_articles_slug_idx
  on public.blog_articles (slug);

alter table public.blog_articles enable row level security;

create policy "blog_articles_select_published"
  on public.blog_articles
  for select
  to anon, authenticated
  using (published = true);

create policy "blog_articles_select_admin"
  on public.blog_articles
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "blog_articles_insert_admin"
  on public.blog_articles
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "blog_articles_update_admin"
  on public.blog_articles
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

create policy "blog_articles_delete_admin"
  on public.blog_articles
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

grant select on table public.blog_articles to anon, authenticated;

create or replace function public.set_blog_articles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_articles_set_updated_at on public.blog_articles;

create trigger blog_articles_set_updated_at
  before update on public.blog_articles
  for each row
  execute function public.set_blog_articles_updated_at();
