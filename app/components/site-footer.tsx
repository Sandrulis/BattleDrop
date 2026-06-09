import Link from "next/link";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { hasPublishedBlogArticles } from "@/app/lib/blog/get-published-blog-articles";
import {
  hasPublishedCookiePage,
  hasPublishedPrivacyPage,
  hasPublishedRulesPage,
} from "@/app/lib/site-legal-pages/get-site-legal-pages";

export async function SiteFooter() {
  const [{ siteName }, showBlog, showPrivacy, showRules, showCookie] =
    await Promise.all([
      getSiteSettings(),
      hasPublishedBlogArticles(),
      hasPublishedPrivacyPage(),
      hasPublishedRulesPage(),
      hasPublishedCookiePage(),
    ]);

  return (
    <footer className="mt-6 border-t border-zinc-200 bg-white py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} {siteName} · Weekly · Monthly · Annual
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-zinc-500 sm:justify-end">
          {showBlog ? (
            <Link href="/blog" className="hover:text-zinc-800">
              Blog
            </Link>
          ) : null}
          {showPrivacy ? (
            <Link href="/privacy" className="hover:text-zinc-800">
              Privacy
            </Link>
          ) : null}
          {showRules ? (
            <Link href="/rules" className="hover:text-zinc-800">
              Rules
            </Link>
          ) : null}
          {showCookie ? (
            <Link href="/cookie" className="hover:text-zinc-800">
              Cookie
            </Link>
          ) : null}
          <Link href="/support" className="hover:text-zinc-800">
            Support
          </Link>
          <Link href="/suggestions" className="hover:text-zinc-800">
            Suggestions
          </Link>
          <Link href="/submit" className="hover:text-zinc-800">
            Submit
          </Link>
        </div>
      </div>
    </footer>
  );
}
