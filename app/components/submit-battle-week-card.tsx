import { SubmitVotingOpensCountdown } from "@/app/components/submit-voting-opens-countdown";
import type { BattleWeekTiming } from "@/app/lib/battle-week-status";
import type { Battle } from "@/app/lib/types";

type SubmitBattleWeekCardProps = {
  battle: Battle;
  timing: BattleWeekTiming;
  entryFeeLabel: string;
};

export function SubmitBattleWeekCard({
  battle,
  timing,
  entryFeeLabel,
}: SubmitBattleWeekCardProps) {
  const minProjectsMet =
    battle.minProjectsEnabled &&
    battle.projectsSubmitted >= battle.projectsRequired;

  const progressPercent = battle.minProjectsEnabled
    ? Math.min(
        100,
        Math.round(
          (battle.projectsSubmitted / Math.max(battle.projectsRequired, 1)) * 100,
        ),
      )
    : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">
        Week {battle.week}, {battle.year}
      </h3>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Entry fee</dt>
          <dd className="font-medium text-zinc-900">{entryFeeLabel}</dd>
        </div>

        {battle.minProjectsEnabled ? (
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Battle starts at</dt>
              <dd className="font-medium text-zinc-900">
                {battle.projectsSubmitted}/{battle.projectsRequired} projects
              </dd>
            </div>
            {!minProjectsMet ? (
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-[#da552f] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Voting opens in</dt>
          <dd>
            <SubmitVotingOpensCountdown timing={timing} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
