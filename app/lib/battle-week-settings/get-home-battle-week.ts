import { addIsoWeeks, getCurrentIsoWeek } from "@/app/lib/battle-week";
import { getBattleWeekEntryCount } from "@/app/lib/battle-week/get-battle-week-entry-count";
import {
  getBattleWeekTiming,
  resolveBattleWeekDisplayStatus,
  displayStatusToBattlePhase,
  shouldShuffleBeforeVoting,
  submissionsOpenForDisplayWeek,
  type BattleWeekDisplayStatus,
  type BattleWeekTiming,
} from "@/app/lib/battle-week-status";
import { currentBattle } from "@/app/lib/mock-data";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import type { Battle } from "@/app/lib/types";
import {
  getBattleWeekSettingsMapForYear,
  resolveEffectiveWeekSettings,
} from "./get-battle-week-settings-for-year";
import { type BattleWeekSettings } from "./types";

const MAX_WEEK_LOOKUPS = 104;

export function resolveNextEnabledIsoWeek(
  startYear: number,
  startWeek: number,
  isEnabled: (year: number, week: number) => boolean,
): { year: number; week: number } {
  let year = startYear;
  let week = startWeek;

  for (let step = 0; step < MAX_WEEK_LOOKUPS; step++) {
    if (isEnabled(year, week)) {
      return { year, week };
    }
    ({ year, week } = addIsoWeeks(year, week, 1));
  }

  return { year: startYear, week: startWeek };
}

function isBattleWeekEnabled(
  year: number,
  week: number,
  settingsByYear: Map<number, Map<number, BattleWeekSettings>>,
  defaultSubmitPriceByYear: Map<number, number>,
): boolean {
  const settingsByWeek = settingsByYear.get(year);
  const defaultSubmitPrice =
    defaultSubmitPriceByYear.get(year) ??
    defaultSubmitPriceByYear.values().next().value ??
    0;

  if (!settingsByWeek) {
    return true;
  }

  return resolveEffectiveWeekSettings(
    week,
    year,
    settingsByWeek,
    defaultSubmitPrice,
  ).isEnabled;
}

export type HomeBattleWeek = {
  battle: Battle;
  battleStartHoursFromWeekStart: number;
  submitPrice: number;
  timing: BattleWeekTiming;
  status: BattleWeekDisplayStatus;
  shuffleBeforeVoting: boolean;
};

export type PublishTargetWeek = {
  year: number;
  week: number;
  submitPrice: number;
  minProjectsEnabled: boolean;
  projectsRequired: number;
  appliesToNextWeek: boolean;
};

async function loadEnabledWeekContext(startYear: number) {
  const [startYearSettings, nextYearSettings] = await Promise.all([
    getBattleWeekSettingsMapForYear(startYear),
    getBattleWeekSettingsMapForYear(startYear + 1),
  ]);

  const settingsByYear = new Map<number, Map<number, BattleWeekSettings>>([
    [startYear, startYearSettings.settingsByWeek],
    [startYear + 1, nextYearSettings.settingsByWeek],
  ]);

  const defaultSubmitPriceByYear = new Map<number, number>([
    [startYear, startYearSettings.defaultSubmitPrice],
    [startYear + 1, nextYearSettings.defaultSubmitPrice],
  ]);

  return { settingsByYear, defaultSubmitPriceByYear };
}

export async function getPublishTargetWeek(
  homeBattleWeek: HomeBattleWeek,
): Promise<PublishTargetWeek> {
  const { battle, status } = homeBattleWeek;
  const appliesToNextWeek = !submissionsOpenForDisplayWeek(status);

  let targetYear = battle.year;
  let targetWeek = battle.week;

  if (appliesToNextWeek) {
    const next = addIsoWeeks(battle.year, battle.week, 1);
    const { settingsByYear, defaultSubmitPriceByYear } =
      await loadEnabledWeekContext(next.year);

    ({ year: targetYear, week: targetWeek } = resolveNextEnabledIsoWeek(
      next.year,
      next.week,
      (year, week) =>
        isBattleWeekEnabled(
          year,
          week,
          settingsByYear,
          defaultSubmitPriceByYear,
        ),
    ));
  }

  const yearSettings = await getBattleWeekSettingsMapForYear(targetYear);
  const effective = resolveEffectiveWeekSettings(
    targetWeek,
    targetYear,
    yearSettings.settingsByWeek,
    yearSettings.defaultSubmitPrice,
  );

  return {
    year: targetYear,
    week: targetWeek,
    submitPrice: effective.effectiveSubmitPrice,
    minProjectsEnabled: effective.minProjectsEnabled,
    projectsRequired: effective.effectiveProjectsRequired,
    appliesToNextWeek,
  };
}

export async function getHomeBattleWeek(): Promise<HomeBattleWeek> {
  const { week: currentWeek, year: currentYear } = getCurrentIsoWeek();

  const [currentYearSettings, nextYearSettings, siteSettings] =
    await Promise.all([
      getBattleWeekSettingsMapForYear(currentYear),
      getBattleWeekSettingsMapForYear(currentYear + 1),
      getSiteSettings(),
    ]);

  const settingsByYear = new Map<number, Map<number, BattleWeekSettings>>([
    [currentYear, currentYearSettings.settingsByWeek],
    [currentYear + 1, nextYearSettings.settingsByWeek],
  ]);

  const defaultSubmitPriceByYear = new Map<number, number>([
    [currentYear, currentYearSettings.defaultSubmitPrice],
    [currentYear + 1, nextYearSettings.defaultSubmitPrice],
  ]);

  const displayWeek = resolveNextEnabledIsoWeek(
    currentYear,
    currentWeek,
    (year, week) =>
      isBattleWeekEnabled(
        year,
        week,
        settingsByYear,
        defaultSubmitPriceByYear,
      ),
  );

  const settingsByWeek =
    settingsByYear.get(displayWeek.year) ?? currentYearSettings.settingsByWeek;
  const defaultSubmitPrice =
    defaultSubmitPriceByYear.get(displayWeek.year) ??
    siteSettings.battleSubmitPrice;

  const weekSettings = resolveEffectiveWeekSettings(
    displayWeek.week,
    displayWeek.year,
    settingsByWeek,
    defaultSubmitPrice,
  );

  const timing = getBattleWeekTiming(
    displayWeek.year,
    displayWeek.week,
    siteSettings.battleStartHoursFromWeekStart,
  );
  const status = resolveBattleWeekDisplayStatus(new Date(), timing);
  const projectsSubmitted = await getBattleWeekEntryCount(
    displayWeek.year,
    displayWeek.week,
  );

  return {
    battle: {
      ...currentBattle,
      week: displayWeek.week,
      year: displayWeek.year,
      phase: displayStatusToBattlePhase(status),
      minProjectsEnabled: weekSettings.minProjectsEnabled,
      projectsRequired: weekSettings.effectiveProjectsRequired,
      projectsSubmitted,
      votingOpensAt: timing.votingOpensAt,
      votingEndsAt: timing.votingEndsAt,
    },
    battleStartHoursFromWeekStart: siteSettings.battleStartHoursFromWeekStart,
    submitPrice: weekSettings.effectiveSubmitPrice,
    timing,
    status,
    shuffleBeforeVoting: shouldShuffleBeforeVoting(status),
  };
}
