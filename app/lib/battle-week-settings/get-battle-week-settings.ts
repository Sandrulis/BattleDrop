import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import {
  BATTLE_WEEK_SETTINGS_SELECT,
  mapBattleWeekSettingsRow,
} from "./map-battle-week-settings-row";
import {
  getDefaultBattleWeekSettings,
  type BattleWeekSettingsPayload,
  type BattleWeekSettingsRow,
} from "./types";
import { resolveEffectiveWeekSettings } from "./get-battle-week-settings-for-year";

export async function getBattleWeekSettings(
  year: number,
  week: number,
): Promise<BattleWeekSettingsPayload> {
  const [{ battleSubmitPrice: defaultSubmitPrice }, admin] = await Promise.all([
    getSiteSettings(),
    Promise.resolve(createAdminClient()),
  ]);

  const { data } = await admin
    .from("battle_week_settings")
    .select(BATTLE_WEEK_SETTINGS_SELECT)
    .eq("year", year)
    .eq("iso_week", week)
    .maybeSingle();

  const settings = data
    ? mapBattleWeekSettingsRow(data as BattleWeekSettingsRow)
    : getDefaultBattleWeekSettings(year, week);

  const effective = resolveEffectiveWeekSettings(
    week,
    year,
    new Map([[week, settings]]),
    defaultSubmitPrice,
  );

  return {
    ...settings,
    defaultSubmitPrice,
    effectiveSubmitPrice: effective.effectiveSubmitPrice,
  };
}
