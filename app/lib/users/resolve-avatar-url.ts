type AvatarMetadata = {
  avatar_url?: unknown;
  picture?: unknown;
};

export function resolveAvatarUrl(
  avatarUrl?: string | null,
  metadata?: AvatarMetadata | null,
): string | null {
  const candidates = [avatarUrl, metadata?.avatar_url, metadata?.picture];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}
