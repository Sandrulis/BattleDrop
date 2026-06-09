-- BattleDrop: editable Cookie rules page content and consent popup on site_settings singleton

alter table public.site_settings
  add column if not exists cookie_content text;

comment on column public.site_settings.cookie_content is
  'BBCode content for /cookie and the first-visit cookie popup; null or blank hides footer links and popup.';
