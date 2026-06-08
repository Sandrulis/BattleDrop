export function computePromoteExpiresAt(
  durationHours: number,
  from: Date = new Date(),
): Date {
  return new Date(from.getTime() + durationHours * 60 * 60 * 1000);
}

export function formatPromoteDurationLabel(hours: number) {
  if (hours % 24 === 0 && hours >= 24) {
    const days = hours / 24;
    return days === 1 ? "1 day" : `${days} days`;
  }

  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function isPromotedSlotActive(
  expiresAt: string | Date,
  now: Date = new Date(),
): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;

  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > now.getTime();
}
