import type { BlogArticle, BlogArticleRow } from "@/app/lib/blog/blog-types";

export function mapBlogArticleRow(row: BlogArticleRow): BlogArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    published: row.published,
    publishedAt: row.published_at,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
