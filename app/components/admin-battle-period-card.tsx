type ActiveBadgeProps = {
  label?: string;
};

function ActiveBadge({ label = "Active" }: ActiveBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#da552f]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#da552f] ring-1 ring-[#da552f]/20">
      {label}
    </span>
  );
}

function entryLabel(count: number) {
  return count === 1 ? "1 entry" : `${count} entries`;
}

type AdminBattleMonthCardProps = {
  monthLabel: string;
  year: number;
  isActive: boolean;
  entryCount: number;
};

export function AdminBattleMonthCard({
  monthLabel,
  year,
  isActive,
  entryCount,
}: AdminBattleMonthCardProps) {
  const hasEntries = entryCount > 0;

  return (
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
        <p className="text-lg font-semibold tracking-tight text-zinc-900">
          {monthLabel} {year}
        </p>
        {isActive && <ActiveBadge />}
      </div>
      <p className="mt-3 text-sm text-zinc-600">
        {hasEntries ? entryLabel(entryCount) : "No entries"}
      </p>
    </article>
  );
}

type AdminBattleYearCardProps = {
  year: number;
  isActive: boolean;
  weeksWithEntries: number;
  entryCount: number;
};

export function AdminBattleYearCard({
  year,
  isActive,
  weeksWithEntries,
  entryCount,
}: AdminBattleYearCardProps) {
  const hasEntries = entryCount > 0;

  return (
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
        <p className="text-xl font-semibold tracking-tight text-zinc-900">
          {year}
        </p>
        {isActive && <ActiveBadge />}
      </div>
      <p className="mt-3 text-sm text-zinc-600">
        {hasEntries
          ? `${entryLabel(entryCount)} · ${weeksWithEntries} weeks with entries`
          : "No entries"}
      </p>
    </article>
  );
}
