"use client";

import { useEffect, useRef } from "react";
import type { AdminWeekBlock } from "@/app/lib/admin-battles-data";
import { AdminBattleWeekCard } from "./admin-battle-week-card";

type AdminBattleWeekListProps = {
  weeks: AdminWeekBlock[];
  scrollToWeek: number | null;
  defaultSubmitPrice: number;
};

export function AdminBattleWeekList({
  weeks,
  scrollToWeek,
  defaultSubmitPrice,
}: AdminBattleWeekListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWeekRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollToWeek) return;

    const container = containerRef.current;
    const activeWeek = activeWeekRef.current;
    if (!container || !activeWeek) return;

    const frame = window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeWeek.getBoundingClientRect();
      const offset =
        container.scrollTop +
        (activeRect.top - containerRect.top) -
        container.clientHeight / 2 +
        activeRect.height / 2;

      container.scrollTo({
        top: Math.max(0, offset),
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollToWeek, weeks]);

  return (
    <div
      ref={containerRef}
      className="max-h-[min(70vh,42rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent"
    >
      <div className="flex w-full flex-col gap-3">
        {weeks.map((week) => (
          <div
            key={week.week}
            ref={week.isActive ? activeWeekRef : undefined}
          >
            <AdminBattleWeekCard
              {...week}
              defaultSubmitPrice={defaultSubmitPrice}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
