import type {
  SiteIntegration,
  UpdateSiteIntegrationInput,
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

export async function updateSiteIntegration(
  integrationId: string,
  input: UpdateSiteIntegrationInput,
): Promise<SiteIntegration> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updates.name = normalizeIntegrationName(input.name);
  }

  if (input.integrationKey !== undefined) {
    updates.integration_key = normalizeIntegrationKey(input.integrationKey);
  }

  if (input.description !== undefined) {
    updates.description = normalizeIntegrationDescription(input.description);
  }

  if (input.enabled !== undefined) {
    updates.enabled = input.enabled;
  }

  if (input.apiKey !== undefined) {
    updates.api_key = normalizeIntegrationApiKey(input.apiKey);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No changes provided.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_integrations")
    .update(updates)
    .eq("id", integrationId)
    .select(
      "id, name, integration_key, api_key, description, enabled, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new Error("An integration with this key already exists.");
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Integration not found.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_integration.update",
    entityType: "site_integration",
    entityId: data.id,
    metadata: {
      name: data.name,
      integrationKey: data.integration_key,
      enabled: data.enabled,
      fields: Object.keys(updates).filter((field) => field !== "api_key"),
    },
  });

  return mapSiteIntegrationRow(data);
}
