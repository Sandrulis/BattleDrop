"use client";

import { useState } from "react";

type AdminUserAdminToggleProps = {
  userId: string;
  isAdmin: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onChange: (isAdmin: boolean) => void;
  onError: (message: string) => void;
  onSuccess?: () => void;
};

export function AdminUserAdminToggle({
  userId,
  isAdmin,
  disabled = false,
  disabledReason,
  onChange,
  onError,
  onSuccess,
}: AdminUserAdminToggleProps) {
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    if (saving) return;

    if (disabled) {
      onError(disabledReason ?? "Cannot change admin status.");
      return;
    }

    const previousValue = isAdmin;
    const nextValue = !isAdmin;

    onChange(nextValue);
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}/admin`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: nextValue }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update admin status.");
      }

      onSuccess?.();
    } catch (error) {
      onChange(previousValue);
      onError(
        error instanceof Error ? error.message : "Could not update admin status.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAdmin}
      aria-label={isAdmin ? "Remove admin access" : "Grant admin access"}
      title={disabled ? disabledReason : undefined}
      disabled={saving}
      onClick={handleToggle}
      className={`relative ml-auto inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        isAdmin ? "bg-[#da552f]" : "bg-zinc-200"
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
          isAdmin ? "translate-x-[1.375rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
