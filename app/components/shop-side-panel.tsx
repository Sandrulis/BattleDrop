import Link from "next/link";
import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { UserAvatar } from "@/app/components/user-avatar";
import { formatAffiliateExchangeArrow } from "@/app/lib/shop/format-shop-exchange-rate";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import type { ShopDashboard } from "@/app/lib/shop/shop-types";
import type { AppUser } from "@/app/lib/types";

type ShopSidePanelProps = {
  user: AppUser;
  dashboard: ShopDashboard;
};

export function ShopSidePanel({ user, dashboard }: ShopSidePanelProps) {
  const displayName = user.full_name?.trim() || user.email || "Founder";

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
          <PointsBalanceLink points={dashboard.pointsBalance} returnTo="/shop" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Balances</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Comment upvotes</dt>
            <dd className="font-medium text-zinc-900 tabular-nums">
              {dashboard.availableUpvotes} / {dashboard.totalUpvotes}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Affiliate referrals</dt>
            <dd className="font-medium text-zinc-900 tabular-nums">
              {dashboard.availableAffiliates} / {dashboard.joinedAffiliates}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Current rates</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Upvotes</dt>
            <dd className="font-medium text-zinc-900">
              {dashboard.upvotesPerPoint} → {formatDisplayPoints(1)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Affiliates</dt>
            <dd className="font-medium text-zinc-900">
              {formatAffiliateExchangeArrow(dashboard.affiliatesPerPoint)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Quick links</h3>
        <ul className="mt-3 space-y-2 text-xs">
          <li>
            <Link
              href="/buy-points?return=/shop"
              className="font-medium text-[#da552f] hover:underline"
            >
              Buy points →
            </Link>
          </li>
          {dashboard.affiliatesEnabled ? (
            <li>
              <Link
                href="/affiliates"
                className="font-medium text-[#da552f] hover:underline"
              >
                Affiliates →
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href="/my-projects"
              className="font-medium text-[#da552f] hover:underline"
            >
              My Projects →
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
