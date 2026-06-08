import { projectToProduct } from "@/app/lib/projects/project-to-product";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { Product, UserProject } from "@/app/lib/types";

type ProjectOwner = {
  full_name: string | null;
  email: string | null;
};

type PublishedProjectRow = UserProject & {
  users: ProjectOwner | ProjectOwner[] | null;
};

function resolveOwner(users: ProjectOwner | ProjectOwner[] | null): ProjectOwner {
  if (!users) return { full_name: null, email: null };
  return Array.isArray(users) ? (users[0] ?? { full_name: null, email: null }) : users;
}

export type PublishedProjectProduct = {
  product: Product;
  fetchUrl: string;
  screenshotUrl: string | null;
  faviconUrl: string | null;
  battleYear: number | null;
  battleIsoWeek: number | null;
  createdAt: string;
};

export async function getPublishedProjectProduct(
  projectId: string,
): Promise<PublishedProjectProduct | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select(
      "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at, users ( full_name, email )",
    )
    .eq("id", projectId)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const project = data as PublishedProjectRow;
  return {
    product: projectToProduct(project, resolveOwner(project.users)),
    fetchUrl: project.fetch_url,
    screenshotUrl: project.screenshot_url,
    faviconUrl: project.favicon_url,
    battleYear: project.battle_year,
    battleIsoWeek: project.battle_iso_week,
    createdAt: project.created_at,
  };
}
