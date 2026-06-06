import { formatSiteDate, type SiteDateTimeSettings } from "@/app/lib/site-settings-types";

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

export { getMondayOfIsoWeek };
