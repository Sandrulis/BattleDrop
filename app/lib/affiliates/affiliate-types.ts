export const AFFILIATE_INTEGRATION_KEY = "integration_affiliates";

export const AFFILIATE_REF_COOKIE = "bd_affiliate_ref";

export type AffiliateInviteStatus = "pending" | "joined";

export type AffiliateInviteRow = {
  id: string;
  referrer_user_id: string;
  email: string;
  status: AffiliateInviteStatus;
  referred_user_id: string | null;
  created_at: string;
};

export type AffiliateInvite = {
  id: string;
  email: string;
  status: AffiliateInviteStatus;
  createdAt: string;
};

export type AffiliateDashboard = {
  affiliateCode: string;
  affiliateLink: string;
  joinedCount: number;
  pendingInviteCount: number;
  invites: AffiliateInvite[];
  affiliatesPerPoint: number;
  availableAffiliates: number;
  affiliatesRedeemed: number;
  maxRedeemablePoints: number;
  shopEnabled: boolean;
};
