import { createAdminClient } from "@/app/lib/supabase/admin";
import { isPromotesEnabled } from "./is-promotes-enabled";
import type { BookedPromotedSlot } from "./types";

type PromotedSlotRow = {
  id: string;
  year: number;
  iso_week: number;
  spot: number;
  insert_after_organic: number;
  project_id: string;
  user_id: string;
  price_points: number;
  expires_at: string;
};

function mapPromotedSlotRow(row: PromotedSlotRow): BookedPromotedSlot {
  return {
    id: row.id,
    year: row.year,
    week: row.iso_week,
    spot: row.spot,
    insertAfterOrganic: row.insert_after_organic,
    projectId: row.project_id,
    userId: row.user_id,
    pricePoints: row.price_points,
    expiresAt: row.expires_at,
  };
}

export async function getPromotedSlotsForYear(
  year: number,
): Promise<Map<number, BookedPromotedSlot[]>> {
  const byWeek = new Map<number, BookedPromotedSlot[]>();

  if (!(await isPromotesEnabled())) return byWeek;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promoted_slots")
    .select(
      "id, year, iso_week, spot, insert_after_organic, project_id, user_id, price_points, expires_at",
    )
    .eq("year", year)
    .order("iso_week", { ascending: true })
    .order("spot", { ascending: true });

  if (error || !data) return byWeek;

  for (const row of data as PromotedSlotRow[]) {
    const slot = mapPromotedSlotRow(row);
    const weekSlots = byWeek.get(slot.week) ?? [];
    weekSlots.push(slot);
    byWeek.set(slot.week, weekSlots);
  }

  return byWeek;
}
