"use client";

import { useEffect, useState } from "react";
import {
  resolveBattleWeekDisplayStatus,
  type BattleWeekDisplayStatus,
  type BattleWeekTiming,
} from "@/app/lib/battle-week-status";
import {
  COUNTDOWN_PLACEHOLDER,
  getCountdownTo,
  type CountdownState,
} from "@/app/lib/countdown";

type SubmitVotingOpensCountdownProps = {
  timing: BattleWeekTiming;
};

export function SubmitVotingOpensCountdown({
  timing,
}: SubmitVotingOpensCountdownProps) {
  const [status, setStatus] = useState<BattleWeekDisplayStatus>("upcoming");
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    const tick = () => {
      const nextStatus = resolveBattleWeekDisplayStatus(new Date(), timing);
      setStatus(nextStatus);

      if (nextStatus === "closed" || nextStatus === "voting_open") {
        setCountdown(null);
        return;
      }

      const totalMs =
        nextStatus === "awaiting_voting"
          ? new Date(timing.votingOpensAt).getTime() -
            new Date(timing.weekStart).getTime()
          : undefined;

      setCountdown(getCountdownTo(timing.votingOpensAt, { totalMs }));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timing]);

  if (status === "closed") {
    return <span className="font-medium text-zinc-900">Voting ended</span>;
  }

  if (status === "voting_open") {
    return <span className="font-medium text-emerald-700">Voting open</span>;
  }

  return (
    <span
      className="font-mono font-medium tabular-nums text-zinc-900"
      aria-live="polite"
      aria-atomic="true"
    >
      {countdown?.label ?? COUNTDOWN_PLACEHOLDER}
    </span>
  );
}
