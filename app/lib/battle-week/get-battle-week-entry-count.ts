import {
  battleWeekProjectsOrFilter,
  getBattleWeekCreatedAtBounds,
  isMissingBattleWeekColumnError,
} from "@/app/lib/projects/project-battle-week";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function getBattleWeekEntryCount(
  year: number,
  week: number,
): Promise<number> {
  const admin = createAdminClient();
  const { weekStart, weekEnd } = getBattleWeekCreatedAtBounds(year, week);

  let { count, error } = await admin
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null)
    .or(battleWeekProjectsOrFilter(year, week));

  if (error && isMissingBattleWeekColumnError(error)) {
    ({ count, error } = await admin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("created_at", weekStart)
      .lt("created_at", weekEnd));
  }

  if (error) {
    return 0;
  }

  return count ?? 0;
}
