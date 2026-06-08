import Link from "next/link";
import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { UserAvatar } from "@/app/components/user-avatar";
import type { AffiliateDashboard } from "@/app/lib/affiliates/affiliate-types";
import { getHomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import {
  formatAffiliateExchangeArrow,
  formatAffiliateShopRedeemLine,
} from "@/app/lib/shop/format-shop-exchange-rate";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import type { AppUser } from "@/app/lib/types";

type AffiliatesSidePanelProps = {
  user: AppUser;
  dashboard: AffiliateDashboard;
};

export async function AffiliatesSidePanel({
  user,
  dashboard,
}: AffiliatesSidePanelProps) {
  const homeBattleWeek = dashboard.shopEnabled ? await getHomeBattleWeek() : null;
  const entryFeeLabel = homeBattleWeek
    ? formatDisplayPoints(homeBattleWeek.submitPrice)
    : null;
  const displayName = user.full_name?.trim() || user.email || "Founder";
  const totalInvites = dashboard.invites.length;

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Your account</h3>
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            src={user.avatar_url}
            name={displayName}
            imgClassName="h-10 w-10 rounded-lg object-cover"
            fallbackClassName="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 text-sm font-medium text-zinc-700"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <PointsBalanceLink points={user.points} returnTo="/affiliates" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Your referrals</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Joined</dt>
            <dd className="font-medium text-zinc-900 tabular-nums">
              {dashboard.joinedCount}
            </dd>
          </div>
          {dashboard.shopEnabled ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Available to redeem</dt>
                <dd className="font-medium text-zinc-900 tabular-nums">
                  {dashboard.availableAffiliates} / {dashboard.joinedCount}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Redeemable as</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDisplayPoints(dashboard.maxRedeemablePoints)}
                </dd>
              </div>
            </>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Pending invites</dt>
            <dd className="font-medium text-zinc-900">
              {dashboard.pendingInviteCount}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Email invites</dt>
            <dd className="font-medium text-zinc-900">{totalInvites}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Affiliate code</dt>
            <dd className="font-mono font-medium text-zinc-900">
              {dashboard.affiliateCode}
            </dd>
          </div>
        </dl>
      </div>

      {dashboard.shopEnabled && entryFeeLabel ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">How rewards work</h3>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Shop rate</dt>
              <dd className="font-medium text-zinc-900">
                {formatAffiliateExchangeArrow(dashboard.affiliatesPerPoint)}
              </dd>
            </div>
          </dl>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-600">
            <li>{formatAffiliateShopRedeemLine(dashboard.affiliatesPerPoint)}</li>
            <li>
              Spend points on battle entry ({entryFeeLabel}), promoted spots, or save
              them — no expiry.
            </li>
            <li>Share your link or invite by email, then send the same link.</li>
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">How invites work</h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-600">
            <li>Share your link or invite by email, then send the same link.</li>
            <li>
              When someone signs up through your link, they count as a joined
              referral.
            </li>
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Quick links</h3>
        <ul className="mt-3 space-y-2 text-xs">
          <li>
            <Link href="/" className="font-medium text-[#da552f] hover:underline">
              Home →
            </Link>
          </li>
          <li>
            <Link
              href="/my-projects"
              className="font-medium text-[#da552f] hover:underline"
            >
              My Projects →
            </Link>
          </li>
          <li>
            <Link href="/submit" className="font-medium text-[#da552f] hover:underline">
              Submit product →
            </Link>
          </li>
          {dashboard.shopEnabled ? (
            <li>
              <Link href="/shop" className="font-medium text-[#da552f] hover:underline">
                Shop →
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href="/buy-points?return=/affiliates"
              className="font-medium text-[#da552f] hover:underline"
            >
              Buy points →
            </Link>
          </li>
          <li>
            <Link href="/settings" className="font-medium text-[#da552f] hover:underline">
              Settings →
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
