import { createClient } from "@/app/lib/supabase/client";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
}

export async function signInWithGoogle(returnPath?: string) {
  const supabase = createClient();
  const callbackUrl = new URL(`${getSiteUrl()}/auth/callback`);

  if (returnPath?.startsWith("/")) {
    callbackUrl.searchParams.set("next", returnPath);
  }

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });
}
