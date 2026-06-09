import type { Metadata } from "next";
import { getCurrentIsoWeek } from "@/app/lib/battle-week";
import { getHomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import {
  getArchiveYearData,
  getAvailableArchiveYears,
} from "@/app/lib/archive";
import { ArchiveCalendar } from "../components/archive-calendar";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Season Archive",
  description: "Browse weekly battle winners for every week of the year.",
};

type ArchivePageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { year: yearParam } = await searchParams;
  const { year: currentYear } = getCurrentIsoWeek();

  const [years, homeBattleWeek] = await Promise.all([
    getAvailableArchiveYears(),
    getHomeBattleWeek(),
  ]);

  const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : currentYear;
  const year =
    Number.isFinite(parsedYear) && years.includes(parsedYear)
      ? parsedYear
      : currentYear;

  const weeks = await getArchiveYearData(year, homeBattleWeek);

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
            Every week of the year, top 5 projects from real battles. Switch
            years to explore past seasons.
          </p>

          <div className="mt-8">
            <ArchiveCalendar
              years={years}
              year={year}
              weeks={weeks}
              homeBattleYear={homeBattleWeek.battle.year}
              homeBattleWeek={homeBattleWeek.battle.week}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
