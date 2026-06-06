import {
  DEFAULT_SITE_SETTINGS,
  formatSiteDateTime,
  formatSiteDateTimeValue,
  formatSiteDateValue,
  type SiteDateTimeSettings,
} from "@/app/lib/site-settings-types";

export {
  formatSiteDate,
  formatSiteDateTime,
  formatSiteDateTimeValue,
  formatSiteDateValue,
  formatSiteTime,
  type SiteDateTimeSettings,
} from "@/app/lib/site-settings-types";

export function resolveSiteDateTimeSettings(
  settings?: SiteDateTimeSettings,
): SiteDateTimeSettings {
  return settings ?? {
    dateFormat: DEFAULT_SITE_SETTINGS.dateFormat,
    timeFormat: DEFAULT_SITE_SETTINGS.timeFormat,
    dateSeparator: DEFAULT_SITE_SETTINGS.dateSeparator,
  };
}

export function formatDisplayDateTime(
  value: string | null | undefined,
  settings?: SiteDateTimeSettings,
) {
  return formatSiteDateTimeValue(value, resolveSiteDateTimeSettings(settings));
}

export function formatDisplayDate(
  value: string | null | undefined,
  settings?: SiteDateTimeSettings,
) {
  return formatSiteDateValue(value, resolveSiteDateTimeSettings(settings));
}

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function formatRelativeCount(value: number, unit: string) {
  return value === 1 ? `1 ${unit} ago` : `${value} ${unit}s ago`;
}

export function formatLastSeen(
  value: string | null,
  settings?: SiteDateTimeSettings,
  now: Date = new Date(),
) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < MS_PER_MINUTE) {
    const seconds = Math.max(1, Math.floor(diffMs / MS_PER_SECOND));
    return formatRelativeCount(seconds, "second");
  }

  if (diffMs < MS_PER_HOUR) {
    const minutes = Math.floor(diffMs / MS_PER_MINUTE);
    return formatRelativeCount(minutes, "minute");
  }

  if (diffMs < MS_PER_DAY) {
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    return formatRelativeCount(hours, "hour");
  }

  if (diffMs < MS_PER_WEEK) {
    const days = Math.floor(diffMs / MS_PER_DAY);
    return formatRelativeCount(days, "day");
  }

  return formatDisplayDate(value, settings);
}
