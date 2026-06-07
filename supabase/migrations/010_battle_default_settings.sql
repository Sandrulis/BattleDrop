-- BattleDrop: default battle settings on site_settings singleton

alter table public.site_settings
  add column if not exists battle_submit_price numeric(10, 2) not null default 5
    check (battle_submit_price >= 0),
  add column if not exists battle_start_hours_from_week_start integer not null default 96
    check (
      battle_start_hours_from_week_start >= 0
      and battle_start_hours_from_week_start <= 168
    );
