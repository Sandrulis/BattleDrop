"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";

type HeaderActionsProps = {
  user: User | null;
  isAdmin: boolean;
  affiliatesEnabled?: boolean;
  shopEnabled?: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
  points?: number;
  commentUpvoteCount?: number;
  availableAffiliates?: number;
};

export function HeaderActions({
  user,
  isAdmin,
  affiliatesEnabled = false,
  shopEnabled = false,
  avatarUrl,
  displayName,
  points,
  commentUpvoteCount,
  availableAffiliates,
}: HeaderActionsProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!navOpen && !userMenuOpen) return;

    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const shouldLockScroll = navOpen || (userMenuOpen && isMobile);
    if (!shouldLockScroll) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen, userMenuOpen]);

  useEffect(() => {
    if (!navOpen && !userMenuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNavOpen(false);
        setUserMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen, userMenuOpen]);

  const toggleNav = () => {
    setUserMenuOpen(false);
    setNavOpen((v) => !v);
  };

  const toggleUserMenu = () => {
    setNavOpen(false);
    setUserMenuOpen((v) => !v);
  };

  const closeAll = () => {
    setNavOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <div className="flex h-8 items-center gap-2">
      <MobileNav open={navOpen} onToggle={toggleNav} onClose={closeAll} />
      <AuthButton
        user={user}
        isAdmin={isAdmin}
        affiliatesEnabled={affiliatesEnabled}
        shopEnabled={shopEnabled}
        avatarUrl={avatarUrl}
        displayName={displayName}
        points={points}
        commentUpvoteCount={commentUpvoteCount}
        availableAffiliates={availableAffiliates}
        menuOpen={userMenuOpen}
        onMenuToggle={toggleUserMenu}
        onMenuClose={closeAll}
      />
    </div>
  );
}
