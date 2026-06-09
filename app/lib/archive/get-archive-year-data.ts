import { getCurrentIsoWeek } from "@/app/lib/battle-week";
import type { HomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getPromotedSlotsForYear } from "@/app/lib/promoted-slots/get-promoted-slots-for-year";
import { WEEKS_IN_ARCHIVE_YEAR } from "./constants";
import { fetchYearProjectsGroupedByWeek } from "./fetch-year-projects";
import { getTopArchiveProducts } from "./get-top-archive-products";
import {
  getArchiveWeekTiming,
  resolveArchiveWeekStatus,
} from "./resolve-archive-week-status";
import type { WeekArchiveEntry } from "./types";

export async function getAvailableArchiveYears(): Promise<number[]> {
  const { year: currentYear } = getCurrentIsoWeek();
  const years = new Set<number>([currentYear]);

  if (!isSupabaseConfigured()) {
    return [currentYear];
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("battle_year")
    .eq("status", "published")
    .is("deleted_at", null)
    .not("battle_year", "is", null);

  if (!error && data) {
    for (const row of data) {
      if (row.battle_year != null) {
        years.add(row.battle_year);
      }
    }
  }

  return [...years].sort((left, right) => left - right);
}

export async function getArchiveYearData(
  year: number,
  homeBattleWeek: Pick<HomeBattleWeek, "battle">,
): Promise<WeekArchiveEntry[]> {
  const siteSettings = await getSiteSettings();
  const now = new Date();

  const [productsByWeek, promotedByWeek] = await Promise.all([
    fetchYearProjectsGroupedByWeek(year),
    getPromotedSlotsForYear(year),
  ]);

  return Array.from({ length: WEEKS_IN_ARCHIVE_YEAR }, (_, index) => {
    const week = index + 1;
    const timing = getArchiveWeekTiming(
      year,
      week,
      siteSettings.battleStartHoursFromWeekStart,
    );
    const status = resolveArchiveWeekStatus(
      year,
      week,
      homeBattleWeek.battle.year,
      homeBattleWeek.battle.week,
      now,
      timing,
    );
    const products = productsByWeek.get(week) ?? [];
    const promotedSlots = promotedByWeek.get(week) ?? [];

    return {
      week,
      status,
      topProducts: getTopArchiveProducts(products, promotedSlots),
    };
  });
}
