import { createClient } from "@/app/lib/supabase/server";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import {
  resolveEffectiveDateTimeSettings,
  type UserDateTimePreferences,
} from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import type {
  DateFormatOrder,
  DateSeparator,
  SiteDateTimeSettings,
  TimeFormat,
} from "@/app/lib/site-settings-types";

type UserDateTimePreferencesRow = {
  date_format: DateFormatOrder | null;
  time_format: TimeFormat | null;
  date_separator: DateSeparator | null;
};

export type UserDateTimePreferencesInput = {
  dateFormat?: DateFormatOrder | null;
  timeFormat?: TimeFormat | null;
  dateSeparator?: DateSeparator | null;
};

function mapUserDateTimePreferencesRow(
  row: UserDateTimePreferencesRow,
): UserDateTimePreferences {
  return {
    dateFormat: row.date_format,
    timeFormat: row.time_format,
    dateSeparator: row.date_separator,
  };
}

function isDateFormat(value: unknown): value is DateFormatOrder {
  return value === "ymd" || value === "dmy" || value === "mdy";
}

function isTimeFormat(value: unknown): value is TimeFormat {
  return value === "24h" || value === "12h";
}

function isDateSeparator(value: unknown): value is DateSeparator {
  return value === "." || value === "/" || value === "-" || value === " ";
}

export function normalizeUserDateTimePreferencesInput(
  input: UserDateTimePreferencesInput,
): UserDateTimePreferences {
  return {
    dateFormat:
      input.dateFormat === null
        ? null
        : isDateFormat(input.dateFormat)
          ? input.dateFormat
          : null,
    timeFormat:
      input.timeFormat === null
        ? null
        : isTimeFormat(input.timeFormat)
          ? input.timeFormat
          : null,
    dateSeparator:
      input.dateSeparator === null
        ? null
        : isDateSeparator(input.dateSeparator)
          ? input.dateSeparator
          : null,
  };
}

export async function getUserDateTimePreferences(
  userId: string,
): Promise<UserDateTimePreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("date_format, time_format, date_separator")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { dateFormat: null, timeFormat: null, dateSeparator: null };
  }

  return mapUserDateTimePreferencesRow(data as UserDateTimePreferencesRow);
}

export async function getEffectiveDateTimeSettingsForUser(
  userId: string | null,
): Promise<SiteDateTimeSettings> {
  const siteSettings = await getSiteSettings();
  const siteDateTime: SiteDateTimeSettings = {
    dateFormat: siteSettings.dateFormat,
    timeFormat: siteSettings.timeFormat,
    dateSeparator: siteSettings.dateSeparator,
  };

  if (!userId) return siteDateTime;

  const preferences = await getUserDateTimePreferences(userId);
  return resolveEffectiveDateTimeSettings(siteDateTime, preferences);
}

export async function updateUserDateTimePreferences(
  userId: string,
  input: UserDateTimePreferencesInput,
): Promise<UserDateTimePreferences> {
  const preferences = normalizeUserDateTimePreferencesInput(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({
      date_format: preferences.dateFormat,
      time_format: preferences.timeFormat,
      date_separator: preferences.dateSeparator,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("date_format, time_format, date_separator")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserDateTimePreferencesRow(data as UserDateTimePreferencesRow);
}
