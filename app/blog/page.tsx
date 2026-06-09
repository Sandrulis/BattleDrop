import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { BlogArticleList } from "@/app/components/blog-article-list";
import { getPublishedBlogArticles } from "@/app/lib/blog/get-published-blog-articles";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles and updates from the team.",
};

export default async function BlogIndexPage() {
  const [articles, user, siteSettings] = await Promise.all([
    getPublishedBlogArticles(),
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
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Blog
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
          News, guides, and updates from {siteSettings.siteName}.
        </p>

        <div className="mt-8">
          <BlogArticleList articles={articles} dateSettings={dateSettings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
