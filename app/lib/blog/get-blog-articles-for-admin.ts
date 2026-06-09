import type { BlogArticle } from "@/app/lib/blog/blog-types";
import { mapBlogArticleRow } from "@/app/lib/blog/map-blog-article-row";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getBlogArticlesForAdmin(): Promise<BlogArticle[]> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_articles")
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapBlogArticleRow);
}
