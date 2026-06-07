import { projectToProduct } from "@/app/lib/projects/project-to-product";
import {
  battleWeekProjectsOrFilter,
  getBattleWeekCreatedAtBounds,
  isMissingBattleWeekColumnError,
} from "@/app/lib/projects/project-battle-week";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { Product, UserProject } from "@/app/lib/types";

const BATTLE_WEEK_PRODUCT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at, users ( full_name, email )";

const LEGACY_BATTLE_WEEK_PRODUCT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, created_at, updated_at, deleted_at, users ( full_name, email )";

type ProjectOwner = {
  full_name: string | null;
  email: string | null;
};

type BattleWeekProjectRow = UserProject & {
  users: ProjectOwner | ProjectOwner[] | null;
};

function resolveOwner(users: ProjectOwner | ProjectOwner[] | null): ProjectOwner {
  if (!users) return { full_name: null, email: null };
  return Array.isArray(users) ? (users[0] ?? { full_name: null, email: null }) : users;
}

export async function getBattleWeekProducts(
  year: number,
  week: number,
): Promise<Product[]> {
  const admin = createAdminClient();
  const { weekStart, weekEnd } = getBattleWeekCreatedAtBounds(year, week);

  let { data, error } = await admin
    .from("projects")
    .select(BATTLE_WEEK_PRODUCT_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .or(battleWeekProjectsOrFilter(year, week))
    .order("created_at", { ascending: true });

  if (error && isMissingBattleWeekColumnError(error)) {
    ({ data, error } = await admin
      .from("projects")
      .select(LEGACY_BATTLE_WEEK_PRODUCT_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("created_at", weekStart)
      .lt("created_at", weekEnd)
      .order("created_at", { ascending: true }));
  }

  if (error || !data) return [];

  return (data as BattleWeekProjectRow[]).map((project, index) =>
    projectToProduct(project, resolveOwner(project.users), index + 1),
  );
}
