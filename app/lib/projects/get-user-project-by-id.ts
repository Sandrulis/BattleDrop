import { createClient } from "@/app/lib/supabase/server";
import type { UserProject } from "@/app/lib/types";

export async function getUserProjectById(
  projectId: string,
): Promise<UserProject | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return data;
}
