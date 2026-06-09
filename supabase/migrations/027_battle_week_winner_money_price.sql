-- BattleDrop: per-week winner cash prize (0 = no prize, hidden in UI)

alter table public.battle_week_settings
  add column if not exists winner_money_price numeric(10, 2) not null default 0
    check (winner_money_price >= 0);
