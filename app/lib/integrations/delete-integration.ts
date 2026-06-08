import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function deleteSiteIntegration(integrationId: string): Promise<void> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("site_integrations")
    .select("id, name, integration_key")
    .eq("id", integrationId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    throw new Error("Integration not found.");
  }

  const { error } = await admin
    .from("site_integrations")
    .delete()
    .eq("id", integrationId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_integration.delete",
    entityType: "site_integration",
    entityId: existing.id,
    metadata: {
      name: existing.name,
      integrationKey: existing.integration_key,
    },
  });
}
