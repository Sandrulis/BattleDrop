import type {
  AffiliateDashboard,
  AffiliateInviteRow,
} from "@/app/lib/affiliates/affiliate-types";
import { buildAffiliateLink } from "@/app/lib/affiliates/build-affiliate-link";
import { ensureAffiliateCode } from "@/app/lib/affiliates/ensure-affiliate-code";
import { mapAffiliateInviteRow } from "@/app/lib/affiliates/map-affiliate-invite-row";
import { getShopSettings } from "@/app/lib/shop/get-shop-settings";
import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function getAffiliateDashboard(
  userId: string,
): Promise<AffiliateDashboard> {
  const admin = createAdminClient();
  const affiliateCode = await ensureAffiliateCode(userId);

  const [invitesResult, joinedCountResult, shopSettings, shopEnabled, userResult] =
    await Promise.all([
      admin
        .from("affiliate_invites")
        .select("id, referrer_user_id, email, status, referred_user_id, created_at")
        .eq("referrer_user_id", userId)
        .order("created_at", { ascending: false }),
      admin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("referred_by_user_id", userId),
      getShopSettings(),
      isShopEnabled(),
      admin
        .from("users")
        .select("shop_affiliates_redeemed")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  if (invitesResult.error) throw invitesResult.error;
  if (joinedCountResult.error) throw joinedCountResult.error;
  if (userResult.error) throw userResult.error;

  const invites = (invitesResult.data ?? []) as AffiliateInviteRow[];
  const pendingInviteCount = invites.filter(
    (invite) => invite.status === "pending",
  ).length;
  const joinedCount = joinedCountResult.count ?? 0;
  const affiliatesRedeemed = userResult.data?.shop_affiliates_redeemed ?? 0;
  const availableAffiliates = Math.max(0, joinedCount - affiliatesRedeemed);
  const { affiliatesPerPoint } = shopSettings;
  const maxRedeemablePoints =
    affiliatesPerPoint > 0
      ? Math.floor(availableAffiliates / affiliatesPerPoint)
      : 0;

  return {
    affiliateCode,
    affiliateLink: buildAffiliateLink(affiliateCode),
    joinedCount,
    pendingInviteCount,
    invites: invites.map(mapAffiliateInviteRow),
    affiliatesPerPoint,
    availableAffiliates,
    affiliatesRedeemed,
    maxRedeemablePoints,
    shopEnabled,
  };
}
