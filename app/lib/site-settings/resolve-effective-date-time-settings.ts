import type {
  DateFormatOrder,
  DateSeparator,
  SiteDateTimeSettings,
  TimeFormat,
} from "@/app/lib/site-settings-types";

export type UserDateTimePreferences = {
  dateFormat: DateFormatOrder | null;
  timeFormat: TimeFormat | null;
  dateSeparator: DateSeparator | null;
};

export function resolveEffectiveDateTimeSettings(
  site: SiteDateTimeSettings,
  user?: UserDateTimePreferences | null,
): SiteDateTimeSettings {
  if (!user) return site;

  return {
    dateFormat: user.dateFormat ?? site.dateFormat,
    timeFormat: user.timeFormat ?? site.timeFormat,
    dateSeparator: user.dateSeparator ?? site.dateSeparator,
  };
}
