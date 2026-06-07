"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  resolveBattleWeekDisplayStatus,
  type BattleWeekTiming,
} from "../lib/battle-week-status";
import { buildLeaderboard, buildLeaderboardInFixedOrder, type DisplayProduct } from "../lib/build-leaderboard";
import type { BookedPromotedSlot } from "@/app/lib/promoted-slots/types";
import type { Product } from "../lib/types";
import { ProjectLogo } from "./project-logo";
import { CommentButton, VoteButton } from "./vote-comment-buttons";

type ProductFeedProps = {
  initialProducts: Product[];
  bookedPromotedSlots?: BookedPromotedSlot[];
  shuffleBeforeVoting?: boolean;
  timing: BattleWeekTiming;
};

export function ProductFeed({
  initialProducts,
  bookedPromotedSlots = [],
  shuffleBeforeVoting = false,
  timing,
}: ProductFeedProps) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});
  const [votingOpen, setVotingOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const status = resolveBattleWeekDisplayStatus(new Date(), timing);
      setVotingOpen(status === "voting_open");
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timing]);



  const entries = useMemo(() => {

    const withVotes = initialProducts.map((p) => ({

      ...p,

      displayVotes: p.votes + (voteDeltas[p.id] ?? 0),

    }));



    return shuffleBeforeVoting
      ? buildLeaderboardInFixedOrder(withVotes, bookedPromotedSlots)
      : buildLeaderboard(withVotes, bookedPromotedSlots);
  }, [initialProducts, voteDeltas, shuffleBeforeVoting, bookedPromotedSlots]);



  function toggleVote(id: string) {
    if (!votingOpen) return;

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



  return (

    <section aria-label="Product leaderboard">

      <div className="mb-3 flex items-center justify-between">

        <h2 className="text-sm font-semibold text-zinc-900">This Week&apos;s leaderboard</h2>

        <p className="text-xs text-zinc-500">
          {entries.length} projects
          {shuffleBeforeVoting
            ? " · order shuffled on refresh"
            : " · ranked by votes"}
          <span className="text-zinc-400">
            {votingOpen ? " · sign in to vote" : " · voting opens soon"}
          </span>
        </p>

      </div>



      {initialProducts.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-900">No projects yet</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            The leaderboard is empty for now and waiting for this week&apos;s
            submissions.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {entries.map((entry) => (
            <ProductRow
              key={`${entry.product.id}-${entry.promoted ? "p" : "o"}-${entry.organicRank ?? entry.voteRank}`}
              product={entry.product}
              organicRank={entry.organicRank}
              voteRank={entry.voteRank}
              voted={votedIds.has(entry.product.id)}
              onVote={() => toggleVote(entry.product.id)}
              votingOpen={votingOpen}
              promoted={entry.promoted}
            />
          ))}
        </ol>
      )}
    </section>

  );

}



type ProductRowProps = {

  product: DisplayProduct;

  organicRank: number | null;

  voteRank: number;

  voted: boolean;

  onVote: () => void;
  votingOpen: boolean;
  promoted?: boolean;
};

function ProductRow({
  product,
  organicRank,
  voteRank,
  voted,
  onVote,
  votingOpen,
  promoted = false,
}: ProductRowProps) {

  return (

    <li

      id={promoted ? `promoted-row-${product.id}` : undefined}

      className={`group grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl border p-2.5 transition-shadow sm:gap-4 sm:p-4 ${

        promoted

          ? "promoted-row"

          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"

      }`}

    >

      <VoteButton
        count={product.displayVotes}
        voted={voted}
        onClick={onVote}
        disabled={!votingOpen}
      />



      <Link

        href={`/products/${product.id}`}

        className={`flex min-h-[44px] min-w-0 gap-2.5 rounded-lg py-0.5 transition-colors sm:gap-4 ${

          promoted ? "promoted-row__link" : "active:bg-zinc-50/80 sm:hover:bg-zinc-50/80"

        }`}

      >

        <ProjectLogo
          name={product.name}
          faviconUrl={product.faviconUrl}
          logo={product.logo}
          logoBg={product.logoBg}
        />



        <div className="min-w-0 flex-1 py-0.5">

          <div className="flex flex-wrap items-center gap-2">

            <span

              className={promoted ? "promoted-rank" : "text-xs font-medium text-zinc-400"}

            >

              #{promoted ? voteRank : organicRank}

            </span>

            <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-[#da552f]">

              {product.name}

            </h3>

            {promoted && (

              <span id={`promoted-badge-${product.id}`} className="promoted-badge">

                Promoted

              </span>

            )}

          </div>

          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 sm:line-clamp-1">

            {product.tagline}

          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-zinc-500">

            <span

              role="link"

              tabIndex={0}

              onClick={(e) => {

                e.preventDefault();

                e.stopPropagation();

                window.open(`https://${product.url}`, "_blank", "noopener,noreferrer");

              }}

              onKeyDown={(e) => {

                if (e.key === "Enter" || e.key === " ") {

                  e.preventDefault();

                  e.stopPropagation();

                  window.open(`https://${product.url}`, "_blank", "noopener,noreferrer");

                }

              }}

              className="font-medium text-zinc-700 underline-offset-2 hover:text-[#da552f] hover:underline"

            >

              {product.url}

            </span>

            <span className="hidden text-zinc-300 sm:inline">·</span>

            <span>{product.maker}</span>

            {product.topics.map((topic) => (

              <span

                key={topic}

                className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600"

              >

                {topic}

              </span>

            ))}

          </div>

        </div>

      </Link>



      <CommentButton

        count={product.comments}

        itemName={product.name}

        href={`/products/${product.id}`}

        className="justify-self-end"

      />

    </li>

  );

}

