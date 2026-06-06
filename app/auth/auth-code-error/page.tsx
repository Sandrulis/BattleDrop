import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

export default function AuthCodeErrorPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in failed</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Something went wrong while signing you in. Please try again.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
