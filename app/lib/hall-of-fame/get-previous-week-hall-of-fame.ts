import { addIsoWeeks } from "@/app/lib/battle-week";
import {
  getBattleWeekTiming,
  resolveBattleWeekDisplayStatus,
} from "@/app/lib/battle-week-status";
import { getBattleWeekProducts } from "@/app/lib/projects/get-battle-week-products";
import { getPromotedSlotsForWeek } from "@/app/lib/promoted-slots/get-promoted-slots-for-week";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

const HALL_OF_FAME_SIZE = 5;

export type HallOfFameEntry = {
  id: string;
  name: string;
};

export type PreviousWeekHallOfFame = {
  week: number;
  year: number;
  entries: HallOfFameEntry[];
};

export function formatHallOfFameWeekLabel(week: number, year: number) {
  return `Week ${week}, ${year}`;
}

export async function getPreviousWeekHallOfFame(
  currentYear: number,
  currentWeek: number,
): Promise<PreviousWeekHallOfFame | null> {
  const { year, week } = addIsoWeeks(currentYear, currentWeek, -1);
  const siteSettings = await getSiteSettings();
  const timing = getBattleWeekTiming(
    year,
    week,
    siteSettings.battleStartHoursFromWeekStart,
  );

  if (resolveBattleWeekDisplayStatus(new Date(), timing) !== "closed") {
    return null;
  }

  const [products, promotedSlots] = await Promise.all([
    getBattleWeekProducts(year, week),
    getPromotedSlotsForWeek(year, week),
  ]);

  if (products.length === 0) {
    return null;
  }

  const promotedIds = new Set(promotedSlots.map((slot) => slot.projectId));
  const topOrganic = products
    .filter((product) => !promotedIds.has(product.id))
    .sort((left, right) => right.votes - left.votes)
    .slice(0, HALL_OF_FAME_SIZE);

  if (topOrganic.length === 0) {
    return null;
  }

  return {
    week,
    year,
    entries: topOrganic.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  };
}
