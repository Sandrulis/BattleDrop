import { formatSiteDate, type SiteDateTimeSettings } from "@/app/lib/site-settings-types";

export function getCurrentIsoWeek(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);

  const isoYear = d.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - jan4Day + 1);

  const monday = new Date(d);
  monday.setDate(d.getDate() - 3);
  const week =
    Math.round((monday.getTime() - mondayWeek1.getTime()) / (7 * 86400000)) + 1;

  return { week, year: isoYear };
}

function getMondayOfIsoWeek(year: number, week: number) {
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - day + 1);
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  return monday;
}

export function formatBattleWeekRange(
  week: number,
  year: number,
  settings: Pick<SiteDateTimeSettings, "dateFormat" | "dateSeparator">,
) {
  const start = getMondayOfIsoWeek(year, week);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${formatSiteDate(start, settings)} – ${formatSiteDate(end, settings)}`;
}

export function addIsoWeeks(year: number, week: number, count = 1) {
  const monday = getMondayOfIsoWeek(year, week);
  monday.setDate(monday.getDate() + count * 7);
  return getCurrentIsoWeek(monday);
}

export { getMondayOfIsoWeek };
