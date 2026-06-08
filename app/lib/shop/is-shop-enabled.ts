import { isIntegrationEnabled } from "@/app/lib/integrations/is-integration-enabled";
import { SHOP_INTEGRATION_KEY } from "@/app/lib/shop/shop-types";

export async function isShopEnabled(): Promise<boolean> {
  return isIntegrationEnabled(SHOP_INTEGRATION_KEY);
}
