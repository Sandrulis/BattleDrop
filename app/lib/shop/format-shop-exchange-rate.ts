import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";

export function formatReferralCount(count: number): string {
  return `${count} referral${count === 1 ? "" : "s"}`;
}

export function formatAffiliateReferralsPerPoint(affiliatesPerPoint: number): string {
  return `${formatReferralCount(affiliatesPerPoint)} per ${formatDisplayPoints(1)}`;
}

export function formatAffiliateExchangeArrow(affiliatesPerPoint: number): string {
  return `${affiliatesPerPoint} → ${formatDisplayPoints(1)}`;
}

export function formatAffiliateShopRedeemLine(affiliatesPerPoint: number): string {
  return `Redeem joined referrals in the Shop (${formatAffiliateReferralsPerPoint(affiliatesPerPoint)}).`;
}

export function formatAffiliateSidebarBlurb(
  affiliatesPerPoint: number,
  entryFeeLabel: string,
): string {
  return `${formatAffiliateShopRedeemLine(affiliatesPerPoint)} Spend on entry (${entryFeeLabel}), promoted spots, or save — no expiry.`;
}

export function formatAffiliateHomeSidebarBlurb(
  affiliatesPerPoint: number,
  entryFeeLabel: string,
): string {
  return `Invite founders, then redeem referrals for ${formatDisplayPoints(1)} in the Shop (${formatAffiliateReferralsPerPoint(affiliatesPerPoint)}). Spend on entry (${entryFeeLabel}), promoted spots, or save — no expiry.`;
}
