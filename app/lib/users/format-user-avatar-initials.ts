export function formatUserAvatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const withoutAt = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  const parts = withoutAt.split(/[_\s.-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return withoutAt.charAt(0).toUpperCase() || "?";
}
