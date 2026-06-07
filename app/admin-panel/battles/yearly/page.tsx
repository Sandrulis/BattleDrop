import type { Metadata } from "next";
import { AdminBattleYearCard } from "@/app/components/admin-battle-period-card";
import { getAdminBattleRecords } from "@/app/lib/admin-battles/get-records";
import {
  getAdminActiveYear,
  getAdminYearBlocks,
} from "@/app/lib/admin-battles-data";

export const metadata: Metadata = {
  title: "Yearly Battles — Admin Panel",
};

export default async function AdminYearlyBattlesPage() {
  const records = await getAdminBattleRecords();
  const activeYear = getAdminActiveYear();
  const years = getAdminYearBlocks(records);

  return (
    <div>
      <div className="mb-5">
        <p className="text-2xl font-semibold tabular-nums text-zinc-900">
          {activeYear}
        </p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#da552f]">
          Active year
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Years with published battle entries, starting with the active year.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {years.map((yearBlock) => (
          <AdminBattleYearCard key={yearBlock.year} {...yearBlock} />
        ))}
      </div>
    </div>
  );
}
