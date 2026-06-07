"use client";

import { useState } from "react";
import { AdminUserAdminToggle } from "@/app/components/admin-user-admin-toggle";
import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { Toast, useToast } from "@/app/components/toast";
import { UserAvatar } from "@/app/components/user-avatar";
import type { AppUser } from "@/app/lib/types";
import { formatLastSeen } from "@/app/lib/site-settings/format-display-date";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

type AdminUsersListProps = {
  users: AppUser[];
  currentUserId: string;
  siteDateSettings: SiteDateTimeSettings;
};

export function AdminUsersList({
  users: initialUsers,
  currentUserId,
  siteDateSettings,
}: AdminUsersListProps) {
  const [users, setUsers] = useState(initialUsers);
  const { toast, showToast, dismissToast } = useToast();

  const handleAdminChange = (userId: string, isAdmin: boolean) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, is_admin: isAdmin } : user)),
    );
  };

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
        <p className="text-sm font-medium text-zinc-900">No users yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Users will appear here after they sign in.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {users.map((user, index) => {
          const displayName = user.full_name?.trim() || user.email || "Unknown user";
          const isSelf = user.id === currentUserId;
          const cannotDemoteSelf = isSelf && user.is_admin;
          const userDateSettings = resolveEffectiveDateTimeSettings(siteDateSettings, {
            dateFormat: user.date_format,
            timeFormat: user.time_format,
            dateSeparator: user.date_separator,
          });

          return (
            <li
              key={user.id}
              className={`flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4 ${
                index > 0 ? "border-t border-zinc-100" : ""
              }`}
            >
              <div className="relative size-[3.625rem] shrink-0">
                <div className="size-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                  <UserAvatar
                    src={user.avatar_url}
                    name={displayName}
                    imgClassName="h-full w-full object-cover"
                    fallbackClassName="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500"
                  />
                </div>
                {user.is_admin && (
                  <span className="group/admin-badge absolute -right-1 -top-1 flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#da552f] text-[8px] text-white shadow-sm ring-2 ring-white">
                    <i className="fas fa-plus" aria-hidden />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/admin-badge:opacity-100 group-focus-within/admin-badge:opacity-100"
                    >
                      Admin
                    </span>
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5 text-zinc-900">
                  {displayName}
                </p>
                <p className="truncate text-sm leading-5 text-zinc-500">
                  {user.email ?? "No email"}
                </p>
                <p className="mt-0.5 truncate text-xs leading-4 text-zinc-400">
                  Last seen: {formatLastSeen(user.last_seen, userDateSettings)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <PointsBalanceLink points={user.points} variant="display" />
                <AdminUserAdminToggle
                  userId={user.id}
                  isAdmin={user.is_admin}
                  disabled={cannotDemoteSelf}
                  disabledReason={
                    cannotDemoteSelf
                      ? "You cannot remove your own admin access."
                      : undefined
                  }
                  onChange={(isAdmin) => handleAdminChange(user.id, isAdmin)}
                  onError={(message) => showToast(message, "error")}
                  onSuccess={() => showToast("Admin status updated.", "success")}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
