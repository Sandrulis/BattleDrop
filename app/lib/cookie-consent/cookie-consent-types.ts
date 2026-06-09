export type CookieCategoryKey = "functional" | "analytics" | "marketing";

export type CookiePreferences = Record<CookieCategoryKey, boolean>;

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  functional: false,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL_COOKIE_PREFERENCES: CookiePreferences = {
  functional: true,
  analytics: true,
  marketing: true,
};

export type CookieCategoryDefinition = {
  key: CookieCategoryKey | "necessary";
  label: string;
  description: string;
  required?: boolean;
};

export const COOKIE_CATEGORIES: CookieCategoryDefinition[] = [
  {
    key: "necessary",
    label: "Necessary cookies",
    description: "Required for sign-in, security, and core site features. Always active.",
    required: true,
  },
  {
    key: "functional",
    label: "Functional cookies",
    description: "Remember your display preferences and improve how the site works for you.",
  },
  {
    key: "analytics",
    label: "Analytics cookies",
    description: "Help us understand how visitors use BattleDrop so we can improve the product.",
  },
  {
    key: "marketing",
    label: "Marketing cookies",
    description:
      "Store referral codes (for example ?ref= links) so affiliates can be credited after sign-up.",
  },
];
