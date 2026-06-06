"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/client";

type UserMenuProps = {
  user: User;
  isAdmin: boolean;
  avatarUrl?: string | null;
  displayName: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function UserMenu({
  user,
  isAdmin,
  avatarUrl,
  displayName,
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

  const resolvedAvatar =
    avatarUrl ?? (user.user_metadata?.avatar_url as string | undefined);

  const menuItems = (
    <>
      <Link
        href="/settings"
        role="menuitem"
        onClick={onClose}
        className="block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2"
      >
        Settings
      </Link>
      <Link
        href="/my-projects"
        role="menuitem"
        onClick={onClose}
        className="block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2"
      >
        My Projects
      </Link>
      {isAdmin && (
        <Link
          href="/admin-panel"
          role="menuitem"
          onClick={onClose}
          className="block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2"
        >
          Admin Panel
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={signOut}
        className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:rounded-none md:px-3.5 md:py-2"
      >
        Sign out
      </button>
    </>
  );

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="cursor-pointer rounded-lg outline-none ring-offset-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        {resolvedAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedAvatar}
            alt=""
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-xs font-medium text-zinc-700"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
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
            <div className="space-y-1 md:space-y-0">
              {menuItems}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
