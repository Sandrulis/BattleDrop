import { isIntegrationEnabled } from "@/app/lib/integrations/is-integration-enabled";

export const PROMOTE_INTEGRATION_KEY = "project_promotes";

export async function isPromotesEnabled(): Promise<boolean> {
  return isIntegrationEnabled(PROMOTE_INTEGRATION_KEY);
}
