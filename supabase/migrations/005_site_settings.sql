-- BattleDrop: singleton site settings (name, slogan, date/time display)

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'BattleDrop',
  site_slogan text not null default 'Vote on this week''s best products',
  date_format text not null default 'ymd'
    check (date_format in ('ymd', 'dmy', 'mdy')),
  time_format text not null default '24h'
    check (time_format in ('24h', '12h')),
  date_separator text not null default '.'
    check (date_separator in ('.', '/', '-', ' ')),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "site_settings_select_public"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

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

drop trigger if exists site_settings_set_updated_at on public.site_settings;

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_site_settings_updated_at();
