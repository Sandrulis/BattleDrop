export function slugifyBlogTitle(title: string) {
  return title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function buildUniqueBlogSlug(title: string, existingSlugs: string[]) {
  const base = slugifyBlogTitle(title);

  if (!base) {
    throw new Error("Title must contain at least one letter or number.");
  }

  const taken = new Set(existingSlugs.map((slug) => slug.toLowerCase()));

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}
