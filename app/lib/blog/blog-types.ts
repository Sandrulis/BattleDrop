export type BlogArticleRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  published: boolean;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBlogArticleInput = {
  title: string;
  description: string;
  content: string;
  published?: boolean;
};

export type UpdateBlogArticleInput = {
  title?: string;
  description?: string;
  content?: string;
  published?: boolean;
};

export const BLOG_IMAGES_BUCKET = "blog-images";

export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const BLOG_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
