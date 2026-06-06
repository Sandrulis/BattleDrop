import { createAdminClient } from "@/app/lib/supabase/admin";
import { assertMaxLength } from "@/app/lib/security/input-limits";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
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
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const settings = normalizeSiteSettings(input);
  assertMaxLength(settings.siteName, 120, "Site name");
  assertMaxLength(settings.siteSlogan, 200, "Site slogan");

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

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_settings.update",
    entityType: "site_settings",
    entityId: "1",
    metadata: {
      siteName: settings.siteName,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
    },
  });

  return {
    siteName: data.site_name,
    siteSlogan: data.site_slogan,
    dateFormat: data.date_format as DateFormatOrder,
    timeFormat: data.time_format as TimeFormat,
    dateSeparator: data.date_separator as DateSeparator,
  } satisfies SiteSettings;
}
