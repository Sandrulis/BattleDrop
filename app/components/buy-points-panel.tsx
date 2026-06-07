"use client";

import { Toast, useToast } from "@/app/components/toast";
import {
  formatDisplayMoney,
  formatPointsAmount,
} from "@/app/lib/site-settings/format-display-money";
import type { CurrencyCode } from "@/app/lib/site-settings-types";

const POINT_PACKAGES = [
  { points: 5, price: 5 },
  { points: 10, price: 9 },
  { points: 25, price: 20 },
] as const;

type BuyPointsPanelProps = {
  balance: number;
  currency: CurrencyCode;
};

export function BuyPointsPanel({
  balance,
  currency,
}: BuyPointsPanelProps) {
  const { toast, showToast, dismissToast } = useToast();

  const handlePurchase = (points: number) => {
    showToast(
      `Stripe checkout for ${formatPointsAmount(points)} points is coming soon.`,
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <i className="fas fa-money-bill-wave text-emerald-600" aria-hidden />
            Current balance
          </p>
          <p className="text-2xl font-semibold tracking-tight text-zinc-900">
            {formatPointsAmount(balance)} points
          </p>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-zinc-600">
          Buy points to publish projects in the weekly battle and promote your
          entries on the leaderboard. Payment via Stripe will be available soon.
        </p>

        <ul className="mt-6 space-y-3">
          {POINT_PACKAGES.map((pkg) => (
            <li key={pkg.points}>
              <button
                type="button"
                onClick={() => handlePurchase(pkg.points)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left transition-colors hover:border-[#da552f]/30 hover:bg-[#da552f]/5"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {formatPointsAmount(pkg.points)} points
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    One-time purchase
                  </p>
                </div>
                <span className="text-sm font-medium text-[#da552f]">
                  {formatDisplayMoney(pkg.price, currency)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
