import Link from "next/link";
import { headerBalanceBadgeClassName } from "@/app/components/header-control-styles";
import { Tooltip } from "@/app/components/tooltip";

type UserAffiliateBalanceProps = {
  count: number;
};

export function UserAffiliateBalance({ count }: UserAffiliateBalanceProps) {
  return (
    <Tooltip label="Affiliates" cursorHelp={false}>
      <Link
        href="/affiliates"
        className={`${headerBalanceBadgeClassName} cursor-pointer transition-colors hover:border-[#da552f]/30 hover:bg-[#da552f]/5`}
        aria-label={`${count} available affiliates`}
      >
        <i className="fas fa-user-tag text-[#da552f]" aria-hidden />
        <span className="tabular-nums">{count}</span>
      </Link>
    </Tooltip>
  );
}