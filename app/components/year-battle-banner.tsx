"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COUNTDOWN_PLACEHOLDER,
  getCountdown,
  type CountdownState,
} from "../lib/countdown";
import { getProductIdByName, yearlyBattle } from "../lib/mock-data";
import { CommentButton, VoteButton } from "./vote-comment-buttons";

export function YearBattleBanner() {
  const isVoting = yearlyBattle.phase === "voting";

  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isVoting) return;

    const tick = () => {
      setCountdown(
        getCountdown(yearlyBattle.votingOpensAt, yearlyBattle.votingEndsAt),
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isVoting]);

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
      id="year"
      className="relative mb-6 overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-br from-[#12081f] via-[#231047] to-[#3d1245] shadow-lg shadow-purple-950/30"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(168,85,247,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-amber-950 shadow-md shadow-amber-900/40">
              Y
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  December Grand Prix
                </p>
                {isVoting && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                    Annual voting open
                  </span>
                )}
              </div>
              <h2 className="mt-1 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
                {yearlyBattle.year} Championship
              </h2>
              <p className="mt-1 max-w-xl text-sm text-violet-200/80">
                Twelve monthly champions — January through December — compete for
                the year&apos;s ultimate crown while weekly and monthly votes continue
                below.
              </p>
            </div>
          </div>

          {isVoting && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/60">
                {countdown?.isEnded ? "Voting closed" : "Annual voting ends in"}
              </p>
              <p
                className="mt-0.5 font-mono text-lg font-semibold tabular-nums tracking-tight text-amber-100 sm:text-xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {countdown?.label ?? COUNTDOWN_PLACEHOLDER}
              </p>
            </div>
          )}
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {yearlyBattle.contenders.map((entry) => {
            const displayVotes = entry.votes + (voteDeltas[entry.id] ?? 0);
            const productId = getProductIdByName(entry.name);
            const productHref = productId ? `/products/${productId}` : undefined;

            return (
              <li
                key={entry.id}
                className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-1 rounded-xl border border-amber-400/20 bg-white/95 p-1.5 shadow-sm shadow-purple-950/10 backdrop-blur-sm sm:gap-1.5 sm:p-2${
                  productHref ? " cursor-pointer" : ""
                }`}
              >
                {productHref ? (
                  <Link
                    href={productHref}
                    className="absolute inset-0 z-0 rounded-xl"
                    aria-label={`View ${entry.name}`}
                  />
                ) : null}
                <VoteButton
                  compact
                  count={displayVotes}
                  voted={votedIds.has(entry.id)}
                  onClick={() => toggleVote(entry.id)}
                  className="relative z-10"
                />
                <div className="relative z-10 min-w-0 px-0.5 pointer-events-none">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-amber-700/80 sm:text-[11px]">
                    {entry.monthLabel}
                  </p>
                  <p className="truncate text-[11px] font-semibold leading-tight text-zinc-900 sm:text-xs">
                    {entry.name}
                  </p>
                </div>
                <CommentButton
                  compact
                  count={entry.comments}
                  itemName={entry.name}
                  href={productHref}
                  className="relative z-10"
                />
              </li>
            );
          })}
        </ul>
      </div>

      {isVoting && (
        <div
          className="relative h-1.5 w-full bg-violet-950/80"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time remaining until annual voting ends"
        >
          <div
            className="h-full origin-left bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 transition-[width] duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </section>
  );
}
