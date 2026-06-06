-- BattleDrop: harden database functions flagged by Supabase linter

-- admin_todos: drop SECURITY DEFINER helper and use inline admin check in RLS
drop policy if exists "admin_todos_select_admin" on public.admin_todos;
drop policy if exists "admin_todos_insert_admin" on public.admin_todos;
drop policy if exists "admin_todos_update_admin" on public.admin_todos;
drop policy if exists "admin_todos_delete_admin" on public.admin_todos;

create policy "admin_todos_select_admin"
  on public.admin_todos
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "admin_todos_insert_admin"
  on public.admin_todos
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "admin_todos_update_admin"
  on public.admin_todos
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

create policy "admin_todos_delete_admin"
  on public.admin_todos
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

drop function if exists public.is_app_admin();

-- Trigger helpers: pin search_path
create or replace function public.set_admin_todos_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- SECURITY DEFINER helpers: revoke public execute, keep only required roles
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

revoke all on function public.handle_user_updated() from public;
revoke all on function public.handle_user_updated() from anon, authenticated;

revoke all on function public.touch_user_last_seen(uuid) from public;
revoke all on function public.touch_user_last_seen(uuid) from anon, authenticated;
grant execute on function public.touch_user_last_seen(uuid) to service_role;

revoke all on function public.set_admin_todos_updated_at() from public;
revoke all on function public.set_admin_todos_updated_at() from anon, authenticated;

revoke all on function public.set_projects_updated_at() from public;
revoke all on function public.set_projects_updated_at() from anon, authenticated;

revoke all on function public.set_site_settings_updated_at() from public;
revoke all on function public.set_site_settings_updated_at() from anon, authenticated;

revoke all on function public.protect_is_admin() from public;
revoke all on function public.protect_is_admin() from anon, authenticated;
