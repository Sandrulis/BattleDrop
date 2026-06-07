-- BattleDrop: per-user points balance (purchasable via Stripe later)

alter table public.users
  add column if not exists points integer not null default 0
    check (points >= 0);

create or replace function public.protect_user_points()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.points is distinct from new.points then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'points cannot be changed via client';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_users_points on public.users;

create trigger protect_users_points
  before update on public.users
  for each row
  execute function public.protect_user_points();

create or replace function public.deduct_user_points(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount <= 0 then
    select points into new_balance
    from public.users
    where id = p_user_id;

    return new_balance;
  end if;

  update public.users
  set
    points = points - p_amount,
    updated_at = now()
  where id = p_user_id
    and points >= p_amount
  returning points into new_balance;

  return new_balance;
end;
$$;

create or replace function public.credit_user_points(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount <= 0 then
    select points into new_balance
    from public.users
    where id = p_user_id;

    return new_balance;
  end if;

  update public.users
  set
    points = points + p_amount,
    updated_at = now()
  where id = p_user_id
  returning points into new_balance;

  return new_balance;
end;
$$;

revoke all on function public.protect_user_points() from public;
revoke all on function public.protect_user_points() from anon, authenticated;

revoke all on function public.deduct_user_points(uuid, integer) from public;
revoke all on function public.deduct_user_points(uuid, integer) from anon, authenticated;
grant execute on function public.deduct_user_points(uuid, integer) to service_role;

revoke all on function public.credit_user_points(uuid, integer) from public;
revoke all on function public.credit_user_points(uuid, integer) from anon, authenticated;
grant execute on function public.credit_user_points(uuid, integer) to service_role;
