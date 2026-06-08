"use client";

import { useEffect, useState } from "react";
import { COUNTDOWN_PLACEHOLDER, getCountdownTo } from "@/app/lib/countdown";

type PromoteExpiryCountdownProps = {
  expiresAt: string;
};

export function PromoteExpiryCountdown({ expiresAt }: PromoteExpiryCountdownProps) {
  const [label, setLabel] = useState(COUNTDOWN_PLACEHOLDER);

  useEffect(() => {
    const tick = () => {
      const state = getCountdownTo(expiresAt, { endedLabel: "" });
      setLabel(state.isEnded ? "" : state.label);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  if (!label) return null;

  return (
    <span
      className="font-mono text-[9px] font-medium tabular-nums text-amber-600/80"
      aria-live="polite"
      aria-label={`Promoted for ${label} more`}
    >
      {label}
    </span>
  );
}
