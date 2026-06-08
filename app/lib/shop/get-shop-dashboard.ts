import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { getShopSettings } from "@/app/lib/shop/get-shop-settings";
import type { ShopDashboard } from "@/app/lib/shop/shop-types";
import { getUserCommentUpvoteCount } from "@/app/lib/product-comments";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function getShopDashboard(userId: string): Promise<ShopDashboard> {
  const admin = createAdminClient();
  const [shopSettings, affiliatesEnabled, totalUpvotes, userResult, joinedResult] =
    await Promise.all([
      getShopSettings(),
      isAffiliatesEnabled(),
      getUserCommentUpvoteCount(userId),
      admin
        .from("users")
        .select("points, shop_upvotes_redeemed, shop_affiliates_redeemed")
        .eq("id", userId)
        .maybeSingle(),
      admin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("referred_by_user_id", userId),
    ]);

  if (userResult.error) throw userResult.error;
  if (joinedResult.error) throw joinedResult.error;
  if (!userResult.data) {
    throw new Error("User not found.");
  }

  const upvotesRedeemed = userResult.data.shop_upvotes_redeemed ?? 0;
  const affiliatesRedeemed = userResult.data.shop_affiliates_redeemed ?? 0;
  const joinedAffiliates = joinedResult.count ?? 0;

  return {
    pointsBalance: userResult.data.points ?? 0,
    totalUpvotes,
    availableUpvotes: Math.max(0, totalUpvotes - upvotesRedeemed),
    upvotesPerPoint: shopSettings.upvotesPerPoint,
    joinedAffiliates,
    availableAffiliates: Math.max(0, joinedAffiliates - affiliatesRedeemed),
    affiliatesPerPoint: shopSettings.affiliatesPerPoint,
    affiliatesEnabled,
  };
}
