import type { Metadata } from "next";
import { AdminBattleWeekList } from "@/app/components/admin-battle-week-list";
import { AdminBattlesYearSwitcher } from "@/app/components/admin-battles-year-switcher";
import { getAdminBattleRecords } from "@/app/lib/admin-battles/get-records";
import {
  getAdminActiveYear,
  getAdminActiveWeek,
  getAdminAvailableYears,
  getAdminYearWeeks,
  resolveAdminBattleYear,
} from "@/app/lib/admin-battles-data";
import { getBattleWeekSettingsMapForYear } from "@/app/lib/battle-week-settings/get-battle-week-settings-for-year";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";

export const metadata: Metadata = {
  title: "Weekly Battles — Admin Panel",
};

type AdminWeeklyBattlesPageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function AdminWeeklyBattlesPage({
  searchParams,
}: AdminWeeklyBattlesPageProps) {
  const { year: yearParam } = await searchParams;
  const user = await getCurrentAppUser();
  const [dateSettings, records] = await Promise.all([
    getEffectiveDateTimeSettingsForUser(user?.id ?? null),
    getAdminBattleRecords(),
  ]);
  const availableYears = getAdminAvailableYears(records);
  const activeYear = getAdminActiveYear();
  const selectedYear = resolveAdminBattleYear(yearParam, availableYears);
  const weekSettings = await getBattleWeekSettingsMapForYear(selectedYear);
  const weeks = getAdminYearWeeks(selectedYear, dateSettings, records, {
    settingsByWeek: weekSettings.settingsByWeek,
    defaultSubmitPrice: weekSettings.defaultSubmitPrice,
    defaultCurrency: weekSettings.defaultCurrency,
  });
  const scrollToWeek =
    selectedYear === activeYear ? getAdminActiveWeek() : null;

  return (
    <div>
      <AdminBattlesYearSwitcher
        basePath="/admin-panel/battles/weekly"
        years={availableYears}
        activeYear={activeYear}
        selectedYear={selectedYear}
        description={`All 52 weekly battles for ${selectedYear}.`}
      />

      <AdminBattleWeekList
        weeks={weeks}
        scrollToWeek={scrollToWeek}
        defaultSubmitPrice={weekSettings.defaultSubmitPrice}
        defaultCurrency={weekSettings.defaultCurrency}
      />
    </div>
  );
}
