import { createClient } from "@/app/lib/supabase/server";
import { buildScreenshotProxyUrl } from "@/app/lib/projects/project-utils";
import type { EditProjectData } from "@/app/lib/types";

export async function getProjectForEdit(
  projectId: string,
): Promise<EditProjectData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, created_at, updated_at",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    url: data.url,
    fetchUrl: data.fetch_url,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    favicon: data.favicon_url,
    screenshotUrl: data.screenshot_url
      ? buildScreenshotProxyUrl(data.fetch_url, data.screenshot_url)
      : null,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
