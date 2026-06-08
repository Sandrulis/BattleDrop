export type DateFormatOrder = "ymd" | "dmy" | "mdy";
export type TimeFormat = "24h" | "12h";
export type DateSeparator = "." | "/" | "-" | " ";
export type CurrencyCode = "EUR" | "USD" | "GBP";

export type SiteSettings = {
  siteName: string;
  siteSlogan: string;
  dateFormat: DateFormatOrder;
  timeFormat: TimeFormat;
  dateSeparator: DateSeparator;
  defaultCurrency: CurrencyCode;
  battleSubmitPrice: number;
  battleStartHoursFromWeekStart: number;
  promoteDurationHours: number;
};

export type SiteDateTimeSettings = Pick<
  SiteSettings,
  "dateFormat" | "timeFormat" | "dateSeparator"
>;

export type SiteSettingsRow = {
  site_name: string;
  site_slogan: string;
  date_format: DateFormatOrder;
  time_format: TimeFormat;
  date_separator: DateSeparator;
  default_currency: CurrencyCode;
  battle_submit_price: number;
  battle_start_hours_from_week_start: number;
  promote_duration_hours: number;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "BattleDrop",
  siteSlogan: "Vote on this week's best products",
  dateFormat: "ymd",
  timeFormat: "24h",
  dateSeparator: ".",
  defaultCurrency: "EUR",
  battleSubmitPrice: 5,
  battleStartHoursFromWeekStart: 96,
  promoteDurationHours: 168,
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const CURRENCY_OPTIONS: {
  value: CurrencyCode;
  label: string;
  symbol: string;
}[] = [
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
  { value: "GBP", label: "British Pound (GBP)", symbol: "£" },
];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "EUR" || value === "USD" || value === "GBP";
}

export function getCurrencySymbol(currency: CurrencyCode) {
  return CURRENCY_SYMBOLS[currency];
}

export function formatSiteMoney(amount: number, currency: CurrencyCode) {
  const formatted = Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
  return `${getCurrencySymbol(currency)}${formatted}`;
}

export const DATE_FORMAT_OPTIONS: {
  value: DateFormatOrder;
  label: string;
}[] = [
  { value: "ymd", label: "Year – Month – Day (2026-06-05)" },
  { value: "dmy", label: "Day – Month – Year (05-06-2026)" },
  { value: "mdy", label: "Month – Day – Year (06-05-2026)" },
];

export const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: "24h", label: "24-hour (14:30)" },
  { value: "12h", label: "12-hour (2:30 PM)" },
];

export const DATE_SEPARATOR_OPTIONS: {
  value: DateSeparator;
  label: string;
}[] = [
  { value: ".", label: "Dot (.)" },
  { value: "/", label: "Slash (/)" },
  { value: "-", label: "Dash (-)" },
  { value: " ", label: "Space" },
];

function buildSiteDateParts(
  date: Date,
  settings: Pick<SiteSettings, "dateFormat" | "dateSeparator">,
) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const sep = settings.dateSeparator;

  return settings.dateFormat === "ymd"
    ? [year, month, day]
    : settings.dateFormat === "dmy"
      ? [day, month, year]
      : [month, day, year];
}

export function formatSiteDate(
  date: Date,
  settings: Pick<SiteSettings, "dateFormat" | "dateSeparator">,
) {
  return buildSiteDateParts(date, settings).join(settings.dateSeparator);
}

export function formatSiteTime(
  date: Date,
  settings: Pick<SiteSettings, "timeFormat">,
) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (settings.timeFormat === "24h") {
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

/** Fixed sample instant for date/time format previews (avoids hydration drift from `new Date()`). */
export const SETTINGS_DATE_TIME_PREVIEW_AT = new Date(2026, 5, 8, 9, 0, 0);

export function formatSiteDateTime(
  date: Date,
  settings: SiteDateTimeSettings,
) {
  return `${formatSiteDate(date, settings)} ${formatSiteTime(date, settings)}`;
}

export function formatSiteDateTimeValue(
  value: string | null | undefined,
  settings: SiteDateTimeSettings,
) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatSiteDateTime(date, settings);
}

export function formatSiteDateValue(
  value: string | null | undefined,
  settings: Pick<SiteSettings, "dateFormat" | "dateSeparator">,
) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatSiteDate(date, settings);
}
