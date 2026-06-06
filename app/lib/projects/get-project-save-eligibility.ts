import {
  findExistingProjectByUrl,
  PROJECT_ALREADY_IN_DB_MESSAGE,
} from "@/app/lib/projects/find-existing-project-by-url";

export type ProjectSaveSkipReason = "already_in_db";

export type ProjectSaveEligibility =
  | { canSave: true }
  | { canSave: false; reason: ProjectSaveSkipReason; message: string };

export async function getProjectSaveEligibility(
  _userId: string,
  rawUrl: string,
): Promise<ProjectSaveEligibility> {
  const existing = await findExistingProjectByUrl(rawUrl);

  if (!existing) {
    return { canSave: true };
  }

  return {
    canSave: false,
    reason: "already_in_db",
    message: PROJECT_ALREADY_IN_DB_MESSAGE,
  };
}
