import type { Metadata } from "next";
import { ArchiveCalendar } from "../components/archive-calendar";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Season Archive",
  description: "Browse weekly battle winners for every week of the year.",
};

export default function ArchivePage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Season archive
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Battle calendar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Every week of the year, one winner. Switch years to explore past
            seasons and see who took each week.
          </p>

          <div className="mt-8">
            <ArchiveCalendar />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
