import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";
import type { ShopRedeemResult } from "@/app/lib/shop/shop-types";
import { createAdminClient } from "@/app/lib/supabase/admin";

type RpcResult = {
  pointsBalance: number;
  availableAffiliates: number;
};

export async function redeemShopAffiliates(
  userId: string,
  points: number,
): Promise<ShopRedeemResult> {
  if (!(await isShopEnabled())) {
    throw new Error("Shop integration is disabled.");
  }

  if (!(await isAffiliatesEnabled())) {
    throw new Error("Affiliate integration is disabled.");
  }

  if (!Number.isInteger(points) || points < 1) {
    throw new Error("Points must be at least 1.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("redeem_shop_affiliates", {
    p_user_id: userId,
    p_points: points,
  });

  if (error) {
    if (error.message.includes("insufficient affiliate referrals")) {
      throw new Error("Not enough affiliate referrals to redeem.");
    }

    throw new Error(error.message);
  }

  const result = data as RpcResult;

  return {
    pointsBalance: result.pointsBalance,
    availableAffiliates: result.availableAffiliates,
  };
}
