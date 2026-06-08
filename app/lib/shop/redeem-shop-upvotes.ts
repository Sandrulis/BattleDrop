import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";
import type { ShopRedeemResult } from "@/app/lib/shop/shop-types";
import { createAdminClient } from "@/app/lib/supabase/admin";

type RpcResult = {
  pointsBalance: number;
  availableUpvotes: number;
};

export async function redeemShopUpvotes(
  userId: string,
  points: number,
): Promise<ShopRedeemResult> {
  if (!(await isShopEnabled())) {
    throw new Error("Shop integration is disabled.");
  }

  if (!Number.isInteger(points) || points < 1) {
    throw new Error("Points must be at least 1.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("redeem_shop_upvotes", {
    p_user_id: userId,
    p_points: points,
  });

  if (error) {
    if (error.message.includes("insufficient upvotes")) {
      throw new Error("Not enough upvotes to redeem.");
    }

    throw new Error(error.message);
  }

  const result = data as RpcResult;

  return {
    pointsBalance: result.pointsBalance,
    availableUpvotes: result.availableUpvotes,
  };
}
