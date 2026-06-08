"use client";

import { useEffect, useState } from "react";
import {
  BATTLE_WEEK_STATUS_BADGE,
  formatBattleStartHoursLabel,
  resolveBattleWeekDisplayStatus,
  type BattleWeekDisplayStatus,
  type BattleWeekTiming,
} from "../lib/battle-week-status";
import {
  COUNTDOWN_PLACEHOLDER,
  getCountdown,
  getCountdownTo,
  type CountdownState,
} from "../lib/countdown";
import { formatDisplayPoints } from "../lib/site-settings/format-display-money";
import type { Battle } from "../lib/types";

type BattleHeroProps = {
  battle: Battle;
  battleStartHoursFromWeekStart: number;
  submitPrice: number;
  timing: BattleWeekTiming;
  weekRangeLabel: string;
};

type BattleHeroCountdown = {
  status: BattleWeekDisplayStatus;
  weekStartCountdown: CountdownState | null;
  votingCountdown: CountdownState | null;
};

export function BattleHero({
  battle,
  battleStartHoursFromWeekStart,
  submitPrice,
  timing,
  weekRangeLabel,
}: BattleHeroProps) {
  const minProjectsMet =
    battle.minProjectsEnabled &&
    battle.projectsSubmitted >= battle.projectsRequired;

  const [state, setState] = useState<BattleHeroCountdown>({
    status: "upcoming",
    weekStartCountdown: null,
    votingCountdown: null,
  });

  useEffect(() => {
    const tick = () => {
      const status = resolveBattleWeekDisplayStatus(new Date(), timing);
      let weekStartCountdown: CountdownState | null = null;
      let votingCountdown: CountdownState | null = null;

      if (status === "upcoming") {
        weekStartCountdown = getCountdownTo(timing.weekStart);
        votingCountdown = getCountdownTo(timing.votingOpensAt);
      } else if (status === "awaiting_voting") {
        const totalMs =
          new Date(timing.votingOpensAt).getTime() -
          new Date(timing.weekStart).getTime();
        votingCountdown = getCountdownTo(timing.votingOpensAt, { totalMs });
      } else if (status === "voting_open") {
        votingCountdown = getCountdown(timing.votingOpensAt, timing.votingEndsAt);
      }

      setState({ status, weekStartCountdown, votingCountdown });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timing]);

  const badge = BATTLE_WEEK_STATUS_BADGE[state.status];
  const showProjectProgress =
    battle.minProjectsEnabled &&
    !minProjectsMet &&
    state.status !== "closed";
  const showStandardFooter = !showProjectProgress;
  const showVotingProgressBar = state.status === "voting_open";
  const progressPercent = state.votingCountdown
    ? Math.round(state.votingCountdown.remainingRatio * 100)
    : 0;
  const battleStartHoursLabel = formatBattleStartHoursLabel(
    battleStartHoursFromWeekStart,
  );

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
              <span className="ml-2 text-lg font-medium text-zinc-500 sm:text-xl">
                · {formatDisplayPoints(submitPrice)} per submit
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{weekRangeLabel}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.containerClass}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
              />
              {badge.label}
            </span>
          </div>
        </div>

        {showProjectProgress && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-zinc-600">
              <span>Battle starts at {battle.projectsRequired} projects</span>
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

        {showStandardFooter && (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          {state.status === "upcoming" ? (
            <p className="text-xs text-zinc-500">
              Week starts in{" "}
              <span
                className="font-mono font-semibold tabular-nums text-zinc-700"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.weekStartCountdown?.label ?? COUNTDOWN_PLACEHOLDER}
              </span>
              {" · "}Voting opens{" "}
              <span className="font-semibold text-zinc-700">
                {battleStartHoursLabel}
              </span>{" "}
              after week start
            </p>
          ) : state.status === "closed" ? (
            <p className="text-xs text-zinc-500">This battle week has ended</p>
          ) : (
            <p className="text-xs text-zinc-500">
              Voting opens{" "}
              <span className="font-semibold text-zinc-700">
                {battleStartHoursLabel}
              </span>{" "}
              after battle start · Sign in with Google to vote
            </p>
          )}

          {state.status === "closed" ? (
            <div className="ml-auto text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                Voting closed
              </p>
              <p className="mt-0.5 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
                Voting ended
              </p>
            </div>
          ) : (
            <div className="ml-auto text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {state.status === "upcoming" || state.status === "awaiting_voting"
                  ? "Voting opens in"
                  : state.votingCountdown?.isEnded
                    ? "Voting closed"
                    : "Voting ends in"}
              </p>
              <p
                className="mt-0.5 font-mono text-lg font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.votingCountdown?.label ?? COUNTDOWN_PLACEHOLDER}
              </p>
            </div>
          )}
          </div>
        )}
      </div>

      {showVotingProgressBar && (
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
