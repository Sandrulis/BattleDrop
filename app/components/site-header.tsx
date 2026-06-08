import Link from "next/link";
import { getUserAvailableAffiliates } from "@/app/lib/affiliates/get-user-available-affiliates";
import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";
import { getSiteMonogram, getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getUserCommentUpvoteCount } from "@/app/lib/product-comments";
import { headerSubmitLinkClassName } from "./header-control-styles";
import { HeaderActions } from "./header-actions";
import { UserAffiliateBalance } from "./user-affiliate-balance";
import { UserCommentUpvoteBalance } from "./user-comment-upvote-balance";
import { UserPointsBalance } from "./user-points-balance";

export async function SiteHeader() {
  const { siteName } = await getSiteSettings();
  let user = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  const [appUser, affiliatesEnabled, shopEnabled] = await Promise.all([
    user ? getCurrentAppUser() : Promise.resolve(null),
    isAffiliatesEnabled(),
    isShopEnabled(),
  ]);
  const [commentUpvoteCount, availableAffiliates] = appUser
    ? await Promise.all([
        getUserCommentUpvoteCount(appUser.id),
        affiliatesEnabled
          ? getUserAvailableAffiliates(appUser.id)
          : Promise.resolve(0),
      ])
    : [0, 0];
  const monogram = getSiteMonogram(siteName);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da552f] text-sm font-bold text-white shadow-sm">
              {monogram}
            </span>
            <span className="hidden truncate text-lg font-semibold tracking-tight text-zinc-900 min-[400px]:inline">
              {siteName}
            </span>
          </Link>
          <Link
            href="/archive"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 md:inline-flex"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
            Archive
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/submit" className={`${headerSubmitLinkClassName} hidden md:inline-flex`}>
            <i className="fas fa-plus text-[11px] text-zinc-500" aria-hidden />
            Submit product
          </Link>
          {appUser ? (
            <div className="hidden items-center gap-2 md:flex">
              <UserPointsBalance points={appUser.points} />
              <UserCommentUpvoteBalance count={commentUpvoteCount} />
              {affiliatesEnabled ? (
                <UserAffiliateBalance count={availableAffiliates} />
              ) : null}
            </div>
          ) : null}
          <HeaderActions
            user={user}
            isAdmin={appUser?.is_admin ?? false}
            affiliatesEnabled={affiliatesEnabled}
            shopEnabled={shopEnabled}
            avatarUrl={appUser?.avatar_url}
            displayName={appUser?.full_name}
            points={appUser?.points}
            commentUpvoteCount={appUser ? commentUpvoteCount : undefined}
            availableAffiliates={
              appUser && affiliatesEnabled ? availableAffiliates : undefined
            }
          />
        </div>
      </div>
    </header>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
