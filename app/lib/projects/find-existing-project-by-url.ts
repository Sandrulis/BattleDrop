import { createAdminClient } from "@/app/lib/supabase/admin";
import { projectUrlsMatchHost } from "@/app/lib/projects/project-utils";

export const PROJECT_ALREADY_IN_DB_MESSAGE =
  "This project is already in the database.";

type ExistingProject = {
  id: string;
  user_id: string;
  url: string;
  deleted_at: string | null;
};

export async function findExistingProjectByUrl(
  rawUrl: string,
  excludeProjectId?: string,
): Promise<ExistingProject | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("projects")
    .select("id, user_id, url, deleted_at");

  if (error || !data) return null;

  return (
    data.find(
      (project) =>
        projectUrlsMatchHost(project.url, rawUrl) &&
        (!excludeProjectId || project.id !== excludeProjectId),
    ) ?? null
  );
}

export async function isProjectUrlInDatabase(
  rawUrl: string,
  excludeProjectId?: string,
) {
  return (await findExistingProjectByUrl(rawUrl, excludeProjectId)) !== null;
}
