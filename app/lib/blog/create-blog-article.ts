import type {
  BlogArticle,
  CreateBlogArticleInput,
} from "@/app/lib/blog/blog-types";
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

export async function createBlogArticle(
  input: CreateBlogArticleInput,
): Promise<BlogArticle> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const title = normalizeBlogTitle(input.title);
  const description = normalizeBlogDescription(input.description ?? "");
  const content = normalizeBlogContent(input.content);
  const published = input.published === true;

  const admin = createAdminClient();
  const { data: existingRows } = await admin.from("blog_articles").select("slug");

  const slug = buildUniqueBlogSlug(
    title,
    (existingRows ?? []).map((row) => row.slug),
  );

  const { data, error } = await admin
    .from("blog_articles")
    .insert({
      slug,
      title,
      description,
      content,
      published,
      published_at: published ? new Date().toISOString() : null,
      author_id: currentUser.id,
    })
    .select(
      "id, slug, title, description, content, published, published_at, author_id, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create blog article.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "blog_article.create",
    entityType: "blog_article",
    entityId: data.id,
    metadata: { title: data.title, slug: data.slug, published },
  });

  return mapBlogArticleRow(data);
}
