import { getMondayOfIsoWeek } from "@/app/lib/battle-week";
import type { BattlePhase } from "@/app/lib/types";

export type BattleWeekDisplayStatus =
  | "upcoming"
  | "awaiting_voting"
  | "voting_open"
  | "closed";

export type BattleWeekTiming = {
  weekStart: string;
  weekEnd: string;
  votingOpensAt: string;
  votingEndsAt: string;
};

export function getBattleWeekTiming(
  year: number,
  week: number,
  battleStartHoursFromWeekStart: number,
): BattleWeekTiming {
  const weekStart = getMondayOfIsoWeek(year, week);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const votingOpensAt = new Date(
    weekStart.getTime() + battleStartHoursFromWeekStart * 60 * 60 * 1000,
  );

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    votingOpensAt: votingOpensAt.toISOString(),
    votingEndsAt: weekEnd.toISOString(),
  };
}

export function resolveBattleWeekDisplayStatus(
  now: Date,
  timing: BattleWeekTiming,
): BattleWeekDisplayStatus {
  const weekStart = new Date(timing.weekStart).getTime();
  const votingOpensAt = new Date(timing.votingOpensAt).getTime();
  const votingEndsAt = new Date(timing.votingEndsAt).getTime();
  const nowMs = now.getTime();

  if (nowMs < weekStart) {
    return "upcoming";
  }

  if (nowMs < votingOpensAt) {
    return "awaiting_voting";
  }

  if (nowMs < votingEndsAt) {
    return "voting_open";
  }

  return "closed";
}

export const BATTLE_WEEK_STATUS_BADGE = {
  upcoming: {
    label: "Waiting battle week",
    containerClass:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    borderClass: "border-2 border-blue-400",
    shadowClass: "shadow-lg shadow-blue-400/40",
    dotClass: "bg-blue-500",
    pulse: false,
  },
  awaiting_voting: {
    label: "Awaiting voting",
    containerClass:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    borderClass: "border-2 border-amber-400",
    shadowClass: "shadow-lg shadow-amber-400/40",
    dotClass: "bg-amber-500",
    pulse: false,
  },
  voting_open: {
    label: "Voting open",
    containerClass:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    borderClass: "border-2 border-emerald-400",
    shadowClass: "shadow-lg shadow-emerald-400/40",
    dotClass: "animate-pulse bg-emerald-500",
    pulse: true,
  },
  closed: {
    label: "Closed",
    containerClass: "bg-red-50 text-red-700 ring-1 ring-red-200",
    borderClass: "border-2 border-red-400",
    shadowClass: "shadow-lg shadow-red-400/40",
    dotClass: "bg-red-500",
    pulse: false,
  },
} as const satisfies Record<
  BattleWeekDisplayStatus,
  {
    label: string;
    containerClass: string;
    borderClass: string;
    shadowClass: string;
    dotClass: string;
    pulse: boolean;
  }
>;

export function formatBattleStartHoursLabel(hours: number) {
  return `${hours}h`;
}

export function displayStatusToBattlePhase(
  status: BattleWeekDisplayStatus,
): BattlePhase {
  if (status === "voting_open") {
    return "voting";
  }

  if (status === "closed") {
    return "closed";
  }

  return "collecting";
}

export function shouldShuffleBeforeVoting(
  status: BattleWeekDisplayStatus,
): boolean {
  return status === "upcoming" || status === "awaiting_voting";
}

export function submissionsOpenForDisplayWeek(
  status: BattleWeekDisplayStatus,
): boolean {
  return status === "upcoming" || status === "awaiting_voting";
}
