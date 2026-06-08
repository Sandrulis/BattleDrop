import type { AffiliateInvite } from "@/app/lib/affiliates/affiliate-types";
import { mapAffiliateInviteRow } from "@/app/lib/affiliates/map-affiliate-invite-row";
import { createAdminClient } from "@/app/lib/supabase/admin";

function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createAffiliateInvite(
  userId: string,
  userEmail: string | null,
  rawEmail: string,
): Promise<AffiliateInvite> {
  const email = normalizeInviteEmail(rawEmail);

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (userEmail && normalizeInviteEmail(userEmail) === email) {
    throw new Error("You cannot invite your own email.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("affiliate_invites")
    .insert({
      referrer_user_id: userId,
      email,
    })
    .select("id, referrer_user_id, email, status, referred_user_id, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This email is already on your invite list.");
    }
    throw error;
  }

  return mapAffiliateInviteRow(data);
}
