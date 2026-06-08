import { headerBalanceBadgeClassName } from "@/app/components/header-control-styles";
import { Tooltip } from "@/app/components/tooltip";

type UserCommentUpvoteBalanceProps = {
  count: number;
};

export function UserCommentUpvoteBalance({
  count,
}: UserCommentUpvoteBalanceProps) {
  return (
    <Tooltip label="Upvotes">
      <span
        className={headerBalanceBadgeClassName}
        aria-label={`${count} comment upvotes received`}
      >
        <i className="fas fa-star text-[#da552f]" aria-hidden />
        <span className="tabular-nums">{count}</span>
      </span>
    </Tooltip>
  );
}