export type AdminAlertCounts = {
  support: number;
  suggestions: number;
};

export const EMPTY_ADMIN_ALERT_COUNTS: AdminAlertCounts = {
  support: 0,
  suggestions: 0,
};

export type AdminAlertBadgeKey = keyof AdminAlertCounts;

export function getTotalAdminAlertCount(counts: AdminAlertCounts): number {
  return counts.support + counts.suggestions;
}

export const ADMIN_PANEL_ALERT_BADGE_KEYS: Partial<
  Record<string, AdminAlertBadgeKey>
> = {
  "/admin-panel/support": "support",
  "/admin-panel/suggestions": "suggestions",
};
