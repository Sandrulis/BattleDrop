import { createAdminClient } from "@/app/lib/supabase/admin";
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
  };
}

export async function getPromotedSlotsForWeek(
  year: number,
  week: number,
): Promise<BookedPromotedSlot[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promoted_slots")
    .select(
      "id, year, iso_week, spot, insert_after_organic, project_id, user_id, price_points",
    )
    .eq("year", year)
    .eq("iso_week", week)
    .order("spot", { ascending: true });

  if (error || !data) return [];

  return (data as PromotedSlotRow[]).map(mapPromotedSlotRow);
}
