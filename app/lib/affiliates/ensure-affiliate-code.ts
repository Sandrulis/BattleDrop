import { generateAffiliateCode } from "@/app/lib/affiliates/generate-affiliate-code";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function ensureAffiliateCode(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: existing, error: readError } = await admin
    .from("users")
    .select("affiliate_code")
    .eq("id", userId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing?.affiliate_code) return existing.affiliate_code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const affiliateCode = generateAffiliateCode();
    const { data, error } = await admin
      .from("users")
      .update({ affiliate_code: affiliateCode })
      .eq("id", userId)
      .is("affiliate_code", null)
      .select("affiliate_code")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") continue;
      throw error;
    }

    if (data?.affiliate_code) return data.affiliate_code;
  }

  const { data: refreshed, error: refreshError } = await admin
    .from("users")
    .select("affiliate_code")
    .eq("id", userId)
    .maybeSingle();

  if (refreshError) throw refreshError;
  if (!refreshed?.affiliate_code) {
    throw new Error("Could not create affiliate code.");
  }

  return refreshed.affiliate_code;
}
