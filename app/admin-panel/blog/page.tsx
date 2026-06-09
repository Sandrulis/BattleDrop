import type { Metadata } from "next";
import { AdminBlogPanel } from "@/app/components/admin-blog-panel";
import { getBlogArticlesForAdmin } from "@/app/lib/blog/get-blog-articles-for-admin";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Blog — Admin Panel",
};

export default async function AdminBlogPage() {
  const [articles, user, siteSettings] = await Promise.all([
    getBlogArticlesForAdmin(),
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  const dateSettings = resolveEffectiveDateTimeSettings(
    {
      dateFormat: siteSettings.dateFormat,
      timeFormat: siteSettings.timeFormat,
      dateSeparator: siteSettings.dateSeparator,
    },
    user
      ? {
          dateFormat: user.date_format,
          timeFormat: user.time_format,
          dateSeparator: user.date_separator,
        }
      : undefined,
  );

  return (
    <AdminBlogPanel initialArticles={articles} dateSettings={dateSettings} />
  );
}
