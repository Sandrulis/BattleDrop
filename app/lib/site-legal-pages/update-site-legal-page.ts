import { createAdminClient } from "@/app/lib/supabase/admin";
import {
  assertMaxLength,
  INPUT_LIMITS,
} from "@/app/lib/security/input-limits";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import {
  hasLegalPageContent,
  SITE_LEGAL_PAGE_LABELS,
  type SiteLegalPageKey,
  type SiteLegalPages,
} from "@/app/lib/site-legal-pages/site-legal-pages-types";

function normalizeLegalPageContent(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const UPDATE_COLUMN_BY_PAGE: Record<SiteLegalPageKey, string> = {
  privacy: "privacy_content",
  rules: "rules_content",
  cookie: "cookie_content",
};

export async function updateSiteLegalPage(
  page: SiteLegalPageKey,
  content: unknown,
): Promise<SiteLegalPages> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const normalizedContent = normalizeLegalPageContent(content);
  if (normalizedContent) {
    assertMaxLength(
      normalizedContent,
      INPUT_LIMITS.siteLegalContent,
      `${SITE_LEGAL_PAGE_LABELS[page]} content`,
    );
  }

  const admin = createAdminClient();
  const updatePayload = {
    [UPDATE_COLUMN_BY_PAGE[page]]: normalizedContent,
  };

  const { data, error } = await admin
    .from("site_settings")
    .update(updatePayload)
    .eq("id", 1)
    .select("privacy_content, rules_content, cookie_content")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_legal_pages.update",
    entityType: "site_settings",
    entityId: "1",
    metadata: {
      page,
      hasContent: hasLegalPageContent(normalizedContent),
    },
  });

  return {
    privacyContent: data.privacy_content,
    rulesContent: data.rules_content,
    cookieContent: data.cookie_content,
  };
}
