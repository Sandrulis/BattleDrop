import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { projectToProduct } from "@/app/lib/projects/project-to-product";
import {
  isMissingBattleWeekColumnError,
  resolveProjectBattleWeek,
} from "@/app/lib/projects/project-battle-week";
import { enrichProductsWithCommentCounts } from "@/app/lib/product-comments";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { Product, UserProject } from "@/app/lib/types";

const BATTLE_WEEK_PRODUCT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, battle_year, battle_iso_week, created_at, updated_at, deleted_at, users ( full_name, email )";

const LEGACY_BATTLE_WEEK_PRODUCT_SELECT =
  "id, user_id, url, fetch_url, name, tagline, description, favicon_url, screenshot_url, status, created_at, updated_at, deleted_at, users ( full_name, email )";

type ProjectOwner = {
  full_name: string | null;
  email: string | null;
};

type BattleWeekProjectRow = UserProject & {
  users: ProjectOwner | ProjectOwner[] | null;
};

type BattleWeekProjectRowInput = Omit<
  UserProject,
  "battle_year" | "battle_iso_week"
> &
  Partial<Pick<UserProject, "battle_year" | "battle_iso_week">> & {
    users: ProjectOwner | ProjectOwner[] | null;
  };

function normalizeBattleWeekProject(
  row: BattleWeekProjectRowInput,
): BattleWeekProjectRow {
  return {
    ...row,
    battle_year: row.battle_year ?? null,
    battle_iso_week: row.battle_iso_week ?? null,
  };
}

function resolveOwner(users: ProjectOwner | ProjectOwner[] | null): ProjectOwner {
  if (!users) return { full_name: null, email: null };
  return Array.isArray(users) ? (users[0] ?? { full_name: null, email: null }) : users;
}

export async function fetchYearProjectsGroupedByWeek(
  year: number,
): Promise<Map<number, Product[]>> {
  const admin = createAdminClient();
  const calendarYearStart = new Date(Date.UTC(year, 0, 1)).toISOString();
  const calendarYearEnd = new Date(Date.UTC(year + 1, 0, 1)).toISOString();

  let rows: BattleWeekProjectRowInput[] | null = null;
  let error: { message?: string } | null = null;

  const primary = await admin
    .from("projects")
    .select(BATTLE_WEEK_PRODUCT_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .or(
      `battle_year.eq.${year},and(battle_year.is.null,created_at.gte.${calendarYearStart},created_at.lt.${calendarYearEnd})`,
    )
    .order("created_at", { ascending: true });

  rows = primary.data as BattleWeekProjectRowInput[] | null;
  error = primary.error;

  if (error && isMissingBattleWeekColumnError(error)) {
    const legacy = await admin
      .from("projects")
      .select(LEGACY_BATTLE_WEEK_PRODUCT_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("created_at", calendarYearStart)
      .lt("created_at", calendarYearEnd)
      .order("created_at", { ascending: true });

    rows = legacy.data as BattleWeekProjectRowInput[] | null;
    error = legacy.error;
  }

  if (error || !rows) return new Map();

  const grouped = new Map<number, Product[]>();

  for (const row of rows) {
    const project = normalizeBattleWeekProject(row);
    const battleWeek = resolveProjectBattleWeek(project);
    if (!battleWeek || battleWeek.year !== year) continue;

    const product = projectToProduct(project, resolveOwner(row.users));
    const weekProducts = grouped.get(battleWeek.week) ?? [];
    weekProducts.push(product);
    grouped.set(battleWeek.week, weekProducts);
  }

  const allProducts = [...grouped.values()].flat();
  if (allProducts.length === 0) return grouped;

  const enriched = await enrichProductsWithCommentCounts(allProducts);
  const enrichedById = new Map(enriched.map((product) => [product.id, product]));

  for (const [week, products] of grouped) {
    grouped.set(
      week,
      products.map((product) => enrichedById.get(product.id) ?? product),
    );
  }

  return grouped;
}
