import { getMondayOfIsoWeek } from "@/app/lib/battle-week";
import type { ArchiveMonthGroup, WeekArchiveEntry } from "./types";

function getMonthLabelForWeek(year: number, week: number): string {
  const monday = getMondayOfIsoWeek(year, week);
  return monday.toLocaleString("en-US", { month: "long" }).toUpperCase();
}

export function groupWeeksByMonth(
  year: number,
  weeks: WeekArchiveEntry[],
): ArchiveMonthGroup[] {
  const map = new Map<number, ArchiveMonthGroup>();

  for (const entry of weeks) {
    const monday = getMondayOfIsoWeek(year, entry.week);
    const monthIndex = monday.getMonth();
    const monthLabel = getMonthLabelForWeek(year, entry.week);

    const existing = map.get(monthIndex);
    if (existing) {
      existing.weeks.push(entry);
    } else {
      map.set(monthIndex, { monthIndex, monthLabel, weeks: [entry] });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.monthIndex - b.monthIndex);
}
