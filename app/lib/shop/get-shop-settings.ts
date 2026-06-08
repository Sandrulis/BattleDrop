import { cache } from "react";
import { unstable_cache } from "next/cache";
import { resolveShopSettings } from "@/app/lib/shop/map-shop-settings-row";
import {
  DEFAULT_SHOP_SETTINGS,
  type ShopSettings,
  type ShopSettingsRow,
} from "@/app/lib/shop/shop-types";
import { createAdminClient } from "@/app/lib/supabase/admin";

async function fetchShopSettingsFromDb(): Promise<ShopSettings> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_settings")
    .select("shop_upvotes_per_point, shop_affiliates_per_point")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SHOP_SETTINGS;
  }

  return resolveShopSettings(data as ShopSettingsRow);
}

const getCachedShopSettings = unstable_cache(
  fetchShopSettingsFromDb,
  ["shop-settings"],
  { tags: ["shop-settings", "site-settings"] },
);

export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  return getCachedShopSettings();
});
