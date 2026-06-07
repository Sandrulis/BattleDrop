import { createAdminClient } from "@/app/lib/supabase/admin";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getBattleWeekSettings } from "./get-battle-week-settings";
import {
  getDefaultBattleWeekSettings,
  type BattleWeekSettings,
} from "./types";

export type UpdateBattleWeekSettingsInput = {
  isEnabled?: boolean;
  minProjectsEnabled?: boolean;
  minProjects?: number | null;
  submitPrice?: number | null;
};

function parseWeek(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 53) {
    throw new Error("Invalid week.");
  }
  return value;
}

function parseYear(value: number) {
  if (!Number.isInteger(value) || value < 2000 || value > 2100) {
    throw new Error("Invalid year.");
  }
  return value;
}

function parseMinProjects(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Minimum projects must be at least 1.");
  }

  return parsed;
}

function parseSubmitPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Submit price must be zero or greater.");
  }

  return Math.round(parsed * 100) / 100;
}

export function normalizeBattleWeekSettingsInput(
  input: UpdateBattleWeekSettingsInput,
  defaultSubmitPrice: number,
): BattleWeekSettings {
  const isEnabled = input.isEnabled ?? true;
  const minProjectsEnabled = isEnabled
    ? (input.minProjectsEnabled ?? false)
    : false;
  const minProjects = minProjectsEnabled
    ? parseMinProjects(input.minProjects)
    : null;

  let submitPrice: number | null = null;
  if (isEnabled && input.submitPrice !== undefined) {
    const parsed = parseSubmitPrice(input.submitPrice);
    if (parsed !== null && parsed !== defaultSubmitPrice) {
      submitPrice = parsed;
    }
  }

  return {
    year: 0,
    week: 0,
    isEnabled,
    minProjectsEnabled,
    minProjects,
    submitPrice,
  };
}

export async function updateBattleWeekSettings(
  year: number,
  week: number,
  input: UpdateBattleWeekSettingsInput,
) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const parsedYear = parseYear(year);
  const parsedWeek = parseWeek(week);
  const { battleSubmitPrice: defaultSubmitPrice } = await getSiteSettings();
  const settings = normalizeBattleWeekSettingsInput(input, defaultSubmitPrice);
  settings.year = parsedYear;
  settings.week = parsedWeek;

  if (settings.minProjectsEnabled && settings.minProjects === null) {
    throw new Error("Minimum projects is required when enabled.");
  }

  const admin = createAdminClient();
  const defaults = getDefaultBattleWeekSettings(parsedYear, parsedWeek);
  const isDefault =
    settings.isEnabled === defaults.isEnabled &&
    settings.minProjectsEnabled === defaults.minProjectsEnabled &&
    settings.minProjects === defaults.minProjects &&
    settings.submitPrice === defaults.submitPrice;

  if (isDefault) {
    await admin
      .from("battle_week_settings")
      .delete()
      .eq("year", parsedYear)
      .eq("iso_week", parsedWeek);
  } else {
    const { error } = await admin.from("battle_week_settings").upsert(
      {
        year: parsedYear,
        iso_week: parsedWeek,
        is_enabled: settings.isEnabled,
        min_projects_enabled: settings.minProjectsEnabled,
        min_projects: settings.minProjects,
        submit_price: settings.submitPrice,
      },
      { onConflict: "year,iso_week" },
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "battle_week_settings.update",
    entityType: "battle_week_settings",
    entityId: `${parsedYear}-W${parsedWeek}`,
    metadata: {
      isEnabled: settings.isEnabled,
      minProjectsEnabled: settings.minProjectsEnabled,
      minProjects: settings.minProjects,
      submitPrice: settings.submitPrice,
    },
  });

  return getBattleWeekSettings(parsedYear, parsedWeek);
}
