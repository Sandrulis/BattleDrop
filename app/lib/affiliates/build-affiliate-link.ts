import { getSiteUrl } from "@/app/lib/site-url";

export function buildAffiliateLink(affiliateCode: string): string {
  const url = new URL(getSiteUrl());
  url.searchParams.set("ref", affiliateCode);
  return url.toString();
}
