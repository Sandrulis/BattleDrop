import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteBlogArticle } from "@/app/lib/blog/delete-blog-article";
import { updateBlogArticle } from "@/app/lib/blog/update-blog-article";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UpdateBlogBody = {
  title?: string;
  description?: string;
  content?: string;
  published?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: UpdateBlogBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const article = await updateBlogArticle(id, body);
    revalidateTag("blog", "max");
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    return NextResponse.json(article);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update blog article.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteBlogArticle(id);
    revalidateTag("blog", "max");
    revalidatePath("/blog");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete blog article.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
