"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signInWithGoogle } from "@/app/lib/auth/sign-in-with-google";
import type { AdminAlertCounts } from "@/app/lib/admin-alerts/admin-alert-types";
import { headerAuthButtonClassName } from "@/app/components/header-control-styles";
import { UserMenu } from "./user-menu";

type AuthButtonProps = {
  user: User | null;
  isAdmin?: boolean;
  adminAlertCounts?: AdminAlertCounts;
  affiliatesEnabled?: boolean;
  shopEnabled?: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
  points?: number;
  commentUpvoteCount?: number;
  availableAffiliates?: number;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  onMenuClose?: () => void;
  returnPath?: string;
  className?: string;
  label?: string;
  onBeforeSignIn?: () => boolean | Promise<boolean>;
};

export function AuthButton({
  user,
  isAdmin = false,
  adminAlertCounts,
  affiliatesEnabled = false,
  shopEnabled = false,
  avatarUrl,
  displayName,
  points,
  commentUpvoteCount,
  availableAffiliates,
  menuOpen = false,
  onMenuToggle,
  onMenuClose,
  returnPath,
  className,
  label,
  onBeforeSignIn,
}: AuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (onBeforeSignIn) {
      const canProceed = await onBeforeSignIn();
      if (!canProceed) return;
    }

    setLoading(true);
    await signInWithGoogle(returnPath);
  };

  if (user) {
    const name =
      displayName ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "Account";

    return (
      <UserMenu
        user={user}
        isAdmin={isAdmin}
        adminAlertCounts={adminAlertCounts}
        affiliatesEnabled={affiliatesEnabled}
        shopEnabled={shopEnabled}
        avatarUrl={avatarUrl}
        displayName={name}
        points={points}
        commentUpvoteCount={commentUpvoteCount}
        availableAffiliates={availableAffiliates}
        open={menuOpen}
        onToggle={onMenuToggle ?? (() => {})}
        onClose={onMenuClose ?? (() => {})}
      />
    );
  }

  const buttonClassName = className ?? headerAuthButtonClassName;

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      className={buttonClassName}
    >
      {label ? (
        loading ? "Signing in…" : label
      ) : (
        <>
          <span className="hidden sm:inline">{loading ? "Signing in…" : "Sign in"}</span>
          <span className="sm:hidden">{loading ? "…" : "In"}</span>
        </>
      )}
    </button>
  );
}
