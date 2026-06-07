import { formatBattleWeekRange, getCurrentIsoWeek } from "./battle-week";
import type { BattleWeekSettings } from "./battle-week-settings/types";
import { resolveEffectiveWeekSettings } from "./battle-week-settings/get-battle-week-settings-for-year";
import type { AdminBattleRecords } from "./admin-battles/get-records";
import {
  getMonthEntryCount,
  getWeekEntryCount,
  getYearWeeksWithEntries,
  getYearsWithEntries,
} from "./admin-battles/get-records";
import { formatDisplayPoints } from "./site-settings/format-display-money";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKS_PER_YEAR = 52;

export function getAdminActiveYear() {
  return getCurrentIsoWeek().year;
}

export function getAdminActiveWeek() {
  return getCurrentIsoWeek().week;
}

export function getAdminActiveMonthIndex(date = new Date()) {
  return date.getMonth();
}

export function getAdminAvailableYears(records: AdminBattleRecords): number[] {
  const activeYear = getAdminActiveYear();
  const years = new Set([
    activeYear + 1,
    activeYear,
    ...getYearsWithEntries(records),
  ]);
  return Array.from(years).sort((a, b) => b - a);
}

export function resolveAdminBattleYear(
  yearParam: string | undefined,
  availableYears: number[],
): number {
  const activeYear = getAdminActiveYear();
  if (!yearParam) return activeYear;

  const parsed = Number.parseInt(yearParam, 10);
  if (!Number.isFinite(parsed) || !availableYears.includes(parsed)) {
    return activeYear;
  }

  return parsed;
}

export type AdminWeekBlock = {
  week: number;
  year: number;
  dateRange: string;
  isActive: boolean;
  entryCount: number;
  isEnabled: boolean;
  minProjectsEnabled: boolean;
  minProjects: number | null;
  submitPriceLabel: string;
};

export type AdminMonthBlock = {
  monthIndex: number;
  monthLabel: string;
  year: number;
  isActive: boolean;
  entryCount: number;
};

export type AdminYearBlock = {
  year: number;
  isActive: boolean;
  weeksWithEntries: number;
  entryCount: number;
};

function resolveWeekIsActive(week: number, year: number) {
  const activeYear = getAdminActiveYear();
  const activeWeek = getAdminActiveWeek();
  return year === activeYear && week === activeWeek;
}

export function getAdminYearWeeks(
  battleYear: number,
  dateSettings: SiteDateTimeSettings,
  records: AdminBattleRecords,
  options: {
    settingsByWeek: Map<number, BattleWeekSettings>;
    defaultSubmitPrice: number;
  },
): AdminWeekBlock[] {
  return Array.from({ length: WEEKS_PER_YEAR }, (_, index) => {
    const week = index + 1;
    const weekSettings = resolveEffectiveWeekSettings(
      week,
      battleYear,
      options.settingsByWeek,
      options.defaultSubmitPrice,
    );

    return {
      week,
      year: battleYear,
      dateRange: formatBattleWeekRange(week, battleYear, dateSettings),
      isActive: resolveWeekIsActive(week, battleYear),
      entryCount: getWeekEntryCount(records, battleYear, week),
      isEnabled: weekSettings.isEnabled,
      minProjectsEnabled: weekSettings.minProjectsEnabled,
      minProjects: weekSettings.minProjects,
      submitPriceLabel: formatDisplayPoints(weekSettings.effectiveSubmitPrice),
    };
  });
}

export function getAdminMonthlyBlocks(
  year: number,
  records: AdminBattleRecords,
): AdminMonthBlock[] {
  const activeYear = getAdminActiveYear();
  const activeMonthIndex = getAdminActiveMonthIndex();

  return MONTH_NAMES.map((monthLabel, monthIndex) => ({
    monthIndex,
    monthLabel,
    year,
    isActive: year === activeYear && monthIndex === activeMonthIndex,
    entryCount: getMonthEntryCount(records, year, monthIndex),
  }));
}

export function getAdminYearBlocks(
  records: AdminBattleRecords,
): AdminYearBlock[] {
  const activeYear = getAdminActiveYear();

  return getAdminAvailableYears(records).map((year) => ({
    year,
    isActive: year === activeYear,
    weeksWithEntries: getYearWeeksWithEntries(records, year),
    entryCount: records.years.get(year)?.entryCount ?? 0,
  }));
}
