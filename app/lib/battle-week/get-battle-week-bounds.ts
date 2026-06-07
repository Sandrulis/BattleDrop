import { getMondayOfIsoWeek } from "@/app/lib/battle-week";

export function getBattleWeekBounds(year: number, week: number) {
  const weekStart = getMondayOfIsoWeek(year, week);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return { weekStart, weekEnd };
}
