"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signInWithGoogle } from "@/app/lib/auth/sign-in-with-google";
import { UserMenu } from "./user-menu";

type AuthButtonProps = {
  user: User | null;
  isAdmin?: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
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
  avatarUrl,
  displayName,
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
        avatarUrl={avatarUrl}
        displayName={name}
        open={menuOpen}
        onToggle={onMenuToggle ?? (() => {})}
        onClose={onMenuClose ?? (() => {})}
      />
    );
  }

  const buttonClassName =
    className ??
    "inline-flex h-9 cursor-pointer items-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 sm:h-auto sm:px-3.5";

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
