import type { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  cursorHelp?: boolean;
};

export function Tooltip({
  label,
  children,
  className = "",
  cursorHelp = true,
}: TooltipProps) {
  return (
    <span
      className={`group/tooltip relative inline-flex ${cursorHelp ? "cursor-help" : ""} ${className}`.trim()}
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
