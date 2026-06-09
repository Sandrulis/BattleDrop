import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createBlogArticle } from "@/app/lib/blog/create-blog-article";
import { getBlogArticlesForAdmin } from "@/app/lib/blog/get-blog-articles-for-admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type CreateBlogBody = {
  title?: string;
  description?: string;
  content?: string;
  published?: boolean;
};

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const articles = await getBlogArticlesForAdmin();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: CreateBlogBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const article = await createBlogArticle({
      title: body.title ?? "",
      description: body.description ?? "",
      content: body.content ?? "",
      published: body.published,
    });

    revalidateTag("blog", "max");
    return NextResponse.json(article);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create blog article.";
    const status =
      message.includes("required") ||
      message.includes("must") ||
      message.includes("Admin")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
