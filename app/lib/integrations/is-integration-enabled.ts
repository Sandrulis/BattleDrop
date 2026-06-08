import { createAdminClient } from "@/app/lib/supabase/admin";

export async function isIntegrationEnabled(
  integrationKey: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_integrations")
    .select("enabled")
    .eq("integration_key", integrationKey)
    .maybeSingle();

  if (error || !data) return false;
  return data.enabled;
}
