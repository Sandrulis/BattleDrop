import Link from "next/link";
import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { UserAvatar } from "@/app/components/user-avatar";
import { getHomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import { PROMOTED_SLOT_DEFINITIONS } from "@/app/lib/promoted-slots/constants";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import type { AppUser } from "@/app/lib/types";

type BuyPointsSidePanelProps = {
  user: AppUser;
  returnTo: string;
};

export async function BuyPointsSidePanel({
  user,
  returnTo,
}: BuyPointsSidePanelProps) {
  const homeBattleWeek = await getHomeBattleWeek();
  const publishPriceLabel = formatDisplayPoints(homeBattleWeek.submitPrice);
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
          <PointsBalanceLink points={user.points} returnTo={returnTo} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">What points buy</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Battle publish</dt>
            <dd className="font-medium text-zinc-900">{publishPriceLabel}</dd>
          </div>
          {PROMOTED_SLOT_DEFINITIONS.map((slot) => (
            <div key={slot.spot} className="flex justify-between gap-4">
              <dt className="text-zinc-500">Promoted spot {slot.spot}</dt>
              <dd className="font-medium text-zinc-900">
                {formatDisplayPoints(slot.price)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          Stripe checkout is coming soon. Purchased points stay on your account
          until you publish or promote.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Quick links</h3>
        <ul className="mt-3 space-y-2 text-xs">
          <li>
            <Link
              href={returnTo}
              className="font-medium text-[#da552f] hover:underline"
            >
              Back →
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
