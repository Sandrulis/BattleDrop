"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COUNTDOWN_PLACEHOLDER,
  getCountdown,
  type CountdownState,
} from "../lib/countdown";
import { getProductIdByName, monthlyBattle } from "../lib/mock-data";
import { CommentButton, VoteButton } from "./vote-comment-buttons";

export function MonthBattleBanner() {
  const isVoting = monthlyBattle.phase === "voting";

  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isVoting) return;

    const tick = () => {
      setCountdown(
        getCountdown(monthlyBattle.votingOpensAt, monthlyBattle.votingEndsAt),
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isVoting]);

  const sortedContenders = useMemo(() => {
    return [...monthlyBattle.contenders]
      .map((entry) => ({
        ...entry,
        displayVotes: entry.votes + (voteDeltas[entry.id] ?? 0),
      }))
      .sort((a, b) => b.displayVotes - a.displayVotes);
  }, [voteDeltas]);

  function toggleVote(id: string) {
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setVoteDeltas((d) => ({ ...d, [id]: (d[id] ?? 0) - 1 }));
      } else {
        next.add(id);
        setVoteDeltas((d) => ({ ...d, [id]: (d[id] ?? 0) + 1 }));
      }
      return next;
    });
  }

  const progressPercent = countdown
    ? Math.round(countdown.remainingRatio * 100)
    : 0;

  return (
    <section
      id="month"
      className="relative mb-6 overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 via-amber-50/80 to-white shadow-sm"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#da552f] text-xs font-bold text-white">
              M
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#da552f]">
                  Running in parallel
                </p>
                {isVoting && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
                    Monthly voting open
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
                {monthlyBattle.month} {monthlyBattle.year} Championship
              </h2>
              <p className="mt-1 max-w-lg text-sm text-zinc-600">
                {monthlyBattle.weeklyWinnersCount} weekly winners are battling for
                this month&apos;s crown while the current week vote continues below.
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-5">
          {sortedContenders.map((entry, index) => (
            <li
              key={entry.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-1 rounded-lg border border-orange-100/80 bg-white/90 p-1.5 sm:gap-1.5 sm:p-2"
            >
              <VoteButton
                compact
                count={entry.displayVotes}
                voted={votedIds.has(entry.id)}
                onClick={() => toggleVote(entry.id)}
              />
              <div className="min-w-0 px-0.5">
                <p className="truncate text-[11px] font-semibold leading-tight text-zinc-900 sm:text-xs">
                  #{index + 1} {entry.name}
                </p>
                <p className="truncate text-[9px] leading-tight text-zinc-500 sm:text-[10px]">
                  {entry.weekLabel}
                </p>
              </div>
              <CommentButton
                compact
                count={entry.comments}
                itemName={entry.name}
                href={
                  getProductIdByName(entry.name)
                    ? `/products/${getProductIdByName(entry.name)}`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>

        {isVoting && (
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {countdown?.isEnded ? "Voting closed" : "Monthly voting ends in"}
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

      {isVoting && (
        <div
          className="h-1.5 w-full bg-orange-100/80"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time remaining until monthly voting ends"
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
