import { getCurrentIsoWeek } from "@/app/lib/battle-week";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export type AdminBattleWeekRecord = {
  entryCount: number;
};

export type AdminBattleRecords = {
  weeks: Map<string, AdminBattleWeekRecord>;
  months: Map<string, AdminBattleWeekRecord>;
  years: Map<number, AdminBattleWeekRecord>;
};

const EMPTY_RECORDS: AdminBattleRecords = {
  weeks: new Map(),
  months: new Map(),
  years: new Map(),
};

function weekKey(year: number, week: number) {
  return `${year}:${week}`;
}

function monthKey(year: number, monthIndex: number) {
  return `${year}:${monthIndex}`;
}

function addCount(map: Map<string, AdminBattleWeekRecord>, key: string) {
  const existing = map.get(key);
  if (existing) {
    existing.entryCount += 1;
    return;
  }
  map.set(key, { entryCount: 1 });
}

function addYearCount(map: Map<number, AdminBattleWeekRecord>, year: number) {
  const existing = map.get(year);
  if (existing) {
    existing.entryCount += 1;
    return;
  }
  map.set(year, { entryCount: 1 });
}

export async function getAdminBattleRecords(): Promise<AdminBattleRecords> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return EMPTY_RECORDS;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("created_at")
    .eq("status", "published")
    .is("deleted_at", null);

  if (error || !data) return EMPTY_RECORDS;

  const weeks = new Map<string, AdminBattleWeekRecord>();
  const months = new Map<string, AdminBattleWeekRecord>();
  const years = new Map<number, AdminBattleWeekRecord>();

  for (const row of data) {
    const createdAt = new Date(row.created_at);
    if (Number.isNaN(createdAt.getTime())) continue;

    const { week, year } = getCurrentIsoWeek(createdAt);
    addCount(weeks, weekKey(year, week));
    addCount(months, monthKey(year, createdAt.getMonth()));
    addYearCount(years, year);
  }

  return { weeks, months, years };
}

export function getWeekEntryCount(
  records: AdminBattleRecords,
  year: number,
  week: number,
) {
  return records.weeks.get(weekKey(year, week))?.entryCount ?? 0;
}

export function getMonthEntryCount(
  records: AdminBattleRecords,
  year: number,
  monthIndex: number,
) {
  return records.months.get(monthKey(year, monthIndex))?.entryCount ?? 0;
}

export function getYearWeeksWithEntries(
  records: AdminBattleRecords,
  year: number,
) {
  let count = 0;
  for (const key of records.weeks.keys()) {
    const [recordYear] = key.split(":");
    if (Number(recordYear) === year) count += 1;
  }
  return count;
}

export function getYearsWithEntries(records: AdminBattleRecords) {
  return Array.from(records.years.keys()).sort((a, b) => b - a);
}
