"use client";

import {
  PROMOTED_SLOT_DEFINITIONS,
  type PromotedSlotDefinition,
} from "@/app/lib/promoted-slots/constants";
import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";

type PromoteProjectModalProps = {
  projectName: string;
  bookedSpots: number[];
  userPointsBalance: number;
  open: boolean;
  loading: boolean;
  selectedSpot: number | null;
  onSelectSpot: (spot: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onInsufficientPoints: () => void;
};

function spotPositionLabel(slot: PromotedSlotDefinition) {
  if (slot.insertAfterOrganic === 0) return "Before #1";
  return `After #${slot.insertAfterOrganic}`;
}

export function PromoteProjectModal({
  projectName,
  bookedSpots,
  userPointsBalance,
  open,
  loading,
  selectedSpot,
  onSelectSpot,
  onCancel,
  onConfirm,
  onInsufficientPoints,
}: PromoteProjectModalProps) {
  if (!open) return null;

  const bookedSet = new Set(bookedSpots);
  const selectedSlot = PROMOTED_SLOT_DEFINITIONS.find(
    (slot) => slot.spot === selectedSpot,
  );
  const hasEnoughPoints =
    selectedSlot === undefined || userPointsBalance >= selectedSlot.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-project-title"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <h2 id="promote-project-title" className="text-lg font-semibold text-zinc-900">
          Promote {projectName}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Choose a promoted spot for this week&apos;s leaderboard. Promoted entries
          keep their real vote rank but appear in a highlighted position.
        </p>

        <div className="mt-5 space-y-2">
          {PROMOTED_SLOT_DEFINITIONS.map((slot) => {
            const isBooked = bookedSet.has(slot.spot);
            const isSelected = selectedSpot === slot.spot;

            return (
              <button
                key={slot.spot}
                type="button"
                disabled={loading || isBooked}
                onClick={() => {
                  if (userPointsBalance < slot.price) {
                    onInsufficientPoints();
                    return;
                  }

                  onSelectSpot(slot.spot);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-[#da552f]/40 bg-[#da552f]/5"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Spot {slot.spot} · {spotPositionLabel(slot)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {isBooked ? "Already booked" : formatDisplayPoints(slot.price)}
                  </p>
                </div>
                {isSelected && !isBooked ? (
                  <i className="fa-solid fa-check text-[#da552f]" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>

        <PointsBalanceLink
          points={userPointsBalance}
          returnTo="/my-projects"
          variant="inline"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!hasEnoughPoints) {
                onInsufficientPoints();
                return;
              }

              onConfirm();
            }}
            disabled={loading || selectedSpot === null}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c44926] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span
                role="status"
                aria-label="Promoting"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            ) : null}
            Promote
          </button>
        </div>
      </div>
    </div>
  );
}
