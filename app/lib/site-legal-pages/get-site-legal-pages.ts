import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import {
  hasLegalPageContent,
  SITE_LEGAL_PAGE_CONTENT_KEYS,
  type SiteLegalPageKey,
  type SiteLegalPages,
  type SiteLegalPagesRow,
} from "@/app/lib/site-legal-pages/site-legal-pages-types";

function mapSiteLegalPagesRow(row: SiteLegalPagesRow): SiteLegalPages {
  return {
    privacyContent: row.privacy_content,
    rulesContent: row.rules_content,
    cookieContent: row.cookie_content,
  };
}

async function fetchSiteLegalPagesFromDb(): Promise<SiteLegalPages> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("privacy_content, rules_content, cookie_content")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return { privacyContent: null, rulesContent: null, cookieContent: null };
  }

  return mapSiteLegalPagesRow(data as SiteLegalPagesRow);
}

const getCachedSiteLegalPages = unstable_cache(
  fetchSiteLegalPagesFromDb,
  ["site-legal-pages"],
  { tags: ["site-legal-pages"] },
);

export const getSiteLegalPages = cache(async (): Promise<SiteLegalPages> => {
  return getCachedSiteLegalPages();
});

export async function getSiteLegalPageContent(
  page: SiteLegalPageKey,
): Promise<string | null> {
  const pages = await getSiteLegalPages();
  const content = pages[SITE_LEGAL_PAGE_CONTENT_KEYS[page]];

  return hasLegalPageContent(content) ? content!.trim() : null;
}

export async function hasPublishedPrivacyPage(): Promise<boolean> {
  const pages = await getSiteLegalPages();
  return hasLegalPageContent(pages.privacyContent);
}

export async function hasPublishedRulesPage(): Promise<boolean> {
  const pages = await getSiteLegalPages();
  return hasLegalPageContent(pages.rulesContent);
}

export async function hasPublishedCookiePage(): Promise<boolean> {
  const pages = await getSiteLegalPages();
  return hasLegalPageContent(pages.cookieContent);
}
