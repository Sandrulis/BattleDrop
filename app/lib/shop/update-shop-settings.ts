import { mapShopSettingsRow } from "@/app/lib/shop/map-shop-settings-row";
import {
  DEFAULT_SHOP_SETTINGS,
  type ShopSettings,
} from "@/app/lib/shop/shop-types";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UpdateShopSettingsInput = Partial<ShopSettings>;

function parseExchangeRate(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rate = Math.round(parsed);
  if (rate < 1 || rate > 1000) {
    return null;
  }

  return rate;
}

export function normalizeShopSettings(
  input: UpdateShopSettingsInput,
): ShopSettings {
  return {
    upvotesPerPoint:
      parseExchangeRate(input.upvotesPerPoint) ??
      DEFAULT_SHOP_SETTINGS.upvotesPerPoint,
    affiliatesPerPoint:
      parseExchangeRate(input.affiliatesPerPoint) ??
      DEFAULT_SHOP_SETTINGS.affiliatesPerPoint,
  };
}

export async function updateShopSettings(
  input: UpdateShopSettingsInput,
): Promise<ShopSettings> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const settings = normalizeShopSettings(input);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("site_settings")
    .update({
      shop_upvotes_per_point: settings.upvotesPerPoint,
      shop_affiliates_per_point: settings.affiliatesPerPoint,
    })
    .eq("id", 1)
    .select("shop_upvotes_per_point, shop_affiliates_per_point")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "shop_settings.update",
    entityType: "site_settings",
    entityId: "1",
    metadata: {
      upvotesPerPoint: settings.upvotesPerPoint,
      affiliatesPerPoint: settings.affiliatesPerPoint,
    },
  });

  return mapShopSettingsRow(data);
}
