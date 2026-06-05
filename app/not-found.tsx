import Link from "next/link";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-6xl font-bold tabular-nums text-[#da552f] sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          This battle doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
          The page you&apos;re looking for was removed, never launched, or the
          URL is wrong. Head back to this week&apos;s vote.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#da552f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c44a28]"
          >
            Back to this week
          </Link>
          <Link
            href="/archive"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Browse archive
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
