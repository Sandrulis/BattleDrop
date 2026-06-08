"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

type TooltipPlacement = "top" | "bottom";
type TooltipAlign = "center" | "start" | "end";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  cursorHelp?: boolean;
  placement?: TooltipPlacement | "auto";
};

const VIEWPORT_PADDING = 8;
const TOOLTIP_GAP = 6;

export function Tooltip({
  label,
  children,
  className = "",
  cursorHelp = true,
  placement = "auto",
}: TooltipProps) {
  const [resolvedPlacement, setResolvedPlacement] =
    useState<TooltipPlacement>("top");
  const [align, setAlign] = useState<TooltipAlign>("center");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    if (placement !== "auto") {
      setResolvedPlacement(placement);
      setAlign("center");
      return;
    }

    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;

    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const spaceBelow =
      window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;

    const fitsAbove = spaceAbove >= tooltipHeight + TOOLTIP_GAP;
    const fitsBelow = spaceBelow >= tooltipHeight + TOOLTIP_GAP;

    if (fitsAbove || (!fitsBelow && spaceAbove >= spaceBelow)) {
      setResolvedPlacement("top");
    } else {
      setResolvedPlacement("bottom");
    }

    const centerX = triggerRect.left + triggerRect.width / 2;
    if (centerX - tooltipWidth / 2 < VIEWPORT_PADDING) {
      setAlign("start");
    } else if (
      centerX + tooltipWidth / 2 >
      window.innerWidth - VIEWPORT_PADDING
    ) {
      setAlign("end");
    } else {
      setAlign("center");
    }
  }, [placement]);

  const verticalClass =
    resolvedPlacement === "top"
      ? "bottom-[calc(100%+6px)]"
      : "top-[calc(100%+6px)]";

  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "start"
        ? "left-0"
        : "right-0";

  return (
    <span
      ref={triggerRef}
      onMouseEnter={updatePosition}
      onFocus={updatePosition}
      className={`group/tooltip relative inline-flex ${cursorHelp ? "cursor-help" : ""} ${className}`.trim()}
    >
      {children}
      <span
        ref={tooltipRef}
        role="tooltip"
        className={`pointer-events-none absolute ${verticalClass} ${alignClass} z-50 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
