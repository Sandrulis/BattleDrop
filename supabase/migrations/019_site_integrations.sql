-- BattleDrop: admin-managed third-party integrations

create table if not exists public.site_integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  integration_key text not null,
  api_key text,
  description text not null default '',
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_integrations_integration_key_unique unique (integration_key),
  constraint site_integrations_integration_key_format check (
    integration_key ~ '^[a-z][a-z0-9_-]{1,63}$'
  )
);

create index if not exists site_integrations_enabled_idx
  on public.site_integrations (enabled);

alter table public.site_integrations enable row level security;

create policy "site_integrations_select_admin"
  on public.site_integrations
  for select
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_integrations_insert_admin"
  on public.site_integrations
  for insert
  to authenticated
  with check (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "site_integrations_update_admin"
  on public.site_integrations
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

create policy "site_integrations_delete_admin"
  on public.site_integrations
  for delete
  to authenticated
  using (
    coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create or replace function public.set_site_integrations_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_integrations_set_updated_at on public.site_integrations;

create trigger site_integrations_set_updated_at
  before update on public.site_integrations
  for each row
  execute function public.set_site_integrations_updated_at();
