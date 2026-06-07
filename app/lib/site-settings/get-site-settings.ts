import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
  type SiteSettingsRow,
} from "@/app/lib/site-settings-types";

function mapSiteSettingsRow(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.site_name,
    siteSlogan: row.site_slogan,
    dateFormat: row.date_format,
    timeFormat: row.time_format,
    dateSeparator: row.date_separator,
    defaultCurrency: row.default_currency,
    battleSubmitPrice: Number(row.battle_submit_price),
    battleStartHoursFromWeekStart: row.battle_start_hours_from_week_start,
  };
}

async function fetchSiteSettingsFromDb(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "site_name, site_slogan, date_format, time_format, date_separator, default_currency, battle_submit_price, battle_start_hours_from_week_start",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SITE_SETTINGS;
  }

  return mapSiteSettingsRow(data as SiteSettingsRow);
}

const getCachedSiteSettings = unstable_cache(
  fetchSiteSettingsFromDb,
  ["site-settings"],
  { tags: ["site-settings"] },
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return getCachedSiteSettings();
});

export function getSiteMonogram(siteName: string) {
  const words = siteName.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
  }

  return siteName.trim().slice(0, 2).toUpperCase() || "BD";
}
