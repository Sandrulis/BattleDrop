"use client";

import { useEffect, useState } from "react";
import {
  COUNTDOWN_PLACEHOLDER,
  getCountdown,
  type CountdownState,
} from "../lib/countdown";
import { formatBattleWeekRange } from "../lib/battle-week";
import type { Battle } from "../lib/types";
import { useSiteDateSettings } from "./site-date-settings-provider";

type BattleHeroProps = {
  battle: Battle;
};

export function BattleHero({ battle }: BattleHeroProps) {
  const dateSettings = useSiteDateSettings();
  const isVoting = battle.phase === "voting";
  const filled = battle.projectsSubmitted >= battle.projectsRequired;

  // null until mount — avoids SSR/client Date.now() hydration mismatch
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!isVoting) return;

    const tick = () => {
      setCountdown(getCountdown(battle.votingOpensAt, battle.votingEndsAt));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [battle.votingOpensAt, battle.votingEndsAt, isVoting]);

  const progressPercent = countdown
    ? Math.round(countdown.remainingRatio * 100)
    : 0;

  return (
    <section
      id="battle"
      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#da552f]">
              Weekly battle
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Week {battle.week}, {battle.year}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {formatBattleWeekRange(battle.week, battle.year, dateSettings)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isVoting
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isVoting ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`}
              />
              {isVoting ? "Voting open" : "Collecting projects"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <StatPill label="Tier" value="Week → Month → Year" />
          <StatPill label="Entry" value="€5 or 5 points" />
          <StatPill label="Month leader" value={battle.monthChampion} />
        </div>

        {!filled && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-zinc-600">
              <span>Battle starts at 20 projects</span>
              <span>
                {battle.projectsSubmitted}/{battle.projectsRequired}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-[#da552f] transition-all"
                style={{
                  width: `${(battle.projectsSubmitted / battle.projectsRequired) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {filled && isVoting && (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Voting opened 24h after battle start · Sign in with Google to vote
            </p>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {countdown?.isEnded ? "Voting closed" : "Voting ends in"}
              </p>
              <p
                className="mt-0.5 font-mono text-lg font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {countdown?.label ?? COUNTDOWN_PLACEHOLDER}
              </p>
            </div>
          </div>
        )}
      </div>

      {filled && isVoting && (
        <div
          className="h-1.5 w-full bg-zinc-100"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time remaining until voting ends"
        >
          <div
            className="h-full origin-left bg-gradient-to-r from-[#da552f] to-[#e86b4a] transition-[width] duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="text-sm font-medium text-zinc-800">{value}</p>
    </div>
  );
}
