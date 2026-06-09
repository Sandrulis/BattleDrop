import Link from "next/link";
import type { BlogArticle } from "@/app/lib/blog/blog-types";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

type BlogArticleListProps = {
  articles: BlogArticle[];
  dateSettings: SiteDateTimeSettings;
};

export function BlogArticleList({ articles, dateSettings }: BlogArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-zinc-700">No articles yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Check back soon for updates from the team.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            href={`/blog/${article.slug}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/50"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                  {article.title}
                </h2>
                {article.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {article.description}
                  </p>
                ) : null}
              </div>
              {article.publishedAt ? (
                <time
                  dateTime={article.publishedAt}
                  className="shrink-0 text-xs font-medium text-zinc-500"
                >
                  {formatDisplayDateTime(article.publishedAt, dateSettings)}
                </time>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
