import Link from "next/link";

type VoteButtonProps = {
  count: number;
  voted: boolean;
  onClick: () => void;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
};

export function VoteButton({
  count,
  voted,
  onClick,
  compact = false,
  className = "",
  disabled = false,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={
        disabled
          ? "Voting not open yet"
          : voted
            ? "Remove vote"
            : "Upvote"
      }
      className={`flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 transition-all ${
        disabled ? "cursor-not-allowed opacity-50" : "!cursor-pointer"
      } ${
        compact ? "w-9 px-0.5 py-1.5" : "w-[52px] px-1 py-2 sm:w-[56px]"
      } ${
        disabled
          ? "border-zinc-200 bg-zinc-50 text-zinc-400"
          : voted
            ? "border-[#da552f] bg-[#da552f]/5 text-[#da552f]"
            : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-[#da552f]/40 hover:bg-white"
      } ${className}`}
    >
      <ChevronUp
        className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} ${voted ? "fill-[#da552f]" : ""}`}
      />
      <span
        className={`font-semibold tabular-nums ${compact ? "text-xs" : "text-sm"}`}
      >
        {count}
      </span>
    </button>
  );
}

type CommentButtonProps = {
  count: number;
  itemName: string;
  href?: string;
  compact?: boolean;
  className?: string;
};

const commentButtonClass = (compact: boolean, className: string) =>
  `flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-zinc-200 bg-zinc-50 text-zinc-500 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-700 ${
    compact ? "w-9 px-0.5 py-1.5" : "w-[52px] px-1 py-2 sm:w-[56px]"
  } ${className}`;

export function CommentButton({
  count,
  itemName,
  href,
  compact = false,
  className = "",
}: CommentButtonProps) {
  const content = (
    <>
      <CommentIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span
        className={`font-semibold tabular-nums text-zinc-800 ${compact ? "text-xs" : "text-sm"}`}
      >
        {count}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${count} comments on ${itemName}`}
        className={commentButtonClass(compact, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${count} comments on ${itemName}`}
      className={commentButtonClass(compact, className)}
    >
      {content}
    </button>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
