import {
  DEFAULT_SITE_SETTINGS,
  formatSiteMoney,
  isCurrencyCode,
  type CurrencyCode,
} from "@/app/lib/site-settings-types";

export { formatSiteMoney, getCurrencySymbol, type CurrencyCode } from "@/app/lib/site-settings-types";

export function resolveCurrencyCode(currency?: CurrencyCode | null): CurrencyCode {
  if (currency && isCurrencyCode(currency)) {
    return currency;
  }

  return DEFAULT_SITE_SETTINGS.defaultCurrency;
}

export function formatDisplayMoney(
  amount: number,
  currency?: CurrencyCode | null,
): string {
  return formatSiteMoney(amount, resolveCurrencyCode(currency));
}

export function formatPointsAmount(amount: number): string {
  return Number.isInteger(amount) || amount % 1 === 0
    ? String(Math.round(amount))
    : amount.toFixed(2);
}

function pointsLabel(amount: number): string {
  return Number(formatPointsAmount(amount)) === 1 ? "point" : "points";
}

export function formatDisplayMoneyWithPoints(
  amount: number,
  currency?: CurrencyCode | null,
): string {
  return `${formatDisplayMoney(amount, currency)} or ${formatDisplayPoints(amount)}`;
}

export function formatDisplayPoints(amount: number): string {
  return `${formatPointsAmount(amount)} ${pointsLabel(amount)}`;
}
