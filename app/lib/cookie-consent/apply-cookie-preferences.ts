import { AFFILIATE_REF_COOKIE } from "@/app/lib/affiliates/affiliate-types";
import { getCookiePreferences } from "@/app/lib/cookie-consent/cookie-consent-storage";
import type {
  CookieCategoryKey,
  CookiePreferences,
} from "@/app/lib/cookie-consent/cookie-consent-types";

function deleteClientCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function isCookieCategoryAllowed(
  category: CookieCategoryKey,
): boolean {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  return preferences[category];
}

export function isMarketingCookiesAllowed(): boolean {
  return isCookieCategoryAllowed("marketing");
}

export function applyCookiePreferences(preferences: CookiePreferences): void {
  if (!preferences.marketing) {
    deleteClientCookie(AFFILIATE_REF_COOKIE);
  }

  window.dispatchEvent(
    new CustomEvent("battledrop-cookie-preferences", {
      detail: preferences,
    }),
  );
}
