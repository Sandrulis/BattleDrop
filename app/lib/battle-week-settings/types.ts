export type BattleWeekSettings = {
  year: number;
  week: number;
  isEnabled: boolean;
  minProjectsEnabled: boolean;
  minProjects: number | null;
  submitPrice: number | null;
  winnerMoneyPrice: number;
};

export type BattleWeekSettingsPayload = BattleWeekSettings & {
  defaultSubmitPrice: number;
  effectiveSubmitPrice: number;
  effectiveWinnerMoneyPrice: number;
};

export type BattleWeekSettingsRow = {
  year: number;
  iso_week: number;
  is_enabled: boolean;
  min_projects_enabled: boolean;
  min_projects: number | null;
  submit_price: number | null;
  winner_money_price: number;
};

export const DEFAULT_MIN_PROJECTS = 20;

export function getDefaultBattleWeekSettings(
  year: number,
  week: number,
): BattleWeekSettings {
  return {
    year,
    week,
    isEnabled: true,
    minProjectsEnabled: false,
    minProjects: null,
    submitPrice: null,
    winnerMoneyPrice: 0,
  };
}
