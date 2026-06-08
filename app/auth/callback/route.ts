import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AFFILIATE_REF_COOKIE } from "@/app/lib/affiliates/affiliate-types";
import { claimAffiliateReferral } from "@/app/lib/affiliates/claim-affiliate-referral";
import { getSafeRedirectPath } from "@/app/lib/security/safe-redirect-path";
import { createClient } from "@/app/lib/supabase/server";
import { syncUserFromAuth } from "@/app/lib/users/sync-user";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncUserFromAuth(user);

        const cookieStore = await cookies();
        const refCode = cookieStore.get(AFFILIATE_REF_COOKIE)?.value;
        if (refCode) {
          await claimAffiliateReferral(user.id, decodeURIComponent(refCode));
        }
      }
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
