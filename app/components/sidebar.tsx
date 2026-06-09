import Link from "next/link";
import { AffiliateCopyLinkButton } from "@/app/components/affiliate-copy-link-button";
import { SidebarPoll } from "@/app/components/sidebar-poll";
import type { HomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import {
  formatHallOfFameWeekLabel,
  type PreviousWeekHallOfFame,
} from "@/app/lib/hall-of-fame/get-previous-week-hall-of-fame";
import type { HomePoll } from "@/app/lib/polls/poll-types";
import { formatBattleStartHoursLabel } from "@/app/lib/battle-week-status";
import {
  formatAffiliateExchangeArrow,
  formatAffiliateHomeSidebarBlurb,
} from "@/app/lib/shop/format-shop-exchange-rate";
import { formatDisplayMoney, formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getEffectiveCurrencyForUser } from "@/app/lib/users/user-currency-preferences";

type SidebarProps = {
  homeBattleWeek: HomeBattleWeek;
  poll?: HomePoll | null;
  previousWeekHallOfFame?: PreviousWeekHallOfFame | null;
  isSignedIn?: boolean;
  affiliatesEnabled?: boolean;
  affiliatesPerPoint?: number;
  affiliateLink?: string;
};

export async function Sidebar({
  homeBattleWeek,
  poll = null,
  previousWeekHallOfFame = null,
  isSignedIn = false,
  affiliatesEnabled = false,
  affiliatesPerPoint,
  affiliateLink,
}: SidebarProps) {
  const { battle, battleStartHoursFromWeekStart, submitPrice, winnerMoneyPrice } =
    homeBattleWeek;
  const user = await getCurrentAppUser();
  const currency = await getEffectiveCurrencyForUser(user?.id ?? null);
  const entryFeeLabel = formatDisplayPoints(submitPrice);
  const winnerPrizeLabel =
    winnerMoneyPrice > 0
      ? formatDisplayMoney(winnerMoneyPrice, currency)
      : null;
  const battleStartHoursLabel = formatBattleStartHoursLabel(
    battleStartHoursFromWeekStart,
  );

  return (
    <aside className="flex flex-col gap-4">
      {poll ? (
        <SidebarPoll initialPoll={poll} isSignedIn={isSignedIn} />
      ) : null}

      <div id="how" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">
          This week&apos;s battle rules
        </h3>
        <ol className="mt-3 space-y-3 text-xs leading-relaxed text-zinc-600">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              1
            </span>
            <span>
              Each user can submit one product this week ({entryFeeLabel}).
              {battle.minProjectsEnabled ? (
                <>
                  {" "}
                  Battle starts at {battle.projectsRequired} projects.
                </>
              ) : null}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              2
            </span>
            <span>
              Voting opens{" "}
              <span className="font-semibold text-zinc-800">
                {battleStartHoursLabel}
              </span>{" "}
              after week start.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              3
            </span>
            <span>
              Once voting has started, you can no longer add a project to this
              week — apply for the next available week instead.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              4
            </span>
            <span>
              Anyone with a Google account can vote once per day.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              5
            </span>
            <span>
              Until voting opens, project order is shuffled on each page refresh
              so no project gets a placement advantage.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              6
            </span>
            <span>
              Weekly winner{winnerPrizeLabel ? ` (${winnerPrizeLabel} cash prize)` : ""}{" "}
              → monthly championship → December Grand Prix.
            </span>
          </li>
        </ol>
      </div>

      {previousWeekHallOfFame ? (
        <div
          id="hall"
          className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">Hall of Fame</h3>
            <span className="text-xs font-medium text-zinc-500">
              {formatHallOfFameWeekLabel(
                previousWeekHallOfFame.week,
                previousWeekHallOfFame.year,
              )}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {previousWeekHallOfFame.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 text-xs font-medium text-zinc-700"
              >
                <span className="text-amber-500">★</span>
                {entry.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {affiliatesEnabled && affiliatesPerPoint !== undefined ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Referrals & points</h3>
          <p className="mt-2 text-xs font-medium text-zinc-700">
            Shop rate: {formatAffiliateExchangeArrow(affiliatesPerPoint)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {formatAffiliateHomeSidebarBlurb(affiliatesPerPoint, entryFeeLabel)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/affiliates"
              className="inline-flex rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              Affiliates
            </Link>
            {affiliateLink ? (
              <AffiliateCopyLinkButton affiliateLink={affiliateLink} />
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
