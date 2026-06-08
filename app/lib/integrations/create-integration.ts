import type {
  CreateSiteIntegrationInput,
  SiteIntegration,
} from "@/app/lib/integrations/integration-types";
import { mapSiteIntegrationRow } from "@/app/lib/integrations/map-integration-row";
import {
  normalizeIntegrationApiKey,
  normalizeIntegrationDescription,
  normalizeIntegrationKey,
  normalizeIntegrationName,
} from "@/app/lib/integrations/normalize-integration-input";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function createSiteIntegration(
  input: CreateSiteIntegrationInput,
): Promise<SiteIntegration> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const name = normalizeIntegrationName(input.name);
  const integrationKey = normalizeIntegrationKey(input.integrationKey);
  const description = normalizeIntegrationDescription(input.description);
  const apiKey = normalizeIntegrationApiKey(input.apiKey);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_integrations")
    .insert({
      name,
      integration_key: integrationKey,
      api_key: apiKey,
      description,
      enabled: false,
    })
    .select(
      "id, name, integration_key, api_key, description, enabled, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("An integration with this key already exists.");
    }
    throw new Error(error?.message ?? "Could not create integration.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_integration.create",
    entityType: "site_integration",
    entityId: data.id,
    metadata: { name: data.name, integrationKey: data.integration_key },
  });

  return mapSiteIntegrationRow(data);
}
