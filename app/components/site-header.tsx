import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#da552f] text-sm font-bold text-white shadow-sm">
            BD
          </span>
          <span className="hidden truncate text-lg font-semibold tracking-tight text-zinc-900 min-[400px]:inline">
            BattleDrop
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
            href="/#how"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            How it works
          </Link>
          <Link
            href="/#hall"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Hall of Fame
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
          <button
            type="button"
            className="hidden rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 md:inline-flex"
          >
            Submit product · €5
          </button>
          <MobileNav />
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:h-auto sm:px-3.5"
          >
            <GoogleIcon />
            <span className="hidden sm:inline">Sign in</span>
          </button>
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
