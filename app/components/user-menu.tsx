"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/client";
import { resolveAvatarUrl } from "@/app/lib/users/resolve-avatar-url";
import { headerIconButtonClassName } from "@/app/components/header-control-styles";
import { UserAffiliateBalance } from "@/app/components/user-affiliate-balance";
import { UserAvatar } from "@/app/components/user-avatar";
import { UserCommentUpvoteBalance } from "@/app/components/user-comment-upvote-balance";
import { UserPointsBalance } from "@/app/components/user-points-balance";

type UserMenuProps = {
  user: User;
  isAdmin: boolean;
  affiliatesEnabled?: boolean;
  shopEnabled?: boolean;
  avatarUrl?: string | null;
  displayName: string;
  points?: number;
  commentUpvoteCount?: number;
  availableAffiliates?: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function UserMenu({
  user,
  isAdmin,
  affiliatesEnabled = false,
  shopEnabled = false,
  avatarUrl,
  displayName,
  points,
  commentUpvoteCount,
  availableAffiliates,
  open,
  onToggle,
  onClose,
}: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        onClose();
      }
    }

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  const signOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.refresh();
  };

  const resolvedAvatar = resolveAvatarUrl(avatarUrl, user.user_metadata);

  const menuItemClassName =
    "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2";

  const menuItems = (
    <>
      <Link
        href="/settings"
        role="menuitem"
        onClick={onClose}
        className={menuItemClassName}
      >
        <MenuIcon icon="fa-gear" />
        Settings
      </Link>
      <Link
        href="/my-projects"
        role="menuitem"
        onClick={onClose}
        className={menuItemClassName}
      >
        <MenuIcon icon="fa-folder-open" />
        My Projects
      </Link>
      {affiliatesEnabled ? (
        <Link
          href="/affiliates"
          role="menuitem"
          onClick={onClose}
          className={menuItemClassName}
        >
          <MenuIcon icon="fa-user-tag" />
          Affiliates
        </Link>
      ) : null}
      {shopEnabled ? (
        <Link
          href="/shop"
          role="menuitem"
          onClick={onClose}
          className={menuItemClassName}
        >
          <MenuIcon icon="fa-store" />
          Shop
        </Link>
      ) : null}
      {isAdmin && (
        <Link
          href="/admin-panel"
          role="menuitem"
          onClick={onClose}
          className={menuItemClassName}
        >
          <MenuIcon icon="fa-gauge-high" />
          Admin Panel
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={signOut}
        className={`${menuItemClassName} w-full text-left`}
      >
        <MenuIcon icon="fa-right-from-bracket" />
        Sign out
      </button>
    </>
  );

  return (
    <div ref={menuRef} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={`${headerIconButtonClassName} cursor-pointer overflow-hidden outline-none ring-offset-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-zinc-400`}
      >
        <UserAvatar
          src={resolvedAvatar}
          name={displayName}
          imgClassName="block size-full object-cover"
          fallbackClassName="flex size-full items-center justify-center bg-zinc-200 text-xs font-medium text-zinc-700"
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu overlay"
            className="fixed inset-0 top-14 z-40 bg-black/20 md:hidden"
            onClick={onClose}
          />
          <div
            role="menu"
            className="fixed left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:min-w-[11rem] md:rounded-lg md:border md:px-0 md:py-1"
          >
            {points !== undefined ? (
              <div className="mb-3 flex flex-wrap gap-2 border-b border-zinc-100 pb-3 md:hidden">
                <UserPointsBalance points={points} />
                {commentUpvoteCount !== undefined ? (
                  <UserCommentUpvoteBalance count={commentUpvoteCount} />
                ) : null}
                {affiliatesEnabled && availableAffiliates !== undefined ? (
                  <UserAffiliateBalance count={availableAffiliates} />
                ) : null}
              </div>
            ) : null}
            <div className="space-y-1 md:space-y-0">{menuItems}</div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuIcon({ icon }: { icon: string }) {
  return (
    <i
      className={`fas ${icon} w-4 shrink-0 text-center text-[13px] text-zinc-400`}
      aria-hidden
    />
  );
}
