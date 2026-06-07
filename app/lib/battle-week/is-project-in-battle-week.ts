import { getBattleWeekBounds } from "./get-battle-week-bounds";

export function isProjectInBattleWeek(
  createdAt: string,
  year: number,
  week: number,
): boolean {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;

  const { weekStart, weekEnd } = getBattleWeekBounds(year, week);
  return created >= weekStart && created < weekEnd;
}
