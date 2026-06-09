"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AdminAlertCounts } from "@/app/lib/admin-alerts/admin-alert-types";
import { AdminAlertsMenu } from "./admin-alerts-menu";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";

type HeaderActionsProps = {
  user: User | null;
  isAdmin: boolean;
  adminAlertCounts?: AdminAlertCounts;
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
  adminAlertCounts,
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
  const [adminAlertsOpen, setAdminAlertsOpen] = useState(false);

  useEffect(() => {
    if (!navOpen && !userMenuOpen && !adminAlertsOpen) return;

    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const shouldLockScroll =
      navOpen || (adminAlertsOpen && isMobile) || (userMenuOpen && isMobile);
    if (!shouldLockScroll) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen, userMenuOpen, adminAlertsOpen]);

  useEffect(() => {
    if (!navOpen && !userMenuOpen && !adminAlertsOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNavOpen(false);
        setUserMenuOpen(false);
        setAdminAlertsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen, userMenuOpen, adminAlertsOpen]);

  const toggleNav = () => {
    setUserMenuOpen(false);
    setAdminAlertsOpen(false);
    setNavOpen((v) => !v);
  };

  const toggleUserMenu = () => {
    setNavOpen(false);
    setAdminAlertsOpen(false);
    setUserMenuOpen((v) => !v);
  };

  const toggleAdminAlerts = () => {
    setNavOpen(false);
    setUserMenuOpen(false);
    setAdminAlertsOpen((v) => !v);
  };

  const closeAll = () => {
    setNavOpen(false);
    setUserMenuOpen(false);
    setAdminAlertsOpen(false);
  };

  return (
    <div className="flex h-8 items-center gap-2">
      <MobileNav open={navOpen} onToggle={toggleNav} onClose={closeAll} />
      {isAdmin && adminAlertCounts ? (
        <AdminAlertsMenu
          alertCounts={adminAlertCounts}
          open={adminAlertsOpen}
          onToggle={toggleAdminAlerts}
          onClose={closeAll}
        />
      ) : null}
      <AuthButton
        user={user}
        isAdmin={isAdmin}
        adminAlertCounts={adminAlertCounts}
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
