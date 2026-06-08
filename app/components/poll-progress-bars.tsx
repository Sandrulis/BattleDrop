import type { PollOption } from "@/app/lib/polls/poll-types";

type PollProgressBarsProps = {
  options: PollOption[];
  totalVotes: number;
  highlightOptionId?: string | null;
  compact?: boolean;
};

function formatPercent(voteCount: number, totalVotes: number) {
  if (totalVotes === 0) return 0;
  return Math.round((voteCount / totalVotes) * 100);
}

export function PollProgressBars({
  options,
  totalVotes,
  highlightOptionId = null,
  compact = false,
}: PollProgressBarsProps) {
  return (
    <ul className={compact ? "space-y-2.5" : "space-y-3"}>
      {options.map((option) => {
        const percent = formatPercent(option.voteCount, totalVotes);
        const isHighlighted = highlightOptionId === option.id;

        return (
          <li key={option.id}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={`font-medium ${
                  isHighlighted ? "text-[#da552f]" : "text-zinc-700"
                }`}
              >
                {option.label}
                {isHighlighted ? (
                  <span className="ml-1.5 font-normal text-zinc-500">
                    (your vote)
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-500">
                {percent}% · {option.voteCount}
              </span>
            </div>
            <div
              className={`mt-1.5 overflow-hidden rounded-full bg-zinc-100 ${
                compact ? "h-1.5" : "h-2"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighlighted ? "bg-[#da552f]" : "bg-zinc-400"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
