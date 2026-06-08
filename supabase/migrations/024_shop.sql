-- BattleDrop: shop exchange rates (upvotes / affiliates → points)

alter table public.site_settings
  add column if not exists shop_upvotes_per_point integer not null default 5
    check (shop_upvotes_per_point >= 1 and shop_upvotes_per_point <= 1000),
  add column if not exists shop_affiliates_per_point integer not null default 1
    check (shop_affiliates_per_point >= 1 and shop_affiliates_per_point <= 1000);

alter table public.users
  add column if not exists shop_upvotes_redeemed integer not null default 0
    check (shop_upvotes_redeemed >= 0),
  add column if not exists shop_affiliates_redeemed integer not null default 0
    check (shop_affiliates_redeemed >= 0);

create or replace function public.protect_user_shop_redemption_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.shop_upvotes_redeemed is distinct from new.shop_upvotes_redeemed then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'shop_upvotes_redeemed cannot be changed via client';
    end if;
  end if;

  if old.shop_affiliates_redeemed is distinct from new.shop_affiliates_redeemed then
    if coalesce(auth.role(), '') in ('authenticated', 'anon') then
      raise exception 'shop_affiliates_redeemed cannot be changed via client';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_users_shop_redemption_fields on public.users;

create trigger protect_users_shop_redemption_fields
  before update on public.users
  for each row
  execute function public.protect_user_shop_redemption_fields();

create or replace function public.redeem_shop_upvotes(p_user_id uuid, p_points integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upvotes_per_point integer;
  v_total_upvotes integer;
  v_redeemed integer;
  v_available integer;
  v_cost integer;
  v_new_redeemed integer;
  v_new_balance integer;
begin
  if p_points is null or p_points < 1 then
    raise exception 'points must be at least 1';
  end if;

  select shop_upvotes_per_point
  into v_upvotes_per_point
  from public.site_settings
  where id = 1;

  if v_upvotes_per_point is null then
    v_upvotes_per_point := 5;
  end if;

  v_cost := p_points * v_upvotes_per_point;

  select coalesce(count(pcu.id), 0)::integer
  into v_total_upvotes
  from public.project_comments pc
  join public.project_comment_upvotes pcu on pcu.comment_id = pc.id
  where pc.user_id = p_user_id;

  select shop_upvotes_redeemed
  into v_redeemed
  from public.users
  where id = p_user_id
  for update;

  if not found then
    raise exception 'user not found';
  end if;

  v_available := v_total_upvotes - v_redeemed;

  if v_available < v_cost then
    raise exception 'insufficient upvotes';
  end if;

  v_new_redeemed := v_redeemed + v_cost;

  update public.users
  set
    shop_upvotes_redeemed = v_new_redeemed,
    points = points + p_points,
    updated_at = now()
  where id = p_user_id
  returning points into v_new_balance;

  return jsonb_build_object(
    'pointsBalance', v_new_balance,
    'upvotesRedeemed', v_new_redeemed,
    'availableUpvotes', v_total_upvotes - v_new_redeemed
  );
end;
$$;

create or replace function public.redeem_shop_affiliates(p_user_id uuid, p_points integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_affiliates_per_point integer;
  v_joined_count integer;
  v_redeemed integer;
  v_available integer;
  v_cost integer;
  v_new_redeemed integer;
  v_new_balance integer;
begin
  if p_points is null or p_points < 1 then
    raise exception 'points must be at least 1';
  end if;

  select shop_affiliates_per_point
  into v_affiliates_per_point
  from public.site_settings
  where id = 1;

  if v_affiliates_per_point is null then
    v_affiliates_per_point := 1;
  end if;

  v_cost := p_points * v_affiliates_per_point;

  select count(*)::integer
  into v_joined_count
  from public.users
  where referred_by_user_id = p_user_id;

  select shop_affiliates_redeemed
  into v_redeemed
  from public.users
  where id = p_user_id
  for update;

  if not found then
    raise exception 'user not found';
  end if;

  v_available := v_joined_count - v_redeemed;

  if v_available < v_cost then
    raise exception 'insufficient affiliate referrals';
  end if;

  v_new_redeemed := v_redeemed + v_cost;

  update public.users
  set
    shop_affiliates_redeemed = v_new_redeemed,
    points = points + p_points,
    updated_at = now()
  where id = p_user_id
  returning points into v_new_balance;

  return jsonb_build_object(
    'pointsBalance', v_new_balance,
    'affiliatesRedeemed', v_new_redeemed,
    'availableAffiliates', v_joined_count - v_new_redeemed
  );
end;
$$;

revoke all on function public.protect_user_shop_redemption_fields() from public;
revoke all on function public.protect_user_shop_redemption_fields() from anon, authenticated;

revoke all on function public.redeem_shop_upvotes(uuid, integer) from public;
revoke all on function public.redeem_shop_upvotes(uuid, integer) from anon, authenticated;
grant execute on function public.redeem_shop_upvotes(uuid, integer) to service_role;

revoke all on function public.redeem_shop_affiliates(uuid, integer) from public;
revoke all on function public.redeem_shop_affiliates(uuid, integer) from anon, authenticated;
grant execute on function public.redeem_shop_affiliates(uuid, integer) to service_role;
