export type SiteLegalPageKey = "privacy" | "rules" | "cookie";

export type SiteLegalPages = {
  privacyContent: string | null;
  rulesContent: string | null;
  cookieContent: string | null;
};

export type SiteLegalPagesRow = {
  privacy_content: string | null;
  rules_content: string | null;
  cookie_content: string | null;
};

export const SITE_LEGAL_PAGE_LABELS: Record<SiteLegalPageKey, string> = {
  privacy: "Privacy",
  rules: "Rules",
  cookie: "Cookie",
};

export const SITE_LEGAL_PAGE_PATHS: Record<SiteLegalPageKey, string> = {
  privacy: "/privacy",
  rules: "/rules",
  cookie: "/cookie",
};

export const SITE_LEGAL_PAGE_CONTENT_KEYS: Record<
  SiteLegalPageKey,
  keyof SiteLegalPages
> = {
  privacy: "privacyContent",
  rules: "rulesContent",
  cookie: "cookieContent",
};
export function hasLegalPageContent(content: string | null | undefined): boolean {
  return typeof content === "string" && content.trim().length > 0;
}
