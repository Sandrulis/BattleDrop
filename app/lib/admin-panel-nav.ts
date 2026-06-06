export type AdminPanelNavItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
  exact?: boolean;
};

export const ADMIN_PANEL_NAV: AdminPanelNavItem[] = [
  {
    href: "/admin-panel",
    label: "Overview",
    icon: "fa-gauge-high",
    description: "Summary of site activity and quick actions.",
    exact: true,
  },
  {
    href: "/admin-panel/users",
    label: "Users",
    icon: "fa-users",
    description: "Manage accounts, roles, and admin access.",
  },
  {
    href: "/admin-panel/projects",
    label: "Projects",
    icon: "fa-folder-open",
    description: "Moderate submissions, drafts, and published products.",
  },
  {
    href: "/admin-panel/battle-results",
    label: "Battle Results",
    icon: "fa-trophy",
    description: "Review weekly, monthly, and annual battle outcomes.",
  },
  {
    href: "/admin-panel/todo",
    label: "Todo",
    icon: "fa-list-check",
    description: "Track admin tasks with drag-and-drop columns.",
  },
  {
    href: "/admin-panel/settings",
    label: "Settings",
    icon: "fa-gear",
    description: "Configure site-wide defaults such as date and time formats.",
  },
];

export function getAdminPanelNavItem(pathname: string) {
  const sorted = [...ADMIN_PANEL_NAV].sort(
    (a, b) => b.href.length - a.href.length,
  );

  return (
    sorted.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? ADMIN_PANEL_NAV[0]
  );
}
