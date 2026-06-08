import type { AffiliateInvite, AffiliateInviteRow } from "@/app/lib/affiliates/affiliate-types";

export function mapAffiliateInviteRow(row: AffiliateInviteRow): AffiliateInvite {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  };
}
