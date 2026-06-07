export type CountdownState = {
  label: string;
  remainingRatio: number;
  isEnded: boolean;
};

export const COUNTDOWN_PLACEHOLDER = "— — — —";

function formatRemainingDuration(remainingMs: number) {
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function getCountdownTo(
  targetAt: string,
  options?: { endedLabel?: string; totalMs?: number },
): CountdownState {
  const end = new Date(targetAt).getTime();
  const now = Date.now();
  const total = Math.max(options?.totalMs ?? end - now, 1);
  const remaining = Math.max(0, end - now);
  const remainingRatio = Math.min(1, Math.max(0, remaining / total));

  if (remaining <= 0) {
    return {
      label: options?.endedLabel ?? "Ended",
      remainingRatio: 0,
      isEnded: true,
    };
  }

  return {
    label: formatRemainingDuration(remaining),
    remainingRatio,
    isEnded: false,
  };
}

export function getCountdown(
  votingOpensAt: string,
  votingEndsAt: string,
): CountdownState {
  const start = new Date(votingOpensAt).getTime();
  const end = new Date(votingEndsAt).getTime();
  const total = Math.max(end - start, 1);

  return getCountdownTo(votingEndsAt, {
    endedLabel: "Voting ended",
    totalMs: total,
  });
}
