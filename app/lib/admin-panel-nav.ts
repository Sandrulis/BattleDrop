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
    href: "/admin-panel/battles",
    label: "Battles",
    icon: "fa-trophy",
    description: "Review weekly, monthly, and annual battle outcomes.",
  },
  {
    href: "/admin-panel/integrations",
    label: "Integrations",
    icon: "fa-plug",
    description: "Connect third-party services and manage API keys.",
  },
  {
    href: "/admin-panel/shop",
    label: "Shop",
    icon: "fa-store",
    description: "Set exchange rates for upvotes and affiliates to points.",
  },
  {
    href: "/admin-panel/poll",
    label: "Poll",
    icon: "fa-square-poll-vertical",
    description: "Create site-wide polls and track vote progress.",
  },
  {
    href: "/admin-panel/blog",
    label: "Blog",
    icon: "fa-newspaper",
    description: "Write and publish articles with BBCode formatting and images.",
  },
  {
    href: "/admin-panel/privacy",
    label: "Privacy",
    icon: "fa-shield-halved",
    description: "Edit the privacy policy shown at /privacy.",
  },
  {
    href: "/admin-panel/rules",
    label: "Rules",
    icon: "fa-scale-balanced",
    description: "Edit the site rules shown at /rules.",
  },
  {
    href: "/admin-panel/cookie",
    label: "Cookie",
    icon: "fa-cookie-bite",
    description: "Edit cookie rules, the /cookie page, and the first-visit popup.",
  },
  {
    href: "/admin-panel/settings",
    label: "Settings",
    icon: "fa-gear",
    description: "Configure site-wide defaults such as date and time formats.",
  },
  {
    href: "/admin-panel/support",
    label: "Support",
    icon: "fa-life-ring",
    description: "Review user support tickets and update their status.",
  },
  {
    href: "/admin-panel/suggestions",
    label: "Suggestions",
    icon: "fa-lightbulb",
    description: "Review user feature ideas and mark acceptance status.",
  },
  {
    href: "/admin-panel/todo",
    label: "Todo",
    icon: "fa-list-check",
    description: "Track admin tasks with drag-and-drop columns.",
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
