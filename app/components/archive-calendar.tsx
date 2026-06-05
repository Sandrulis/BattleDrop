"use client";

import { useMemo, useState } from "react";
import {
  CURRENT_BATTLE_WEEK,
  DEFAULT_ARCHIVE_YEAR,
  getArchiveYearData,
  getAvailableArchiveYears,
  groupWeeksByMonth,
} from "../lib/archive-data";
import { ArchiveWeekCard } from "./archive-week-card";

export function ArchiveCalendar() {
  const years = getAvailableArchiveYears();
  const [year, setYear] = useState(DEFAULT_ARCHIVE_YEAR);

  const weeks = useMemo(() => getArchiveYearData(year), [year]);
  const months = useMemo(() => groupWeeksByMonth(year, weeks), [year, weeks]);
  const yearIndex = years.indexOf(year);
  const canGoPrev = yearIndex > 0;
  const canGoNext = yearIndex < years.length - 1 && yearIndex !== -1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canGoPrev && setYear(years[yearIndex - 1])}
            disabled={!canGoPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous year"
          >
            ←
          </button>
          <h2 className="min-w-[4.5rem] text-center text-2xl font-semibold tabular-nums text-zinc-900">
            {year}
          </h2>
          <button
            type="button"
            onClick={() => canGoNext && setYear(years[yearIndex + 1])}
            disabled={!canGoNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next year"
          >
            →
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
          <LegendDot className="bg-[#da552f]" label="Current week" />
          <LegendDot className="bg-emerald-500" label="Completed" />
          <LegendDot className="bg-zinc-200" label="Upcoming" />
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        All 52 weeks of {year} — full product cards with the same details as the
        live battle feed.
      </p>

      <div className="mt-8 flex flex-col gap-12">
        {months.map((month) => (
          <section key={`${year}-${month.monthIndex}`}>
            <h3 className="border-b border-zinc-200 pb-3 text-[1.2rem] font-bold tracking-[0.12em] text-zinc-900 sm:text-[1.5rem]">
              {month.monthLabel}
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {month.weeks.map((entry) => {
                const isLive =
                  entry.status === "active" &&
                  year === DEFAULT_ARCHIVE_YEAR &&
                  entry.week === CURRENT_BATTLE_WEEK;

                return (
                  <ArchiveWeekCard
                    key={entry.week}
                    week={entry.week}
                    year={year}
                    status={entry.status}
                    product={entry.product}
                    isLive={isLive}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}
