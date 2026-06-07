type MakerUser = {
  full_name: string | null;
  email: string | null;
};

export function formatMakerHandle(user: MakerUser): string {
  if (user.full_name?.trim()) {
    const handle = user.full_name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return handle ? `@${handle}` : "@founder";
  }

  if (user.email) {
    const local = user.email.split("@")[0] ?? "founder";
    return `@${local.replace(/[^a-z0-9_]+/gi, "_").toLowerCase()}`;
  }

  return "@founder";
}
