"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AdminCountBadge } from "@/app/components/admin-count-badge";
import { headerIconButtonClassName } from "@/app/components/header-control-styles";
import {
  getTotalAdminAlertCount,
  type AdminAlertCounts,
} from "@/app/lib/admin-alerts/admin-alert-types";

type AdminAlertsMenuProps = {
  alertCounts: AdminAlertCounts;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

const menuItemClassName =
  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2";

export function AdminAlertsMenu({
  alertCounts,
  open,
  onToggle,
  onClose,
}: AdminAlertsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const totalAlerts = getTotalAdminAlertCount(alertCounts);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  return (
    <div ref={menuRef} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          totalAlerts > 0
            ? `Admin alerts, ${totalAlerts} items need attention`
            : "Admin alerts"
        }
        className={`${headerIconButtonClassName} relative cursor-pointer text-zinc-600 outline-none ring-offset-2 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400`}
      >
        <i className="fas fa-bell text-[13px]" aria-hidden />
        {totalAlerts > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white ring-2 ring-white"
            aria-hidden
          >
            !
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close admin alerts overlay"
            className="fixed inset-0 top-14 z-40 bg-black/20 md:hidden"
            onClick={onClose}
          />
          <div
            role="menu"
            aria-label="Admin alerts"
            className="fixed left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:min-w-[14rem] md:rounded-lg md:border md:px-0 md:py-1"
          >
            <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 md:mb-1 md:mt-1">
              Needs attention
            </p>
            <Link
              href="/admin-panel/support"
              role="menuitem"
              onClick={onClose}
              className={menuItemClassName}
            >
              <span className="flex items-center gap-2.5">
                <i
                  className="fa-solid fa-life-ring w-4 text-center text-[13px] text-zinc-400"
                  aria-hidden
                />
                Support
              </span>
              <AdminCountBadge count={alertCounts.support} />
            </Link>
            <Link
              href="/admin-panel/suggestions"
              role="menuitem"
              onClick={onClose}
              className={menuItemClassName}
            >
              <span className="flex items-center gap-2.5">
                <i
                  className="fa-solid fa-lightbulb w-4 text-center text-[13px] text-zinc-400"
                  aria-hidden
                />
                Suggestions
              </span>
              <AdminCountBadge count={alertCounts.suggestions} />
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
