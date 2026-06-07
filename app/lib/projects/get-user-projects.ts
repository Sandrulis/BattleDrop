import { isMissingBattleWeekColumnError } from "@/app/lib/projects/project-battle-week";
import { createClient } from "@/app/lib/supabase/server";
import type { UserProject } from "@/app/lib/types";

const USER_PROJECT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at";

const LEGACY_USER_PROJECT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, created_at, updated_at, deleted_at";

function normalizeUserProject(
  row: Omit<UserProject, "battle_year" | "battle_iso_week"> &
    Partial<Pick<UserProject, "battle_year" | "battle_iso_week">>,
): UserProject {
  return {
    ...row,
    battle_year: row.battle_year ?? null,
    battle_iso_week: row.battle_iso_week ?? null,
  };
}

export async function getUserProjects(): Promise<UserProject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let { data, error } = await supabase
    .from("projects")
    .select(USER_PROJECT_SELECT)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error && isMissingBattleWeekColumnError(error)) {
    ({ data, error } = await supabase
      .from("projects")
      .select(LEGACY_USER_PROJECT_SELECT)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }));
  }

  if (error || !data) return [];

  return data.map((row) => normalizeUserProject(row));
}
