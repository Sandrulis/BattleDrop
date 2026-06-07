-- BattleDrop: site-wide default display currency

alter table public.site_settings
  add column if not exists default_currency text not null default 'EUR'
    check (default_currency in ('EUR', 'USD', 'GBP'));
