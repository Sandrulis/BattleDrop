import type { Metadata } from "next";
import { AdminBattleMonthCard } from "@/app/components/admin-battle-period-card";
import { AdminBattlesYearSwitcher } from "@/app/components/admin-battles-year-switcher";
import { getAdminBattleRecords } from "@/app/lib/admin-battles/get-records";
import {
  getAdminActiveYear,
  getAdminAvailableYears,
  getAdminMonthlyBlocks,
  resolveAdminBattleYear,
} from "@/app/lib/admin-battles-data";

export const metadata: Metadata = {
  title: "Monthly Battles — Admin Panel",
};

type AdminMonthlyBattlesPageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function AdminMonthlyBattlesPage({
  searchParams,
}: AdminMonthlyBattlesPageProps) {
  const { year: yearParam } = await searchParams;
  const records = await getAdminBattleRecords();
  const availableYears = getAdminAvailableYears(records);
  const activeYear = getAdminActiveYear();
  const selectedYear = resolveAdminBattleYear(yearParam, availableYears);
  const months = getAdminMonthlyBlocks(selectedYear, records);

  return (
    <div>
      <AdminBattlesYearSwitcher
        basePath="/admin-panel/battles/monthly"
        years={availableYears}
        activeYear={activeYear}
        selectedYear={selectedYear}
        description={`All 12 monthly battles for ${selectedYear}.`}
      />

      <div className="flex w-full flex-col gap-3">
        {months.map((month) => (
          <AdminBattleMonthCard key={month.monthIndex} {...month} />
        ))}
      </div>
    </div>
  );
}
