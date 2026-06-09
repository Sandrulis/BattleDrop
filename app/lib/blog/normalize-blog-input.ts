import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";

export function normalizeBlogTitle(value: string) {
  const title = value.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  assertMaxLength(title, INPUT_LIMITS.blogTitle, "Title");
  return title;
}

export function normalizeBlogDescription(value: string) {
  const description = value.trim();
  assertMaxLength(description, INPUT_LIMITS.blogDescription, "Description");
  return description;
}

export function normalizeBlogContent(value: string) {
  const content = value.trim();

  if (!content) {
    throw new Error("Content is required.");
  }

  assertMaxLength(content, INPUT_LIMITS.blogContent, "Content");
  return content;
}
