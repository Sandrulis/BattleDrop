"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import {
  formatDisplayPoints,
  formatPointsAmount,
} from "@/app/lib/site-settings/format-display-money";
import { formatAffiliateReferralsPerPoint } from "@/app/lib/shop/format-shop-exchange-rate";
import {
  SHOP_INTEGRATION_KEY,
  type ShopDashboard,
} from "@/app/lib/shop/shop-types";

type ShopPanelProps = {
  initialDashboard: ShopDashboard;
  shopIntegrationEnabled: boolean;
};

export function ShopPanel({
  initialDashboard,
  shopIntegrationEnabled,
}: ShopPanelProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [upvotePoints, setUpvotePoints] = useState("1");
  const [affiliatePoints, setAffiliatePoints] = useState("1");
  const [redeemingUpvotes, setRedeemingUpvotes] = useState(false);
  const [redeemingAffiliates, setRedeemingAffiliates] = useState(false);

  const maxUpvotePoints = useMemo(
    () =>
      dashboard.upvotesPerPoint > 0
        ? Math.floor(dashboard.availableUpvotes / dashboard.upvotesPerPoint)
        : 0,
    [dashboard.availableUpvotes, dashboard.upvotesPerPoint],
  );

  const maxAffiliatePoints = useMemo(
    () =>
      dashboard.affiliatesPerPoint > 0
        ? Math.floor(dashboard.availableAffiliates / dashboard.affiliatesPerPoint)
        : 0,
    [dashboard.availableAffiliates, dashboard.affiliatesPerPoint],
  );

  async function redeemUpvotes() {
    if (redeemingUpvotes || !shopIntegrationEnabled) return;

    const points = Number(upvotePoints);
    if (!Number.isInteger(points) || points < 1) {
      showToast("Enter a valid number of points.", "error");
      return;
    }

    setRedeemingUpvotes(true);

    try {
      const response = await fetch("/api/shop/redeem-upvotes", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      const data = (await response.json()) as {
        pointsBalance?: number;
        availableUpvotes?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not redeem upvotes.");
      }

      setDashboard((current) => ({
        ...current,
        pointsBalance: data.pointsBalance ?? current.pointsBalance,
        availableUpvotes: data.availableUpvotes ?? current.availableUpvotes,
      }));
      showToast(
        `Redeemed ${formatDisplayPoints(points)} for comment upvotes.`,
        "success",
      );
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not redeem upvotes.",
        "error",
      );
    } finally {
      setRedeemingUpvotes(false);
    }
  }

  async function redeemAffiliates() {
    if (redeemingAffiliates || !shopIntegrationEnabled || !dashboard.affiliatesEnabled) {
      return;
    }

    const points = Number(affiliatePoints);
    if (!Number.isInteger(points) || points < 1) {
      showToast("Enter a valid number of points.", "error");
      return;
    }

    setRedeemingAffiliates(true);

    try {
      const response = await fetch("/api/shop/redeem-affiliates", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      const data = (await response.json()) as {
        pointsBalance?: number;
        availableAffiliates?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not redeem affiliates.");
      }

      setDashboard((current) => ({
        ...current,
        pointsBalance: data.pointsBalance ?? current.pointsBalance,
        availableAffiliates:
          data.availableAffiliates ?? current.availableAffiliates,
      }));
      showToast(
        `Redeemed ${formatDisplayPoints(points)} for affiliate referrals.`,
        "success",
      );
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not redeem affiliates.",
        "error",
      );
    } finally {
      setRedeemingAffiliates(false);
    }
  }

  const upvoteCost = Number(upvotePoints) * dashboard.upvotesPerPoint;
  const affiliateCost = Number(affiliatePoints) * dashboard.affiliatesPerPoint;

  return (
    <>
      {!shopIntegrationEnabled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Shop integration is disabled (
          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs text-red-900">
            {SHOP_INTEGRATION_KEY}
          </code>
          ). Exchanges are unavailable until an admin enables the integration.
        </div>
      ) : null}

      <div className="space-y-4">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Comment upvotes
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Exchange upvotes received on your comments for battle points.
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-zinc-900 tabular-nums">
                {dashboard.availableUpvotes} available
              </p>
              <p className="text-xs text-zinc-500">
                {dashboard.upvotesPerPoint} upvote
                {dashboard.upvotesPerPoint === 1 ? "" : "s"} per point
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="min-w-[8rem] flex-1">
              <span className="block text-sm font-medium text-zinc-700">
                Points to receive
              </span>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxUpvotePoints)}
                value={upvotePoints}
                onChange={(event) => setUpvotePoints(event.target.value)}
                disabled={!shopIntegrationEnabled || maxUpvotePoints < 1}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-50"
              />
            </label>
            <button
              type="button"
              onClick={redeemUpvotes}
              disabled={
                !shopIntegrationEnabled ||
                redeemingUpvotes ||
                maxUpvotePoints < 1 ||
                upvoteCost > dashboard.availableUpvotes
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c04a29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {redeemingUpvotes ? (
                <span
                  role="status"
                  aria-label="Loading"
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
              ) : null}
              Exchange
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            Cost: {formatPointsAmount(upvoteCost)} upvote
            {upvoteCost === 1 ? "" : "s"}
            {maxUpvotePoints > 0
              ? ` · up to ${formatDisplayPoints(maxUpvotePoints)}`
              : " · no upvotes available"}
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Affiliate referrals
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Exchange successful referrals for battle points.
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-zinc-900 tabular-nums">
                {dashboard.availableAffiliates} available
              </p>
              <p className="text-xs text-zinc-500">
                {formatAffiliateReferralsPerPoint(dashboard.affiliatesPerPoint)}
              </p>
            </div>
          </div>

          {!dashboard.affiliatesEnabled ? (
            <p className="mt-4 text-sm text-zinc-500">
              Affiliate exchanges require the affiliates integration to be enabled.
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap items-end gap-3">
                <label className="min-w-[8rem] flex-1">
                  <span className="block text-sm font-medium text-zinc-700">
                    Points to receive
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, maxAffiliatePoints)}
                    value={affiliatePoints}
                    onChange={(event) => setAffiliatePoints(event.target.value)}
                    disabled={!shopIntegrationEnabled || maxAffiliatePoints < 1}
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-50"
                  />
                </label>
                <button
                  type="button"
                  onClick={redeemAffiliates}
                  disabled={
                    !shopIntegrationEnabled ||
                    redeemingAffiliates ||
                    maxAffiliatePoints < 1 ||
                    affiliateCost > dashboard.availableAffiliates
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c04a29] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {redeemingAffiliates ? (
                    <span
                      role="status"
                      aria-label="Loading"
                      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                    />
                  ) : null}
                  Exchange
                </button>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Cost: {formatPointsAmount(affiliateCost)} referral
                {affiliateCost === 1 ? "" : "s"}
                {maxAffiliatePoints > 0
                  ? ` · up to ${formatDisplayPoints(maxAffiliatePoints)}`
                  : " · no referrals available"}
              </p>
            </>
          )}
        </section>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
