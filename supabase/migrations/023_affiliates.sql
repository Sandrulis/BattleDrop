-- BattleDrop: affiliate codes, email invites, and referral tracking

alter table public.users
  add column if not exists affiliate_code text,
  add column if not exists referred_by_user_id uuid references public.users (id) on delete set null;

create unique index if not exists users_affiliate_code_unique
  on public.users (affiliate_code)
  where affiliate_code is not null;

create index if not exists users_referred_by_user_id_idx
  on public.users (referred_by_user_id)
  where referred_by_user_id is not null;

create table if not exists public.affiliate_invites (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users (id) on delete cascade,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'joined')),
  referred_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint affiliate_invites_referrer_email_unique unique (referrer_user_id, email),
  constraint affiliate_invites_email_format check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create index if not exists affiliate_invites_referrer_user_id_idx
  on public.affiliate_invites (referrer_user_id, created_at desc);

alter table public.affiliate_invites enable row level security;

create policy "affiliate_invites_select_own"
  on public.affiliate_invites
  for select
  to authenticated
  using (referrer_user_id = auth.uid());

create or replace function public.protect_user_affiliate_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.affiliate_code is distinct from new.affiliate_code then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'affiliate_code cannot be changed via client';
    end if;
  end if;

  if old.referred_by_user_id is distinct from new.referred_by_user_id then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'referred_by_user_id cannot be changed via client';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_users_affiliate_fields on public.users;

create trigger protect_users_affiliate_fields
  before update on public.users
  for each row
  execute function public.protect_user_affiliate_fields();

revoke all on function public.protect_user_affiliate_fields() from public;
revoke all on function public.protect_user_affiliate_fields() from anon, authenticated;
