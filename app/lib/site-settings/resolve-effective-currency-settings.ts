import type { CurrencyCode } from "@/app/lib/site-settings-types";

export type UserCurrencyPreference = {
  currency: CurrencyCode | null;
};

export function resolveEffectiveCurrency(
  siteDefaultCurrency: CurrencyCode,
  user?: UserCurrencyPreference | null,
): CurrencyCode {
  if (!user) return siteDefaultCurrency;
  return user.currency ?? siteDefaultCurrency;
}
