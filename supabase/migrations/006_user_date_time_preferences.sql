-- BattleDrop: per-user date & time display preferences (nullable = use site defaults)
-- Run in Supabase Dashboard → SQL Editor

alter table public.users
  add column if not exists date_format text
    check (date_format is null or date_format in ('ymd', 'dmy', 'mdy')),
  add column if not exists time_format text
    check (time_format is null or time_format in ('24h', '12h')),
  add column if not exists date_separator text
    check (date_separator is null or date_separator in ('.', '/', '-', ' '));

create policy "users_update_own_display_prefs"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
