import {
  getBattleWeekTiming,
  resolveBattleWeekDisplayStatus,
  type BattleWeekTiming,
} from "@/app/lib/battle-week-status";
import type { WeekStatus } from "./types";

export function resolveArchiveWeekStatus(
  year: number,
  week: number,
  homeYear: number,
  homeWeek: number,
  now: Date,
  timing: BattleWeekTiming,
): WeekStatus {
  if (year > homeYear || (year === homeYear && week > homeWeek)) {
    return "upcoming";
  }

  if (year === homeYear && week === homeWeek) {
    const displayStatus = resolveBattleWeekDisplayStatus(now, timing);
    return displayStatus === "closed" ? "completed" : "active";
  }

  return "completed";
}

export function getArchiveWeekTiming(
  year: number,
  week: number,
  battleStartHoursFromWeekStart: number,
): BattleWeekTiming {
  return getBattleWeekTiming(year, week, battleStartHoursFromWeekStart);
}
