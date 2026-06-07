"use client";

import { useState } from "react";
import { PointsBalanceLink } from "@/app/components/points-balance-link";

export type PublishBattleWeekInfo = {
  week: number;
  year: number;
  weekRangeLabel: string;
  submitPrice: number;
  entryFeeLabel: string;
  minProjectsEnabled: boolean;
  projectsRequired: number;
  battleStartHoursLabel: string;
  appliesToNextWeek: boolean;
};

type PublishProjectModalProps = {
  projectName: string;
  battleWeek: PublishBattleWeekInfo;
  userPointsBalance: number;
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PublishProjectModal({
  open,
  ...props
}: PublishProjectModalProps) {
  if (!open) return null;

  return <PublishProjectModalBody {...props} />;
}

function PublishProjectModalBody({
  projectName,
  battleWeek,
  userPointsBalance,
  loading,
  onCancel,
  onConfirm,
}: Omit<PublishProjectModalProps, "open">) {
  const [acceptedRules, setAcceptedRules] = useState(false);

  const handleCancel = () => {
    if (loading) return;
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/30"
        onClick={handleCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-project-title"
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <h2 id="publish-project-title" className="text-lg font-semibold text-zinc-900">
          Publish {projectName}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          {battleWeek.appliesToNextWeek
            ? "Voting has already started for the current week. This product will be submitted to the next available battle week."
            : "Submit this product to this week's battle."}
        </p>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
          <p className="text-sm font-semibold text-zinc-900">
            Week {battleWeek.week}, {battleWeek.year}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{battleWeek.weekRangeLabel}</p>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Entry fee</dt>
              <dd className="font-medium text-zinc-900">{battleWeek.entryFeeLabel}</dd>
            </div>
            {battleWeek.minProjectsEnabled ? (
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Battle starts at</dt>
                <dd className="font-medium text-zinc-900">
                  {battleWeek.projectsRequired} projects
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Voting opens</dt>
              <dd className="font-medium text-zinc-900">
                {battleWeek.battleStartHoursLabel} after week start
              </dd>
            </div>
          </dl>
        </div>

        <PointsBalanceLink
          points={userPointsBalance}
          returnTo="/my-projects"
          variant="inline"
        />
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={acceptedRules}
            disabled={loading}
            onChange={(event) => setAcceptedRules(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-[#da552f] focus:ring-[#da552f]/30"
          />
          <span>
            I have read and accept the{" "}
            <a href="#" className="font-medium text-[#da552f] hover:underline">
              battle rules
            </a>
            .
          </span>
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !acceptedRules}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c44926] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span
                role="status"
                aria-label="Publishing"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            ) : null}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
