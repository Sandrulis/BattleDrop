import type { SiteIntegration } from "@/app/lib/integrations/integration-types";
import { mapSiteIntegrationRow } from "@/app/lib/integrations/map-integration-row";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getSiteIntegrations(): Promise<SiteIntegration[]> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_integrations")
    .select(
      "id, name, integration_key, api_key, description, enabled, created_at, updated_at",
    )
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => mapSiteIntegrationRow(row));
}
