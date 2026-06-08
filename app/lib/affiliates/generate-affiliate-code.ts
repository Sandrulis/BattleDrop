import { randomBytes } from "crypto";

export function generateAffiliateCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8).toLowerCase();
}
