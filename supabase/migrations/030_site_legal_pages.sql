-- BattleDrop: editable Privacy and Rules page content on site_settings singleton

alter table public.site_settings
  add column if not exists privacy_content text,
  add column if not exists rules_content text;

comment on column public.site_settings.privacy_content is
  'BBCode content for /privacy; null or blank hides footer link and public page.';
comment on column public.site_settings.rules_content is
  'BBCode content for /rules; null or blank hides footer link and public page.';
