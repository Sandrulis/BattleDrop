"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";

type HeaderActionsProps = {
  user: User | null;
  isAdmin: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
};

export function HeaderActions({
  user,
  isAdmin,
  avatarUrl,
  displayName,
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
    <>
      <MobileNav open={navOpen} onToggle={toggleNav} onClose={closeAll} />
      <AuthButton
        user={user}
        isAdmin={isAdmin}
        avatarUrl={avatarUrl}
        displayName={displayName}
        menuOpen={userMenuOpen}
        onMenuToggle={toggleUserMenu}
        onMenuClose={closeAll}
      />
    </>
  );
}
