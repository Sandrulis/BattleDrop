"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ARCHIVE_ACTIVE_WEEK_ELEMENT_ID,
  type ArchiveProject,
  type WeekStatus,
} from "../lib/archive";
import { CommentButton, VoteButton } from "./vote-comment-buttons";

type ArchiveWeekCardProps = {
  week: number;
  year: number;
  status: WeekStatus;
  topProducts: ArchiveProject[];
  isLive: boolean;
};

function podiumBackgroundClass(rankIndex: number): string {
  switch (rankIndex) {
    case 0:
      return "border-yellow-400/80 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-50";
    case 1:
      return "border-slate-400/75 bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50/50";
    case 2:
      return "border-[#b8734a]/70 bg-gradient-to-br from-[#f2dcc6] via-[#e6b98a] to-[#d49a6a]";
    default:
      return "border-zinc-200 bg-white";
  }
}

export function ArchiveWeekCard({
  week,
  year,
  status,
  topProducts,
  isLive,
}: ArchiveWeekCardProps) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});

  const borderClass = isLive
    ? "border-[#da552f] bg-gradient-to-br from-[#da552f]/10 via-orange-50/60 to-white ring-2 ring-[#da552f]/20"
    : status === "completed"
      ? "border-zinc-200 bg-gradient-to-br from-zinc-100/80 via-zinc-50/90 to-white shadow-sm"
      : "border-zinc-200 bg-gradient-to-br from-zinc-100/50 to-zinc-50/70";

  const sortedProducts = useMemo(() => {
    if (!isLive) {
      return topProducts.map((product, index) => ({
        product,
        index,
        displayVotes: product.votes,
        voted: false,
      }));
    }

    return [...topProducts]
      .map((product) => ({
        product,
        displayVotes: product.votes + (voteDeltas[product.id] ?? 0),
        voted: votedIds.has(product.id),
      }))
      .sort((a, b) => b.displayVotes - a.displayVotes)
      .map((entry, index) => ({ ...entry, index }));
  }, [topProducts, isLive, voteDeltas, votedIds]);

  function toggleVote(productId: string) {
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        setVoteDeltas((d) => ({ ...d, [productId]: (d[productId] ?? 0) - 1 }));
      } else {
        next.add(productId);
        setVoteDeltas((d) => ({ ...d, [productId]: (d[productId] ?? 0) + 1 }));
      }
      return next;
    });
  }

  return (
    <article
      id={isLive ? ARCHIVE_ACTIVE_WEEK_ELEMENT_ID : undefined}
      className={`overflow-hidden rounded-xl border ${borderClass} ${isLive ? "scroll-mt-24" : ""}`}
    >
      <div
        className={`flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4 ${
          isLive
            ? "border-orange-100/80 bg-white/50"
            : "border-zinc-200/80 bg-white/40"
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wide ${
            isLive ? "text-[#da552f]" : "text-zinc-500"
          }`}
        >
          Week {week}, {year}
        </span>
        {isLive && (
          <Link
            href="/#battle"
            className="relative z-10 text-[10px] font-semibold text-[#da552f] hover:underline"
          >
            Live battle →
          </Link>
        )}
        {status === "upcoming" && (
          <span className="text-[10px] font-medium text-zinc-400">Upcoming</span>
        )}
        {status === "completed" && topProducts.length > 0 && (
          <span className="text-[10px] font-medium text-emerald-600">Completed</span>
        )}
      </div>

      {sortedProducts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2.5 p-3 min-[480px]:grid-cols-2 sm:p-4 lg:grid-cols-5">
          {sortedProducts.map((entry) => (
            <ArchiveProductRow
              key={entry.product.id}
              product={entry.product}
              index={entry.index}
              displayVotes={entry.displayVotes}
              voted={entry.voted}
              isLive={isLive}
              onVote={
                isLive ? () => toggleVote(entry.product.id) : undefined
              }
            />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-zinc-400">
          No battle yet
        </p>
      )}
    </article>
  );
}

function ArchiveProductRow({
  product,
  index,
  displayVotes,
  voted,
  isLive,
  onVote,
}: {
  product: ArchiveProject;
  index: number;
  displayVotes: number;
  voted: boolean;
  isLive: boolean;
  onVote?: () => void;
}) {
  const href = `/products/${product.id}`;
  const surfaceClass = podiumBackgroundClass(index);

  return (
    <li
      className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-1 rounded-lg border p-1.5 shadow-sm transition-[border-color,box-shadow] sm:gap-1.5 sm:p-2 ${surfaceClass} hover:border-zinc-300 hover:shadow-md`}
    >
      {!isLive ? (
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-lg"
          aria-label={`View ${product.name}`}
        />
      ) : null}

      <VoteButton
        compact
        count={displayVotes}
        voted={voted}
        onClick={() => onVote?.()}
        disabled={!isLive}
        className={`relative z-[2] ${isLive ? "" : "pointer-events-none"}`}
      />

      {isLive ? (
        <Link
          href={href}
          className="relative z-[1] min-w-0 px-0.5 transition-colors hover:text-[#da552f]"
        >
          <p className="truncate text-[11px] font-semibold leading-tight text-zinc-900 sm:text-xs">
            #{index + 1} {product.name}
          </p>
          <p className="truncate text-[9px] leading-tight text-zinc-500 sm:text-[10px]">
            {product.maker}
          </p>
        </Link>
      ) : (
        <div className="relative z-[1] min-w-0 px-0.5 pointer-events-none">
          <p className="truncate text-[11px] font-semibold leading-tight text-zinc-900 sm:text-xs">
            #{index + 1} {product.name}
          </p>
          <p className="truncate text-[9px] leading-tight text-zinc-500 sm:text-[10px]">
            {product.maker}
          </p>
        </div>
      )}

      <CommentButton
        compact
        count={product.comments}
        itemName={product.name}
        href={href}
        className="relative z-[2]"
      />
    </li>
  );
}
