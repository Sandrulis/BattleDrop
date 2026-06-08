type AuthorUpvoteBadgeProps = {
  count: number;
};

export function AuthorUpvoteBadge({ count }: AuthorUpvoteBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums text-zinc-500"
      aria-label={`${count} comment upvotes received`}
    >
      <i className="fas fa-star text-[11px] text-[#da552f]" aria-hidden />
      <span>{count}</span>
    </span>
  );
}
