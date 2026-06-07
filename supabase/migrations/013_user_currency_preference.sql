-- BattleDrop: per-user currency display preference (nullable = use site default)

alter table public.users
  add column if not exists currency text
    check (currency is null or currency in ('EUR', 'USD', 'GBP'));
