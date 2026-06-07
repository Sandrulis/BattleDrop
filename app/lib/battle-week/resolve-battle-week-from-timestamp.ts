import { getCurrentIsoWeek } from "@/app/lib/battle-week";
import { isProjectInBattleWeek } from "@/app/lib/battle-week/is-project-in-battle-week";

export function resolveBattleWeekFromTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const anchor = getCurrentIsoWeek(date);
  if (isProjectInBattleWeek(timestamp, anchor.year, anchor.week)) {
    return anchor;
  }

  return anchor;
}
