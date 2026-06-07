export type AdminBattlesNavItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

export const ADMIN_BATTLES_NAV: AdminBattlesNavItem[] = [
  {
    href: "/admin-panel/battles/weekly",
    label: "Weekly",
    description: "Manage weekly battle entries, voting, and winners.",
    icon: "fa-calendar-week",
  },
  {
    href: "/admin-panel/battles/monthly",
    label: "Monthly",
    description: "Review monthly champions and championship standings.",
    icon: "fa-calendar",
  },
  {
    href: "/admin-panel/battles/yearly",
    label: "Yearly",
    description: "Oversee annual battles and Hall of Fame results.",
    icon: "fa-trophy",
  },
];
