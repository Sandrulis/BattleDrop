"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerBalanceBadgeClassName } from "@/app/components/header-control-styles";
import { Tooltip } from "@/app/components/tooltip";
import {
  formatDisplayPoints,
  formatPointsAmount,
} from "@/app/lib/site-settings/format-display-money";
import { buildBuyPointsPath } from "@/app/lib/users/buy-points-path";

type PointsBalanceLinkProps = {
  points: number;
  returnTo?: string;
  variant?: "badge" | "inline" | "display";
};

const badgeClassName = headerBalanceBadgeClassName;

function PointsBalanceContent({ points }: { points: number }) {
  return (
    <>
      <i className="fas fa-money-bill-wave text-emerald-600" aria-hidden />
      <span>{formatPointsAmount(points)}</span>
    </>
  );
}

export function PointsBalanceLink({
  points,
  returnTo,
  variant = "badge",
}: PointsBalanceLinkProps) {
  const pathname = usePathname();
  const href = buildBuyPointsPath(returnTo ?? pathname);

  if (variant === "display") {
    return (
      <span
        className={badgeClassName}
        aria-label={`${formatPointsAmount(points)} points`}
      >
        <PointsBalanceContent points={points} />
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <Link
        href={href}
        className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-[#da552f]"
        aria-label={`${formatPointsAmount(points)} points — buy more`}
      >
        <i className="fas fa-money-bill-wave text-emerald-600" aria-hidden />
        Your balance:{" "}
        <span className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          {formatDisplayPoints(points)}
        </span>
      </Link>
    );
  }

  return (
    <Tooltip label="Points" cursorHelp={false}>
      <Link
        href={href}
        className={`${badgeClassName} cursor-pointer transition-colors hover:border-[#da552f]/30 hover:bg-[#da552f]/5`}
        aria-label={`${formatPointsAmount(points)} points — buy more`}
      >
        <PointsBalanceContent points={points} />
      </Link>
    </Tooltip>
  );
}
