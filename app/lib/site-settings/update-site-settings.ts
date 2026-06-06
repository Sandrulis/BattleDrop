import { createAdminClient } from "@/app/lib/supabase/admin";
import {
  DEFAULT_SITE_SETTINGS,
  type DateFormatOrder,
  type DateSeparator,
  type SiteSettings,
  type TimeFormat,
} from "@/app/lib/site-settings-types";

type UpdateSiteSettingsInput = Partial<SiteSettings>;

function isDateFormat(value: unknown): value is DateFormatOrder {
  return value === "ymd" || value === "dmy" || value === "mdy";
}

function isTimeFormat(value: unknown): value is TimeFormat {
  return value === "24h" || value === "12h";
}

function isDateSeparator(value: unknown): value is DateSeparator {
  return value === "." || value === "/" || value === "-" || value === " ";
}

export function normalizeSiteSettings(input: UpdateSiteSettingsInput): SiteSettings {
  return {
    siteName:
      typeof input.siteName === "string" && input.siteName.trim()
        ? input.siteName.trim()
        : DEFAULT_SITE_SETTINGS.siteName,
    siteSlogan:
      typeof input.siteSlogan === "string"
        ? input.siteSlogan.trim()
        : DEFAULT_SITE_SETTINGS.siteSlogan,
    dateFormat: isDateFormat(input.dateFormat)
      ? input.dateFormat
      : DEFAULT_SITE_SETTINGS.dateFormat,
    timeFormat: isTimeFormat(input.timeFormat)
      ? input.timeFormat
      : DEFAULT_SITE_SETTINGS.timeFormat,
    dateSeparator: isDateSeparator(input.dateSeparator)
      ? input.dateSeparator
      : DEFAULT_SITE_SETTINGS.dateSeparator,
  };
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
  const settings = normalizeSiteSettings(input);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("site_settings")
    .update({
      site_name: settings.siteName,
      site_slogan: settings.siteSlogan,
      date_format: settings.dateFormat,
      time_format: settings.timeFormat,
      date_separator: settings.dateSeparator,
    })
    .eq("id", 1)
    .select("site_name, site_slogan, date_format, time_format, date_separator")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    siteName: data.site_name,
    siteSlogan: data.site_slogan,
    dateFormat: data.date_format as DateFormatOrder,
    timeFormat: data.time_format as TimeFormat,
    dateSeparator: data.date_separator as DateSeparator,
  } satisfies SiteSettings;
}
