import type { BattleWeekSettings, BattleWeekSettingsRow } from "./types";

export const BATTLE_WEEK_SETTINGS_SELECT =
  "year, iso_week, is_enabled, min_projects_enabled, min_projects, submit_price, winner_money_price";

export function mapBattleWeekSettingsRow(
  row: BattleWeekSettingsRow,
): BattleWeekSettings {
  return {
    year: row.year,
    week: row.iso_week,
    isEnabled: row.is_enabled,
    minProjectsEnabled: row.min_projects_enabled,
    minProjects: row.min_projects,
    submitPrice:
      row.submit_price === null ? null : Number(row.submit_price),
    winnerMoneyPrice: Number(row.winner_money_price ?? 0),
  };
}
