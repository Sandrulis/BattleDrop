import { createAdminClient } from "@/app/lib/supabase/admin";
import {
  battleWeekProjectsOrFilter,
  getBattleWeekCreatedAtBounds,
  isMissingBattleWeekColumnError,
} from "@/app/lib/projects/project-battle-week";

export async function userHasPublishedProjectInWeek(
  userId: string,
  year: number,
  week: number,
  excludeProjectId?: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { weekStart, weekEnd } = getBattleWeekCreatedAtBounds(year, week);

  let query = admin
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "published")
    .is("deleted_at", null)
    .or(battleWeekProjectsOrFilter(year, week));

  if (excludeProjectId) {
    query = query.neq("id", excludeProjectId);
  }

  let { count, error } = await query;

  if (error && isMissingBattleWeekColumnError(error)) {
    let legacyQuery = admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("created_at", weekStart)
      .lt("created_at", weekEnd);

    if (excludeProjectId) {
      legacyQuery = legacyQuery.neq("id", excludeProjectId);
    }

    ({ count, error } = await legacyQuery);
  }

  if (error) return false;

  return (count ?? 0) > 0;
}
