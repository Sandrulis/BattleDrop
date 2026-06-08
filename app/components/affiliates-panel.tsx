"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import type { AffiliateDashboard, AffiliateInvite } from "@/app/lib/affiliates/affiliate-types";
import { formatAffiliateReferralsPerPoint } from "@/app/lib/shop/format-shop-exchange-rate";
import { formatDisplayDate } from "@/app/lib/site-settings/format-display-date";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const inputClassName =
  "min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type AffiliatesPanelProps = {
  initialDashboard: AffiliateDashboard;
  dateSettings: SiteDateTimeSettings;
};

export function AffiliatesPanel({
  initialDashboard,
  dateSettings,
}: AffiliatesPanelProps) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [copying, setCopying] = useState(false);
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();

  const copyAffiliateLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(dashboard.affiliateLink);
      showToast("Affiliate link copied.", "success");
    } catch {
      showToast("Could not copy link.", "error");
    } finally {
      setCopying(false);
    }
  };

  const submitInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviting(true);

    try {
      const response = await fetch("/api/affiliates/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = (await response.json()) as {
        invite?: AffiliateInvite;
        error?: string;
      };

      if (!response.ok || !data.invite) {
        showToast(data.error ?? "Could not send invite.", "error");
        return;
      }

      setDashboard((current) => ({
        ...current,
        invites: [data.invite!, ...current.invites],
        pendingInviteCount:
          data.invite!.status === "pending"
            ? current.pendingInviteCount + 1
            : current.pendingInviteCount,
      }));
      setInviteEmail("");
      setShowInviteForm(false);
      showToast("Invite added.", "success");
      router.refresh();
    } catch {
      showToast("Could not send invite.", "error");
    } finally {
      setInviting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Joined referrals
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
            {dashboard.joinedCount}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            People who signed up with your affiliate link.
          </p>
        </div>

        {dashboard.shopEnabled ? (
          <>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Available to redeem
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                {dashboard.availableAffiliates}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                {formatAffiliateReferralsPerPoint(dashboard.affiliatesPerPoint)} in
                the Shop.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Redeemable now
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                {formatDisplayPoints(dashboard.maxRedeemablePoints)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Exchange referrals for points in the Shop.
              </p>
            </div>
          </>
        ) : null}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Pending invites
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
            {dashboard.pendingInviteCount}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Email invites waiting for someone to join.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Your affiliate link</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Share this link anywhere. When someone signs up through it, they count
          toward your referrals.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={dashboard.affiliateLink}
            className={`${inputClassName} font-mono text-xs sm:text-sm`}
            aria-label="Affiliate link"
          />
          <button
            type="button"
            onClick={copyAffiliateLink}
            disabled={copying}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {copying ? "Copying…" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Email invites</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Track who you invited by email, then send them your affiliate link.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteForm((value) => !value)}
            aria-expanded={showInviteForm}
            aria-label={showInviteForm ? "Hide invite form" : "Add invite"}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-lg font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            +
          </button>
        </div>

        {showInviteForm ? (
          <form onSubmit={submitInvite} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="friend@example.com"
              required
              className={inputClassName}
            />
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c44a28] disabled:opacity-60"
            >
              {inviting ? "Adding…" : "Add invite"}
            </button>
          </form>
        ) : null}

        {dashboard.invites.length > 0 ? (
          <ul className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
            {dashboard.invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {invite.email}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Invited {formatDisplayDate(invite.createdAt, dateSettings)}
                  </p>
                </div>
                <span
                  className={
                    invite.status === "joined"
                      ? "inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      : "inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                  }
                >
                  {invite.status === "joined" ? "Joined" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-500">
            No email invites yet. Tap + to add someone.
          </p>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
