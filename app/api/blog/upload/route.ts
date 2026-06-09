import { NextResponse } from "next/server";
import { uploadBlogImage } from "@/app/lib/blog/upload-blog-image";
import { enforceRateLimit } from "@/app/lib/security/enforce-rate-limit";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const rateLimited = enforceRateLimit(request, "blog-upload", 30, 60_000);
  if (rateLimited) return rateLimited;

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  try {
    const result = await uploadBlogImage(file);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
