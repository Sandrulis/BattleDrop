import Link from "next/link";
import { getSiteMonogram, getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { HeaderActions } from "./header-actions";
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

  const appUser = user ? await getCurrentAppUser() : null;
  const monogram = getSiteMonogram(siteName);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da552f] text-sm font-bold text-white shadow-sm">
            {monogram}
          </span>
          <span className="hidden truncate text-lg font-semibold tracking-tight text-zinc-900 min-[400px]:inline">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/#month"
            className="nav-month-link relative inline-flex items-center gap-1.5 rounded-md bg-[#da552f]/5 px-2.5 py-1 font-semibold text-[#da552f] transition-colors hover:bg-[#da552f]/10"
            title="Monthly championship — voting open"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#da552f] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#da552f]" />
            </span>
            This Month
          </Link>
          <Link
            href="/#battle"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            This week
          </Link>
          <Link
            href="/archive"
            className="inline-flex items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
            Archive
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/submit"
            className="hidden cursor-pointer rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 md:inline-flex"
          >
            Submit product
          </Link>
          {appUser ? (
            <UserPointsBalance points={appUser.points} />
          ) : null}
          <HeaderActions
            user={user}
            isAdmin={appUser?.is_admin ?? false}
            avatarUrl={appUser?.avatar_url}
            displayName={appUser?.full_name}
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
