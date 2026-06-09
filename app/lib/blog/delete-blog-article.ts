import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function deleteBlogArticle(articleId: string) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("blog_articles")
    .select("id, title, slug")
    .eq("id", articleId)
    .maybeSingle();

  if (existingError || !existing) {
    throw new Error("Blog article not found.");
  }

  const { error } = await admin.from("blog_articles").delete().eq("id", articleId);

  if (error) {
    throw new Error(error.message ?? "Could not delete blog article.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "blog_article.delete",
    entityType: "blog_article",
    entityId: existing.id,
    metadata: { title: existing.title, slug: existing.slug },
  });
}
