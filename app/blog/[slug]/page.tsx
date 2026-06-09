import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { BlogArticleView } from "@/app/components/blog-article-view";
import { getBlogArticleBySlug } from "@/app/lib/blog/get-published-blog-articles";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: article.title,
    description: article.description || undefined,
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const [article, user, siteSettings] = await Promise.all([
    getBlogArticleBySlug(slug),
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  if (!article) notFound();

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
        <BlogArticleView article={article} dateSettings={dateSettings} />
      </main>
      <SiteFooter />
    </>
  );
}
