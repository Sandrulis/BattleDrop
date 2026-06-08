import {
  DEFAULT_SHOP_SETTINGS,
  type ShopSettings,
  type ShopSettingsRow,
} from "@/app/lib/shop/shop-types";

export function mapShopSettingsRow(row: ShopSettingsRow): ShopSettings {
  return {
    upvotesPerPoint: row.shop_upvotes_per_point,
    affiliatesPerPoint: row.shop_affiliates_per_point,
  };
}

export function resolveShopSettings(
  row: ShopSettingsRow | null | undefined,
): ShopSettings {
  if (!row) return DEFAULT_SHOP_SETTINGS;
  return mapShopSettingsRow(row);
}
