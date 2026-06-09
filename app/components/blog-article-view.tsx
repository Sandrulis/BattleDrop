import Link from "next/link";
import { BbcodeContent } from "@/app/components/bbcode-content";
import type { BlogArticle } from "@/app/lib/blog/blog-types";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

type BlogArticleViewProps = {
  article: BlogArticle;
  dateSettings: SiteDateTimeSettings;
};

export function BlogArticleView({ article, dateSettings }: BlogArticleViewProps) {
  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
      >
        <i className="fas fa-arrow-left text-xs" aria-hidden />
        Back to blog
      </Link>

      <header className="mt-6 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {article.title}
        </h1>
        {article.description ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600">
            {article.description}
          </p>
        ) : null}
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt}
            className="mt-4 block text-sm text-zinc-500"
          >
            {formatDisplayDateTime(article.publishedAt, dateSettings)}
          </time>
        ) : null}
      </header>

      <div className="mt-8">
        <BbcodeContent source={article.content} />
      </div>
    </article>
  );
}
