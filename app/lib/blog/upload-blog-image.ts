import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MIME_TYPES,
  BLOG_IMAGES_BUCKET,
} from "@/app/lib/blog/blog-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export async function uploadBlogImage(file: File) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  if (!BLOG_IMAGE_MIME_TYPES.includes(file.type as (typeof BLOG_IMAGE_MIME_TYPES)[number])) {
    throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed.");
  }

  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("Image must be at most 5 MB.");
  }

  const extension = EXTENSION_BY_MIME[file.type] ?? "jpg";
  const objectPath = `${crypto.randomUUID()}.${extension}`;

  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message ?? "Could not upload image.");
  }

  const { data } = admin.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(objectPath);

  return {
    url: data.publicUrl,
    path: objectPath,
  };
}
