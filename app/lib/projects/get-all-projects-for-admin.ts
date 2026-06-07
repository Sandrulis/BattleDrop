import { createAdminClient } from "@/app/lib/supabase/admin";
import type { UserProject } from "@/app/lib/types";
import { getUserDisplayName } from "@/app/lib/users/get-all-users-for-admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export type AdminProject = UserProject & {
  ownerName: string;
};

type ProjectOwner = { full_name: string | null; email: string | null };

type ProjectRow = UserProject & {
  users: ProjectOwner | ProjectOwner[] | null;
};

function resolveProjectOwner(
  users: ProjectOwner | ProjectOwner[] | null,
): ProjectOwner {
  if (!users) return { full_name: null, email: null };
  return Array.isArray(users) ? (users[0] ?? { full_name: null, email: null }) : users;
}

export async function getAllProjectsForAdmin(): Promise<AdminProject[]> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select(
      "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at, users ( full_name, email )",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as ProjectRow[])
    .map((project) => ({
      id: project.id,
      user_id: project.user_id,
      url: project.url,
      fetch_url: project.fetch_url,
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      favicon_url: project.favicon_url,
      screenshot_url: project.screenshot_url,
      status: project.status,
      created_at: project.created_at,
      updated_at: project.updated_at,
      deleted_at: project.deleted_at,
      ownerName: getUserDisplayName(resolveProjectOwner(project.users)),
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}
