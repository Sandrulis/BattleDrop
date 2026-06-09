import type { BlogArticle, UpdateBlogArticleInput } from "@/app/lib/blog/blog-types";
import { mapBlogArticleRow } from "@/app/lib/blog/map-blog-article-row";
import {
  normalizeBlogContent,
  normalizeBlogDescription,
  normalizeBlogTitle,
} from "@/app/lib/blog/normalize-blog-input";
import { buildUniqueBlogSlug } from "@/app/lib/blog/slugify-blog-title";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function updateBlogArticle(
  articleId: string,
  input: UpdateBlogArticleInput,
): Promise<BlogArticle> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("blog_articles")
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .eq("id", articleId)
    .maybeSingle();

  if (existingError || !existing) {
    throw new Error("Blog article not found.");
  }

  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) {
    const title = normalizeBlogTitle(input.title);
    updates.title = title;

    if (title !== existing.title) {
      const { data: slugRows } = await admin
        .from("blog_articles")
        .select("slug")
        .neq("id", articleId);

      updates.slug = buildUniqueBlogSlug(
        title,
        (slugRows ?? []).map((row) => row.slug),
      );
    }
  }

  if (input.description !== undefined) {
    updates.description = normalizeBlogDescription(input.description);
  }

  if (input.content !== undefined) {
    updates.content = normalizeBlogContent(input.content);
  }

  if (input.published !== undefined) {
    updates.published = input.published;

    if (input.published && !existing.published) {
      updates.published_at = new Date().toISOString();
    }

    if (!input.published) {
      updates.published_at = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return mapBlogArticleRow(existing);
  }

  const { data, error } = await admin
    .from("blog_articles")
    .update(updates)
    .eq("id", articleId)
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update blog article.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "blog_article.update",
    entityType: "blog_article",
    entityId: data.id,
    metadata: {
      title: data.title,
      slug: data.slug,
      published: data.published,
    },
  });

  return mapBlogArticleRow(data);
}
