import { addIsoWeeks } from "@/app/lib/battle-week";
import { getBattleWeekBounds } from "@/app/lib/battle-week/get-battle-week-bounds";
import { isProjectInBattleWeek } from "@/app/lib/battle-week/is-project-in-battle-week";
import { resolveBattleWeekFromTimestamp } from "@/app/lib/battle-week/resolve-battle-week-from-timestamp";

export type ProjectBattleWeekFields = {
  battle_year: number | null;
  battle_iso_week: number | null;
  created_at: string;
};

export function resolveProjectBattleWeek(
  project: ProjectBattleWeekFields,
): { year: number; week: number } | null {
  if (project.battle_year != null && project.battle_iso_week != null) {
    return {
      year: project.battle_year,
      week: project.battle_iso_week,
    };
  }

  const anchor = resolveBattleWeekFromTimestamp(project.created_at);
  if (!anchor) return null;

  if (isProjectInBattleWeek(project.created_at, anchor.year, anchor.week)) {
    return anchor;
  }

  for (let offset = -2; offset <= 2; offset += 1) {
    if (offset === 0) continue;
    const candidate = addIsoWeeks(anchor.year, anchor.week, offset);
    if (isProjectInBattleWeek(project.created_at, candidate.year, candidate.week)) {
      return candidate;
    }
  }

  return anchor;
}

export function projectMatchesBattleWeek(
  project: ProjectBattleWeekFields,
  year: number,
  week: number,
): boolean {
  if (
    project.battle_year != null &&
    project.battle_iso_week != null &&
    project.battle_year === year &&
    project.battle_iso_week === week
  ) {
    return true;
  }

  return isProjectInBattleWeek(project.created_at, year, week);
}

export function battleWeekProjectsOrFilter(year: number, week: number) {
  const { weekStart, weekEnd } = getBattleWeekBounds(year, week);

  return `and(battle_year.eq.${year},battle_iso_week.eq.${week}),and(created_at.gte.${weekStart.toISOString()},created_at.lt.${weekEnd.toISOString()})`;
}

export function isMissingBattleWeekColumnError(
  error: { message?: string } | null,
): boolean {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("battle_year") || message.includes("battle_iso_week")
  );
}

export function getBattleWeekCreatedAtBounds(year: number, week: number) {
  const { weekStart, weekEnd } = getBattleWeekBounds(year, week);
  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  };
}
