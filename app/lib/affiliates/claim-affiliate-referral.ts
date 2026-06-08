import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { createAdminClient } from "@/app/lib/supabase/admin";

function normalizeAffiliateCode(code: string): string {
  return code.trim().toLowerCase();
}

export async function claimAffiliateReferral(
  userId: string,
  rawCode: string,
): Promise<boolean> {
  if (!(await isAffiliatesEnabled())) return false;

  const code = normalizeAffiliateCode(rawCode);
  if (!code) return false;

  const admin = createAdminClient();

  const { data: user, error: userError } = await admin
    .from("users")
    .select("id, email, referred_by_user_id")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !user || user.referred_by_user_id) return false;

  const { data: referrer, error: referrerError } = await admin
    .from("users")
    .select("id")
    .eq("affiliate_code", code)
    .maybeSingle();

  if (referrerError || !referrer || referrer.id === userId) return false;

  const { error: updateError } = await admin
    .from("users")
    .update({ referred_by_user_id: referrer.id })
    .eq("id", userId)
    .is("referred_by_user_id", null);

  if (updateError) return false;

  if (user.email) {
    await admin
      .from("affiliate_invites")
      .update({
        status: "joined",
        referred_user_id: userId,
      })
      .eq("referrer_user_id", referrer.id)
      .eq("email", user.email.trim().toLowerCase())
      .eq("status", "pending");
  }

  return true;
}
