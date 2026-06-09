"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBattleWeekSettingsModal } from "@/app/components/admin-battle-week-settings-modal";
import { Tooltip } from "@/app/components/tooltip";

import type { CurrencyCode } from "@/app/lib/site-settings-types";

function ActiveBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#da552f]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#da552f] ring-1 ring-[#da552f]/20">
      Active
    </span>
  );
}

function entryLabel(count: number) {
  return count === 1 ? "1 entry" : `${count} entries`;
}

type AdminBattleWeekCardProps = {
  week: number;
  year: number;
  dateRange: string;
  isActive: boolean;
  entryCount: number;
  isEnabled: boolean;
  minProjectsEnabled: boolean;
  minProjects: number | null;
  submitPriceLabel: string;
  winnerMoneyPriceLabel: string | null;
  defaultSubmitPrice: number;
  defaultCurrency: CurrencyCode;
};

export function AdminBattleWeekCard({
  week,
  year,
  dateRange,
  isActive,
  entryCount,
  isEnabled,
  minProjectsEnabled,
  minProjects,
  submitPriceLabel,
  winnerMoneyPriceLabel,
  defaultSubmitPrice,
  defaultCurrency,
}: AdminBattleWeekCardProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasEntries = entryCount > 0;

  return (
    <>
      <article
        className={`w-full rounded-2xl border p-4 shadow-sm sm:p-5 ${
          isActive
            ? "border-[#da552f] bg-[#da552f]/5 ring-2 ring-[#da552f]/15"
            : hasEntries
              ? "border-zinc-200 bg-white"
              : "border-dashed border-zinc-200 bg-zinc-50/60"
        }`}
      >
        <div className="flex w-full flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
              <span>
                Week {week}, {year}
                {isEnabled && winnerMoneyPriceLabel ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-base font-semibold text-emerald-700">
                    <i className="fas fa-trophy text-[13px]" aria-hidden />
                    {winnerMoneyPriceLabel}
                  </span>
                ) : null}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  aria-label={`Open settings for week ${week}, ${year}`}
                  className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <i className="fas fa-cogs text-[13px]" aria-hidden />
                </button>

                {!isEnabled ? (
                  <Tooltip
                    label="Disabled"
                    className="h-7 items-center text-amber-700"
                  >
                    <i className="fas fa-poo text-[12px]" aria-hidden />
                  </Tooltip>
                ) : null}

                {isEnabled && minProjectsEnabled && minProjects !== null ? (
                  <Tooltip
                    label={`Minimum ${minProjects} projects`}
                    className="h-7 items-center gap-1 text-zinc-600"
                  >
                    <i className="fas fa-user-friends text-[12px]" aria-hidden />
                    <span className="text-xs font-semibold tabular-nums">
                      {minProjects}
                    </span>
                  </Tooltip>
                ) : null}

                {isEnabled ? (
                  <Tooltip
                    label="Points per submit"
                    className="h-7 items-center gap-1 text-zinc-600"
                  >
                    <i className="fas fa-money-bill-alt text-[12px]" aria-hidden />
                    <span className="text-xs font-semibold tabular-nums">
                      {submitPriceLabel}
                    </span>
                  </Tooltip>
                ) : null}
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">{dateRange}</p>
          </div>
          {isActive && <ActiveBadge />}
        </div>
        <p className="mt-3 text-sm text-zinc-600">
          {hasEntries ? entryLabel(entryCount) : "No entries"}
        </p>
      </article>

      <AdminBattleWeekSettingsModal
        open={settingsOpen}
        week={week}
        year={year}
        dateRange={dateRange}
        defaultSubmitPrice={defaultSubmitPrice}
        defaultCurrency={defaultCurrency}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
