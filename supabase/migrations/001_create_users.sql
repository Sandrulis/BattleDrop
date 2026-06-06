-- BattleDrop: public.users — app profile linked to auth.users
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

alter table public.users enable row level security;

-- Users can read their own row
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- Auto-create row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Keep profile fields in sync when auth metadata changes
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set
    email = new.email,
    full_name = new.raw_user_meta_data ->> 'full_name',
    avatar_url = new.raw_user_meta_data ->> 'avatar_url',
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
  after update on auth.users
  for each row
  execute function public.handle_user_updated();

-- Prevent anon/authenticated clients from changing is_admin via API
create or replace function public.protect_is_admin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.is_admin is distinct from new.is_admin then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'is_admin cannot be changed via client';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_users_is_admin on public.users;

create trigger protect_users_is_admin
  before update on public.users
  for each row
  execute function public.protect_is_admin();

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

revoke all on function public.handle_user_updated() from public;
revoke all on function public.handle_user_updated() from anon, authenticated;

revoke all on function public.protect_is_admin() from public;
revoke all on function public.protect_is_admin() from anon, authenticated;

-- Backfill existing auth users (safe to re-run)
insert into public.users (id, email, full_name, avatar_url)
select
  id,
  email,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();
