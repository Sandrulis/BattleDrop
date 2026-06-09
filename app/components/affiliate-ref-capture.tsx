"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isMarketingCookiesAllowed } from "@/app/lib/cookie-consent/apply-cookie-preferences";
import { AFFILIATE_REF_COOKIE } from "@/app/lib/affiliates/affiliate-types";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function AffiliateRefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isMarketingCookiesAllowed()) return;

    const ref = searchParams.get("ref")?.trim().toLowerCase();
    if (!ref || ref.length > 64 || !/^[a-z0-9_-]+$/.test(ref)) return;

    document.cookie = `${AFFILIATE_REF_COOKIE}=${encodeURIComponent(ref)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  }, [searchParams]);

  return null;
}
