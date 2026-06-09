import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { BlogArticle } from "@/app/lib/blog/blog-types";
import { mapBlogArticleRow } from "@/app/lib/blog/map-blog-article-row";
import { createAdminClient } from "@/app/lib/supabase/admin";

async function fetchPublishedBlogArticles(): Promise<BlogArticle[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_articles")
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapBlogArticleRow);
}

const getCachedPublishedBlogArticles = unstable_cache(
  fetchPublishedBlogArticles,
  ["blog-articles-published"],
  { tags: ["blog"] },
);

export const getPublishedBlogArticles = cache(async (): Promise<BlogArticle[]> => {
  return getCachedPublishedBlogArticles();
});

export async function getBlogArticleBySlug(
  slug: string,
): Promise<BlogArticle | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_articles")
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  return mapBlogArticleRow(data);
}

export async function hasPublishedBlogArticles(): Promise<boolean> {
  const articles = await getPublishedBlogArticles();
  return articles.length > 0;
}
