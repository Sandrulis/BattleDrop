import { createAdminClient } from "@/app/lib/supabase/admin";
import { assertMaxLength } from "@/app/lib/security/input-limits";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import {
  DEFAULT_SITE_SETTINGS,
  isCurrencyCode,
  type CurrencyCode,
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

function parseNonNegativeNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseBattleStartHours(value: unknown): number | null {
  const parsed = parseNonNegativeNumber(value);
  if (parsed === null) {
    return null;
  }

  const hours = Math.round(parsed);
  if (hours > 168) {
    return null;
  }

  return hours;
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
    defaultCurrency: isCurrencyCode(input.defaultCurrency)
      ? input.defaultCurrency
      : DEFAULT_SITE_SETTINGS.defaultCurrency,
    battleSubmitPrice:
      parseNonNegativeNumber(input.battleSubmitPrice) ??
      DEFAULT_SITE_SETTINGS.battleSubmitPrice,
    battleStartHoursFromWeekStart:
      parseBattleStartHours(input.battleStartHoursFromWeekStart) ??
      DEFAULT_SITE_SETTINGS.battleStartHoursFromWeekStart,
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
      default_currency: settings.defaultCurrency,
      battle_submit_price: settings.battleSubmitPrice,
      battle_start_hours_from_week_start: settings.battleStartHoursFromWeekStart,
    })
    .eq("id", 1)
    .select(
      "site_name, site_slogan, date_format, time_format, date_separator, default_currency, battle_submit_price, battle_start_hours_from_week_start",
    )
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
      defaultCurrency: settings.defaultCurrency,
      battleSubmitPrice: settings.battleSubmitPrice,
      battleStartHoursFromWeekStart: settings.battleStartHoursFromWeekStart,
    },
  });

  return {
    siteName: data.site_name,
    siteSlogan: data.site_slogan,
    dateFormat: data.date_format as DateFormatOrder,
    timeFormat: data.time_format as TimeFormat,
    dateSeparator: data.date_separator as DateSeparator,
    defaultCurrency: data.default_currency as CurrencyCode,
    battleSubmitPrice: Number(data.battle_submit_price),
    battleStartHoursFromWeekStart: data.battle_start_hours_from_week_start,
  } satisfies SiteSettings;
}
