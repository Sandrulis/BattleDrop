import Link from "next/link";
import type { ArchiveWinnerProduct, WeekStatus } from "../lib/archive-data";
import { getProductIdByName } from "../lib/mock-data";
import { CommentButton, VoteButton } from "./vote-comment-buttons";

type ArchiveWeekCardProps = {
  week: number;
  year: number;
  status: WeekStatus;
  product: ArchiveWinnerProduct | null;
  isLive: boolean;
};

export function ArchiveWeekCard({
  week,
  year,
  status,
  product,
  isLive,
}: ArchiveWeekCardProps) {
  const borderClass = isLive
    ? "border-[#da552f] bg-[#da552f]/5 ring-2 ring-[#da552f]/20"
    : status === "completed"
      ? "border-zinc-200 bg-white"
      : "border-zinc-100 bg-zinc-50/80";

  return (
    <article
      className={`overflow-hidden rounded-xl border ${borderClass}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100/80 bg-zinc-50/50 px-3 py-2 sm:px-4">
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
            className="text-[10px] font-semibold text-[#da552f] hover:underline"
          >
            Live battle →
          </Link>
        )}
        {status === "upcoming" && (
          <span className="text-[10px] font-medium text-zinc-400">Upcoming</span>
        )}
      </div>

      {product ? (
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 sm:gap-4 sm:p-4">
          <VoteButton
            count={product.votes}
            voted={false}
            onClick={() => {}}
            className="pointer-events-none cursor-default"
          />
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl"
              style={{ backgroundColor: product.logoBg }}
            >
              {product.logo}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-zinc-900">
                  {product.name}
                </h3>
                {product.isPromoted && (
                  <span id={`promoted-badge-${product.name}`} className="promoted-badge">
                    Promoted
                  </span>
                )}
                {isLive && (
                  <span className="rounded-md bg-[#da552f]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#da552f]">
                    Voting now
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 sm:line-clamp-1">
                {product.tagline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-zinc-500">
                <a
                  href={`https://${product.url}`}
                  className="font-medium text-zinc-700 underline-offset-2 hover:text-[#da552f] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {product.url}
                </a>
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
          </div>
          <CommentButton
            count={product.comments}
            itemName={product.name}
            href={
              getProductIdByName(product.name)
                ? `/products/${getProductIdByName(product.name)}`
                : undefined
            }
            className={
              getProductIdByName(product.name)
                ? ""
                : "pointer-events-none cursor-default"
            }
          />
        </div>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-zinc-400">
          No battle yet
        </p>
      )}
    </article>
  );
}
