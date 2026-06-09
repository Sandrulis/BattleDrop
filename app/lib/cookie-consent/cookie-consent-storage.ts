import {
  ACCEPT_ALL_COOKIE_PREFERENCES,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieCategoryKey,
  type CookiePreferences,
} from "@/app/lib/cookie-consent/cookie-consent-types";

export const COOKIE_PREFERENCES_STORAGE_KEY = "battledrop-cookie-preferences";
const LEGACY_COOKIE_CONSENT_KEY = "battledrop-cookie-consent";
const LEGACY_COOKIE_CONSENT_SEEN_KEY = "battledrop-cookie-consent-seen";

function normalizeCookiePreferences(value: unknown): CookiePreferences | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const preferences = { ...DEFAULT_COOKIE_PREFERENCES };

  for (const key of Object.keys(preferences) as CookieCategoryKey[]) {
    if (typeof record[key] === "boolean") {
      preferences[key] = record[key];
    }
  }

  return preferences;
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY);
  if (stored) {
    try {
      return normalizeCookiePreferences(JSON.parse(stored));
    } catch {
      return null;
    }
  }

  const legacyChoice = localStorage.getItem(LEGACY_COOKIE_CONSENT_KEY);
  if (legacyChoice === "accepted") {
    return { ...ACCEPT_ALL_COOKIE_PREFERENCES };
  }
  if (legacyChoice === "rejected") {
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }
  if (localStorage.getItem(LEGACY_COOKIE_CONSENT_SEEN_KEY) === "1") {
    return { ...ACCEPT_ALL_COOKIE_PREFERENCES };
  }

  return null;
}

export function hasCookieConsentBeenSeen(): boolean {
  return getCookiePreferences() !== null;
}

export function setCookiePreferences(preferences: CookiePreferences): void {
  localStorage.setItem(
    COOKIE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
  localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  localStorage.removeItem(LEGACY_COOKIE_CONSENT_SEEN_KEY);
}
