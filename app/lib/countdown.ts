export type CountdownState = {
  label: string;
  remainingRatio: number;
  isEnded: boolean;
};

export const COUNTDOWN_PLACEHOLDER = "— — — —";

export function getCountdown(
  votingOpensAt: string,
  votingEndsAt: string,
): CountdownState {
  const start = new Date(votingOpensAt).getTime();
  const end = new Date(votingEndsAt).getTime();
  const now = Date.now();
  const total = Math.max(end - start, 1);
  const remaining = Math.max(0, end - now);
  const remainingRatio = Math.min(1, Math.max(0, remaining / total));

  if (remaining <= 0) {
    return { label: "Voting ended", remainingRatio: 0, isEnded: true };
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return {
    label: parts.join(" "),
    remainingRatio,
    isEnded: false,
  };
}
