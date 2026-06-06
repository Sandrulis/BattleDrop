import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

const ACTIVE_USER_WINDOW_DAYS = 30;

export type AdminOverviewStats = {
  activeUsers: number;
  draftProjects: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    return { activeUsers: 0, draftProjects: 0 };
  }

  const admin = createAdminClient();
  const activeSince = new Date(
    Date.now() - ACTIVE_USER_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [usersResult, projectsResult] = await Promise.all([
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", activeSince),
    admin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft")
      .is("deleted_at", null),
  ]);

  return {
    activeUsers: usersResult.count ?? 0,
    draftProjects: projectsResult.count ?? 0,
  };
}
