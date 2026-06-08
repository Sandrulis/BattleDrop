import { AFFILIATE_INTEGRATION_KEY } from "@/app/lib/affiliates/affiliate-types";
import { isIntegrationEnabled } from "@/app/lib/integrations/is-integration-enabled";

export async function isAffiliatesEnabled(): Promise<boolean> {
  return isIntegrationEnabled(AFFILIATE_INTEGRATION_KEY);
}
