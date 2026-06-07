import Link from "next/link";

type AdminBattlesYearSwitcherProps = {
  basePath: string;
  years: number[];
  activeYear: number;
  selectedYear: number;
  description: string;
};

function yearHref(basePath: string, year: number, activeYear: number) {
  return year === activeYear ? basePath : `${basePath}?year=${year}`;
}

export function AdminBattlesYearSwitcher({
  basePath,
  years,
  activeYear,
  selectedYear,
  description,
}: AdminBattlesYearSwitcherProps) {
  const yearIndex = years.indexOf(selectedYear);
  const olderYear = yearIndex < years.length - 1 ? years[yearIndex + 1] : null;
  const newerYear = yearIndex > 0 ? years[yearIndex - 1] : null;

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-3">
        {olderYear ? (
          <Link
            href={yearHref(basePath, olderYear, activeYear)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50"
            aria-label={`Previous year (${olderYear})`}
          >
            ←
          </Link>
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-300"
            aria-hidden
          >
            ←
          </span>
        )}

        <div className="min-w-[5rem] text-center">
          <p className="text-2xl font-semibold tabular-nums text-zinc-900">
            {selectedYear}
          </p>
          {selectedYear === activeYear ? (
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#da552f]">
              Active year
            </p>
          ) : selectedYear > activeYear ? (
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Upcoming
            </p>
          ) : null}
        </div>

        {newerYear ? (
          <Link
            href={yearHref(basePath, newerYear, activeYear)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50"
            aria-label={`Next year (${newerYear})`}
          >
            →
          </Link>
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-300"
            aria-hidden
          >
            →
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
