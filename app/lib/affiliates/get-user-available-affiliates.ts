import { createAdminClient } from "@/app/lib/supabase/admin";

export async function getUserAvailableAffiliates(
  userId: string,
): Promise<number> {
  const admin = createAdminClient();

  const [joinedResult, userResult] = await Promise.all([
    admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by_user_id", userId),
    admin
      .from("users")
      .select("shop_affiliates_redeemed")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (joinedResult.error) throw joinedResult.error;
  if (userResult.error) throw userResult.error;

  const joinedCount = joinedResult.count ?? 0;
  const affiliatesRedeemed = userResult.data?.shop_affiliates_redeemed ?? 0;

  return Math.max(0, joinedCount - affiliatesRedeemed);
}
