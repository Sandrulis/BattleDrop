import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import {
  BATTLE_WEEK_SETTINGS_SELECT,
  mapBattleWeekSettingsRow,
} from "./map-battle-week-settings-row";
import {
  DEFAULT_MIN_PROJECTS,
  getDefaultBattleWeekSettings,
  type BattleWeekSettings,
  type BattleWeekSettingsRow,
} from "./types";

export async function getBattleWeekSettingsMapForYear(year: number) {
  const siteSettings = await getSiteSettings();
  const admin = createAdminClient();

  const { data } = await admin
    .from("battle_week_settings")
    .select(BATTLE_WEEK_SETTINGS_SELECT)
    .eq("year", year);

  const settingsByWeek = new Map<number, BattleWeekSettings>();

  for (const row of (data ?? []) as BattleWeekSettingsRow[]) {
    settingsByWeek.set(row.iso_week, mapBattleWeekSettingsRow(row));
  }

  return {
    settingsByWeek,
    defaultSubmitPrice: siteSettings.battleSubmitPrice,
    defaultCurrency: siteSettings.defaultCurrency,
  };
}

export function resolveEffectiveWeekSettings(
  week: number,
  year: number,
  settingsByWeek: Map<number, BattleWeekSettings>,
  defaultSubmitPrice: number,
) {
  const settings =
    settingsByWeek.get(week) ?? getDefaultBattleWeekSettings(year, week);

  return {
    isEnabled: settings.isEnabled,
    minProjectsEnabled: settings.minProjectsEnabled,
    minProjects: settings.minProjects,
    effectiveSubmitPrice: settings.submitPrice ?? defaultSubmitPrice,
    effectiveProjectsRequired:
      settings.minProjectsEnabled && settings.minProjects !== null
        ? settings.minProjects
        : DEFAULT_MIN_PROJECTS,
  };
}
