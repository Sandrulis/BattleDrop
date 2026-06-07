export const BUY_POINTS_PATH = "/buy-points";

export const INSUFFICIENT_POINTS_STATUS = 402;

export function buildBuyPointsPath(returnTo?: string): string {
  if (!returnTo) return BUY_POINTS_PATH;

  return `${BUY_POINTS_PATH}?return=${encodeURIComponent(returnTo)}`;
}
